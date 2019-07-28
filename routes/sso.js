const {logger} = require("../util/logger");
const log = new logger("route_sso");

const express = require("express");
const router = express.Router();
const responseHelper = require("../util/response_helper");
const googleUtil = require("../util/google-util");
const daoUsers = require("../daos/dao_users");

router.get("/", async function(req, res, next) {
    try {
        const urlGoogle = googleUtil.urlGoogle();
        const responseJson = responseHelper.getResponseJson(req);
        responseJson.urlGoogle = urlGoogle;

        res.render("sso", responseJson);
    } catch (e) {
        next(e);
    }
});

router.get("/google/callback", async function(req, res, next) {
    try {
        log.info("facebook callback TBD");
    } catch (e) {
        next(e);
    }
});

router.get("/google/callback", async function(req, res, next) {
    try {
        const result = await googleUtil.getGoogleAccountFromCode(req.query.code);
        log.info(result.id);
        log.info(result.email);
        const urlGoogle = googleUtil.urlGoogle();
        let responseJson = responseHelper.getResponseJson(req);
        responseJson.urlGoogle = urlGoogle;
        responseJson.recipesSpotlight = [];
        responseJson.footerRecipes = [];

        req.session.ssoId = result.id;
        req.session.ssoEmail = result.email;
        req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 365; //one year
        req.session.userName = result.email.split("@")[0];
        req.session.userImageUrl = result.imageUrl;

        const user = await daoUsers.findByEmail(result.email);
        if (!user) {
            //the user does not exist, let's create a new one
            const user = {
                email: result.email,
                userName: req.session.userName,
            };
            log.info("The user " + result.email + " is not registered. Will be created");
            user.id = await daoUsers.create(user);
        } else {
            log.info("the user " + result.email + " is already registered");
        }
        req.session.user_id = user.id;
        req.session.is_user_admin = user.id === 1; //let's do this for now

        res.redirect("/");
    } catch (e) {
        next(e);
    }
});

module.exports = router;
