const {logger} = require("../util/logger");
const log = new logger("configs");

const moment = require("moment");

//console.info("is production: " + responseJson.isProduction);

////////////////////////////////////////// cache //////////////////////////////////////////////////
const cacheDebug = process.env.R21_CACHE_DEBUG || false;
const cacheEnabled = process.env.R21_CACHE_ENABLED || false;
const apicache = require("apicache");
const cacheOptions = {};
cacheOptions.debug = JSON.parse(cacheDebug);
cacheOptions.enabled = JSON.parse(cacheEnabled);
cacheOptions.defaultDuration = "1 minute";
//log.info("cache options: ");
//log.info(cacheOptions);
apicache.options(cacheOptions);
/////////////////////////////////////////////////////////////////////////////////////////////////

module.exports.cache = apicache.middleware;
module.exports.apicache = apicache;
