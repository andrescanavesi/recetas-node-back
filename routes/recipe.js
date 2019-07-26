const express = require("express");
const router = express.Router();
const daoRecipies = require("../daos/dao_recipies");
const {cache} = require("../util/configs");
const responseHelper = require("../util/response_helper");
const utils = require("../util/utils");

router.get("/:id/:titleforurl", async function(req, res, next) {
    try {
        const recipeId = req.params.id;
        console.info("View recipe: " + req.params.id);
        let responseJson = responseHelper.getResponseJson(req);
        responseJson.displayMoreRecipes = true;

        //titleforurl path param is for SEO purposes. It is ignored by the code
        const recipe = await daoRecipies.findById(recipeId);
        const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
        const footerRecipes = await daoRecipies.findAll();
        recipe.im_owner = utils.imRecipeOwner(req, recipe);
        recipe.allow_edition = utils.allowEdition(req, recipe);
        responseJson.title = recipe.title;
        responseJson.recipe = recipe;
        responseJson.createdAt = recipe.created_at;
        responseJson.updatedAt = recipe.updated_at;
        responseJson.linkToThisPage = recipe.url;
        responseJson.description = recipe.description + " | recipes21.com";
        responseJson.metaImage = recipe.featured_image;
        responseJson.keywords = recipe.keywords_csv;
        responseJson.recipesSpotlight = recipesSpotlight;
        responseJson.isHomePage = false;
        responseJson.footerRecipes = footerRecipes;

        res.render("recipe", responseJson);
    } catch (e) {
        next(e);
    }
});

router.get("/new", async function(req, res, next) {
    try {
        let responseJson = responseHelper.getResponseJson(req);
        if (process.env.R21_IS_PRODUCTION === true && !responseJson.isUserAuthenticated) {
            res.redirect("/sso");
        } else {
            responseJson.recipe = {
                id: 0,
                title: "",
                featured_image_name: "default.jpg",
                active: false,
                title_for_url: "",
                ingredients_raw: "",
                description: "",
                steps_raw: "",
                keywords: "",
            };
            responseJson.newRecipe = true;
            responseJson.successMessage = null;
            res.render("recipe-edit", responseJson);
        }
    } catch (e) {
        next(e);
    }
});

router.get("/edit", async function(req, res, next) {
    //we cannot use /edit/:recipeId because there's already a route /:id/:title so it makes conflicts
    //that's why we receive the recipe id by query param instead of path param
    try {
        if (process.env.R21_IS_PRODUCTION === true && !responseJson.isUserAuthenticated) {
            res.redirect("/sso");
        } else {
            let responseJson = responseHelper.getResponseJson(req);
            const recipeId = req.query.id;
            const recipe = await daoRecipies.findById(recipeId, true);
            responseJson.recipe = recipe;
            res.render("recipe-edit", responseJson);
        }
    } catch (e) {
        next(e);
    }
});

router.post("/edit", async function(req, res, next) {
    try {
        let responseJson = responseHelper.getResponseJson(req);
        if (process.env.R21_IS_PRODUCTION === true && !responseJson.isUserAuthenticated) {
            res.redirect("/sso");
        } else {
            //TODO sanitize with express validator
            let recipeId = req.query.id;
            console.info("Recipe edit, id: " + recipeId);
            //console.info("Recipe title submited: " + recipeId + " " + req.body.title);
            //console.info(req.body);
            const userId = req.session.user_id || 1; //TODO change this
            const active = req.body.active === "active";
            const recipeToUdate = {
                id: recipeId,
                title: req.body.title,
                title_for_url: getTitleUrl(req.body.title),
                ingredients: req.body.ingredients,
                description: req.body.description,
                steps: req.body.steps,
                keywords: transformKeywords(req.body.keywords),
                featured_image_name: req.body.featured_image_name,
                user_id: userId,
                active: active,
            };
            //console.info(recipeToUdate);
            if (recipeId === "0") {
                recipeId = await daoRecipies.create(recipeToUdate);
            } else {
                await daoRecipies.update(recipeToUdate);
            }

            res.redirect("/recipe/edit?id=" + recipeId);
        }
    } catch (e) {
        next(e);
    }
});

/**
 *
 * @param {String} recipeTitle example: Double Layer Chocolate Peanut Butter Pie
 * @returns double-layer-chocolate-peanut-butter-Pie
 */
function getTitleUrl(recipeTitle) {
    return recipeTitle
        .toLowerCase()
        .replace(/[^\w ]+/g, "")
        .replace(/ +/g, "-");
}

function transformKeywords(keywordsCsv) {
    return keywordsCsv.toLowerCase();
}

// router.post("/publish-unpublish/:recipeId", async function(req, res, next) {
//     try {
//         let responseJson = responseHelper.getResponseJson(req);
//         if (process.env.R21_IS_PRODUCTION === true && !responseJson.isUserAuthenticated) {
//             res.redirect("/sso");
//         } else {
//             //TODO sanitize with express validator
//             let recipeId = req.params.recipeId;
//             const userId = req.session.user_id || 1; //TODO change this
//             const recipe = await daoRecipies.findById(recipeId);
//             await daoRecipies.activateDeactivate(!recipe.active);
//             res.redirect("/recipe/edit?id=" + recipeId);
//         }
//     } catch (e) {
//         next(e);
//     }
// });

module.exports = router;
