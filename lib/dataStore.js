var ce = require('aws-cost-explorer');
// load configuration from confif/default.json file
var costsApi = ce();
const config = require('config');
const NodeCache = require("node-cache");
let ttl = 86400; //seconds to store values
let checkperiod = 86200; //seconds to check if values have changed
if (config.has('CACHE') && config.has('CACHE.ttl') && config.has('CACHE.checkperiod')) {
    console.log("dataStore.js : using default config file");
    ttl = parseInt(config.get('CACHE.ttl'));
    checkperiod = parseInt(config.get('CACHE.checkperiod'));
} else {
    console.log("/config/default.json not found or config key CACHE is not defined.. using defaults (1 day ttl)");
}

const myCache = new NodeCache({
    stdTTL: ttl,
    checkperiod: checkperiod,
    deleteOnExpire: true
});


const getResults = (key, opts, callback) => {

    myCache.get(key, function (err, value) {
        if (!err) {
            if (value == undefined) {
                // key not found
                console.log("key [" + key + "] not found on cache, calling cost api..");
                if (key == "ytd") {
                    getYtd(opts, function (err, data) {

                        myCache.set(key, data, function (err, success) {
                            if (!err && success) {
                                console.log("key [" + key + "] stored in cache");
                            }
                        });
                        return callback(err, data);

                    });
                }
                if (key == "mtd") {
                    getTodayCosts(opts, function (err, data) {

                        myCache.set(key, data, function (err, success) {
                            if (!err && success) {
                                console.log("key [" + key + "] stored in cache");
                            }
                        });
                        return callback(err, data);

                    });
                }

                if (key == "lmt") {
                    getLastMonthCosts(opts, function (err, data) {

                        myCache.set(key, data, function (err, success) {
                            if (!err && success) {
                                console.log("key [" + key + "] stored in cache");
                            }
                        });
                        return callback(err, data);

                    });
                }

            } else {
                console.log("key [" + key + "] found on cache..");
                //{ my: "Special", variable: 42 }
                // ... do something ...
                return callback(err, value);
            }
        }
    });

};

function getYtd(opts, callback) {
    console.log("Cost Explorer API call for getYearToDate");
    return costsApi.getYearToDateCosts(opts, callback);
}

function getTodayCosts(opts, callback) {
    console.log("Cost Explorer API call for getTodayCosts");
    return costsApi.getMonthToDateCosts(opts, callback);
}

function getLastMonthCosts(opts, callback) {
    console.log("Cost Explorer API call for getYearToDate");
    return costsApi.getLastMonthCosts(opts, callback);
}



module.exports = {
    getResults: getResults
};