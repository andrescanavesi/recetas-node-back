var express = require("express");
var router = express.Router();
const daoRecipies = require("../daos/dao_recipies");

////////////////////////////////////////// cache //////////////////////////////////////////////////
const apicache = require("apicache");
const cacheOptions = {
  debug: false,
  defaultDuration: "5 minutes",
  enabled: false
};
apicache.options(cacheOptions);
const cache = apicache.middleware;
/////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/:id/:titleforurl", async function(req, res, next) {
  try {
    //titleforurl path param is for SEO purposes. It is ignored by the code
    const recipeId = req.params.id;
    const recipe = await daoRecipies.findById(recipeId);
    //const recipe = { title: "Im a recipe" };
    //recipe.id = recipeId;

    const json = {};
    json.title = "recetas-city.com";
    json.recipe = recipe;
    //console.log(json);
    res.render("recipe", json);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
