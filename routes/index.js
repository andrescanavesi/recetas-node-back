const {logger} = require("../util/logger");
const log = new logger("route_index");

const express = require("express");
const router = express.Router();
const daoRecipies = require("../daos/dao_recipies");
const daoEmailSubscription = require("../daos/dao_email_subscription");
const daoUsers = require("../daos/dao_users");
const {cache} = require("../util/configs");
const responseHelper = require("../util/response_helper");
const dbHelper = require("../daos/db_helper");
const utils = require("../util/utils");

const {check, validationResult} = require("express-validator");

router.get("/seed", async function(req, res, next) {
    try {
        if (req.query.adminSecret === process.env.R21_ADMIN_SECRET) {
            log.info("db seed....");
            await daoUsers.seed();
            await daoRecipies.seed(1);
            res.json({status: "ok"});
        } else {
            res.status(400);
            res.json({status: "error"});
        }
    } catch (e) {
        next(e);
    }
});

router.get("/reset-cache", async function(req, res, next) {
    try {
        if (req.query.adminSecret === process.env.R21_ADMIN_SECRET) {
            log.info("Reset cache....");
            await daoRecipies.resetCache();
            res.json({status: "ok"});
        } else {
            res.status(400);
            res.json({status: "error"});
        }
    } catch (e) {
        next(e);
    }
});

/**
 * Home page
 */
router.get("/", async function(req, res, next) {
    try {
        let responseJson = responseHelper.getResponseJson(req);
        responseJson.displayMoreRecipes = false;
        const page = getPage(req);

        const p1 = daoRecipies.findAll(page);
        const p2 = daoRecipies.findAll(page);
        const p3 = daoRecipies.findAll(page);

        const [recipes, footerRecipes, recipesSpotlight] = await Promise.all([p1, p2, p3]);

        if (!recipes) {
            throw Error("No recipes found");
        }
        for (let i = 0; i < recipes.length; i++) {
            recipes[i].im_owner = utils.imRecipeOwner(req, recipes[i]);
            recipes[i].allow_edition = utils.allowEdition(req, recipes[i]);
        }

        responseJson.recipes = recipes;
        responseJson.isHomePage = true;
        responseJson.footerRecipes = footerRecipes;
        responseJson.recipesSpotlight = recipesSpotlight;
        responseJson.searchText = "";
        res.render("index", responseJson);
    } catch (e) {
        next(e);
    }
});

router.get("/search", async function(req, res, next) {
    try {
        let responseJson = responseHelper.getResponseJson(req);
        responseJson.displayMoreRecipes = false;

        const phrase = req.query.q;
        if (!phrase) {
            throw Error("phrase query parameter empty");
        }
        log.info("searching by: " + phrase);

        if (daoRecipies.searchIndex.length === 0) {
            await daoRecipies.buildSearchIndex();
        }

        //search using flexsearch. It will return a list of IDs we used as keys during indexing
        const resultIds = await daoRecipies.searchIndex.search({
            query: phrase,
            suggest: true, //When suggestion is enabled all results will be filled up (until limit, default 1000) with similar matches ordered by relevance.
        });

        log.info("results: " + resultIds.length);
        let p1;
        if (resultIds.length === 0) {
            p1 = daoRecipies.findRecipesSpotlight();
        } else {
            p1 = daoRecipies.findByIds(resultIds);
        }

        const p2 = daoRecipies.findRecipesSpotlight();
        const p3 = daoRecipies.findAll();

        const [recipes, recipesSpotlight, footerRecipes] = await Promise.all([p1, p2, p3]);
        if (recipes.length === 0) {
            recipes = recipesSpotlight;
        }
        responseJson.recipes = recipes;
        responseJson.isHomePage = false;
        responseJson.recipesSpotlight = recipesSpotlight;
        responseJson.footerRecipes = footerRecipes;
        responseJson.searchText = phrase;

        res.render("index", responseJson);
    } catch (e) {
        next(e);
    }
});

