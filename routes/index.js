var express = require("express");
var router = express.Router();
const daoRecipies = require("../daos/dao_recipies");

////////////////////////////////////////// cache //////////////////////////////////////////////////
const apicache = require("apicache");
const cacheOptions = {};
cacheOptions.debug = process.env.RC_CACHE_DEBUG;
cacheOptions.enabled = process.env.RC_CACHE_ENABLED;
cacheOptions.defaultDuration = process.env.RC_CACHE_DURATION;
apicache.options(cacheOptions);
const cache = apicache.middleware;
/////////////////////////////////////////////////////////////////////////////////////////////////

/* GET home page. */
router.get("/", cache(), async function(req, res, next) {
  try {
    const page = getPage(req);
    const recipes = await daoRecipies.find(page);

    if (!recipes) {
      throw Error("No recipies found");
    }

    const json = {};
    json.title = "recetas-city.com";
    json.recipies = recipes;
    //console.log(json);
    res.render("index", json);
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
