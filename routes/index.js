const express = require("express");
const router = express.Router();
const daoRecipies = require("../daos/dao_recipies");
const { responseJson, cache } = require("../util/configs");

/**
 * Home page
 */
router.get("/", async function(req, res, next) {
  try {
    const page = getPage(req);
    const recipes = await daoRecipies.find(page);
    const footerRecipes = await daoRecipies.findAll();

    if (!recipes) {
      throw Error("No recipes found");
    }
    responseJson.recipes = recipes;
    responseJson.isHomePage = true;
    responseJson.footerRecipes = footerRecipes;
    res.render("index", responseJson);
  } catch (e) {
    next(e);
  }
});

router.get("/recipes/keyword/:keyword", async function(req, res, next) {
  try {
    const recipes = await daoRecipies.findWithKeyword(req.params.keyword);
    const recipesSpotlight = await daoRecipies.findRecipesSpotlight();
    const footerRecipes = await daoRecipies.findAll();

    if (!recipes) {
      throw Error("No recipes found");
    }

    responseJson.recipes = recipes;
    responseJson.title = "Recipes of " + req.params.keyword + " | Recipes21";
    responseJson.description =
      "The best recipes of " + req.params.keyword + " | Recipes21";
    responseJson.linkToThisPage =
      process.env.R21_BASE_URL + "recipes/keyword/" + req.params.keyword;
    responseJson.isHomePage = false;
    responseJson.recipesSpotlight = recipesSpotlight;
    responseJson.footerRecipes = footerRecipes;

    res.render("index", responseJson);
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