router.get("/recipes/keyword/:keyword", async function(req, res, next) {
    try {
        let responseJson = responseHelper.getResponseJson(req);
        responseJson.displayMoreRecipes = true;
        log.info("recipes by keyword: " + req.params.keyword);
        const recipes = await daoRecipies.findWithKeyword(req.params.keyword);
        const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
        const footerRecipes = await daoRecipies.findAll();

        if (!recipes) {
            throw Error("No recipes found");
        }

        responseJson.recipes = recipes;
        responseJson.title = "Recipes of " + req.params.keyword + " | Recipes21";
        responseJson.description = "The best recipes of " + req.params.keyword + " | Recipes21";
        responseJson.linkToThisPage = process.env.R21_BASE_URL + "recipes/keyword/" + req.params.keyword;
        responseJson.isHomePage = false;
        responseJson.recipesSpotlight = recipesSpotlight;
        responseJson.footerRecipes = footerRecipes;

        res.render("index", responseJson);
    } catch (e) {
        next(e);
    }
});

router.get("/terms-and-conditions", async function(req, res, next) {
    let responseJson = responseHelper.getResponseJson(req);

    const p1 = daoRecipies.findAll();
    const [footerRecipes] = await Promise.all([p1]);

    responseJson.footerRecipes = footerRecipes;

    res.render("terms-and-conditions", responseJson);
});

router.get("/privacy-policy", async function(req, res, next) {
    let responseJson = responseHelper.getResponseJson(req);

    const p1 = daoRecipies.findAll();
    const [footerRecipes] = await Promise.all([p1]);

    responseJson.footerRecipes = footerRecipes;

    res.render("privacy-policy", responseJson);
});

router.get("/subscribe", async function(req, res, next) {
    let responseJson = responseHelper.getResponseJson(req);

    const p1 = daoRecipies.findAll();
    const p2 = daoRecipies.findRecipesSpotlight();
    const [footerRecipes, recipesSpotlight] = await Promise.all([p1, p2]);

    responseJson.displayMoreRecipes = true;
    responseJson.footerRecipes = footerRecipes;
    responseJson.recipesSpotlight = recipesSpotlight;

    res.render("subscribe", responseJson);
});

router.get("/subscription-done", async function(req, res, next) {
    let responseJson = responseHelper.getResponseJson(req);

    const p1 = daoRecipies.findAll();
    const p2 = daoRecipies.findRecipesSpotlight();
    const [footerRecipes, recipesSpotlight] = await Promise.all([p1, p2]);

    responseJson.displayMoreRecipes = true;
    responseJson.footerRecipes = footerRecipes;
    responseJson.recipesSpotlight = recipesSpotlight;

    res.render("subscription-done", responseJson);
});

router.post("/subscribe-email", async function(req, res, next) {
    try {
        let email = req.body.email;
        if (!email) {
            throw Error("Seems you forgot to write your email");
        }
        if (!utils.isEmailvalid(email)) {
            throw Error("Seems your email address is not valid");
        }
        log.info("Email to subscribe: " + email);
        try {
            await daoEmailSubscription.create(email);
        } catch (e2) {
            if (e2.constraint === "email_subscription_email_key") {
                log.warn("Email already registered");
                //in this case we do not throw an error to users
                //TODO re-subscribe in case it is deactivated
            } else {
                throw Error(e2);
            }
        }

        res.redirect("/subscription-done");
    } catch (e) {
        next(e);
    }
});

/**
 *
 * @param {http request} req
 */
function getPage(req) {
    let page = 0;
    if (req.query.page) {
        if (isNaN(req.query.page)) {
            throw Error("page is not a number");
        }
        page = parseInt(req.query.page);

        if (req.query.page < 0) {
            throw Error("page must be greater or equals to 0");
        }
    }
    return page;
}

module.exports = router;
