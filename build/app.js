"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/camelcase */
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var qs_1 = __importDefault(require("qs"));
var circular_json_1 = __importDefault(require("circular-json"));
var lru_cache_1 = __importDefault(require("lru-cache"));
var dotenv_1 = __importDefault(require("dotenv"));
var utils_js_1 = require("./utils.js");
var constants_1 = require("./constants");
dotenv_1.default.config();
var config = {
    DEFAULT_CURRENCY: 1,
    CACHE_OPTIONS: {
        max: 500,
        maxAge: 1000 * 60 * 60 // 1 hour
    },
    PROXY_URL: process.env.PROXY_URL
};
var app = express_1.default();
var cache = new lru_cache_1.default(config.CACHE_OPTIONS);
app.all("/*", function (req, res, next) {
    var allowedOrigins = ["http://127.0.0.1:8080", "http://localhost:8080"];
    var headers = req.headers;
    var index = allowedOrigins.findIndex(function (allowedOrigin) { return allowedOrigin === headers.origin; });
    if (index > -1) {
        res.header("Access-Control-Allow-Origin", headers.origin);
    }
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Cache-Control, no-cache");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    return next();
});
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
// Empty the cache on start
cache.reset();
var sendResponse = function (res, code, success, message, data) {
    if (data === void 0) { data = null; }
    res.status(code).send({
        success: success,
        message: message,
        data: data
    });
};
var getCache = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    var result, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, cache.get(key)];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result];
            case 2:
                err_1 = _a.sent();
                console.log(err_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var getSteamItems = function () {
    var baseUrl = "https://steamcommunity.com/market/priceoverview/";
    console.log("Get Steam Price Data");
    try {
        return Promise.all(Object.entries(constants_1.STEAM_ITEMS).map(function (_a) {
            var _b = __read(_a, 2), id = _b[0], value = _b[1];
            return __awaiter(void 0, void 0, void 0, function () {
                var appid, name, market_hash_name, data, lowest_price, median_price, toNumber, result;
                var _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            appid = value.appid, name = value.name, market_hash_name = value.market_hash_name;
                            return [4 /*yield*/, utils_js_1.request({
                                    method: "GET",
                                    url: baseUrl,
                                    params: {
                                        currency: config.DEFAULT_CURRENCY,
                                        appid: appid
                                    },
                                    paramsSerializer: function (params_1) {
                                        var newParams = __assign(__assign({}, params_1), { market_hash_name: market_hash_name });
                                        return qs_1.default.stringify(newParams);
                                    }
                                })];
                        case 1:
                            data = (_d.sent()).data;
                            lowest_price = data.lowest_price, median_price = data.median_price;
                            toNumber = function (string) {
                                return Number(string.replace(/[^\d.]/g, ""));
                            };
                            result = (_c = {},
                                _c[id] = {
                                    lowest_price: toNumber(lowest_price),
                                    median_price: toNumber(median_price),
                                    name: name
                                },
                                _c);
                            return [2 /*return*/, result];
                    }
                });
            });
        }));
    }
    catch (error) {
        console.error(error);
    }
};
app.get("/api/v1/steam/prices", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cacheContent, prices, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, getCache("steam-prices")];
            case 1:
                cacheContent = _a.sent();
                if (cacheContent) {
                    console.log("Cache content found");
                    sendResponse(res, 200, true, "Get steam prices successfully (cached)", cacheContent);
                    return [2 /*return*/];
                }
                console.log("No cache found");
                return [4 /*yield*/, getSteamItems()];
            case 2:
                prices = _a.sent();
                data = Object.assign.apply(Object, __spread([{}], prices));
                cache.set("steam-prices", data, config.CACHE_OPTIONS.maxAge);
                console.log("Content cached");
                // res.set({
                //   "Cache-Control": `max-age=${cacheOptions.maxAge}`
                // });
                sendResponse(res, 200, true, "Get steam prices successfully", data);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error(error_1);
                sendResponse(res, error_1.code, false, error_1.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var getG2aListings = function (params, headers) { return __awaiter(void 0, void 0, void 0, function () {
    var response, json, data, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, utils_js_1.request({
                        url: config.PROXY_URL + "/https://www.g2a.com/lucene/search/filter",
                        method: "GET",
                        params: params,
                        headers: {
                            Origin: headers.origin,
                            "X-Requested-With": "fetch"
                        }
                    })];
            case 1:
                response = _a.sent();
                json = circular_json_1.default.stringify(response);
                data = JSON.parse(json).data;
                return [2 /*return*/, data];
            case 2:
                error_2 = _a.sent();
                console.log(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
app.get("/api/v1/g2a/listings", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, result, numFound, docs, filtered, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query;
                if (!query.search) {
                    sendResponse(res, 400, false, "Game title is required");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getG2aListings(query, req.headers)];
            case 2:
                result = _a.sent();
                if (!result) {
                    sendResponse(res, 400, false, "Game listing undefied");
                    return [2 /*return*/];
                }
                numFound = result.numFound, docs = result.docs;
                filtered = docs.filter(function (item) { return item.retailQty > 0; });
                if (!filtered.length && Number(numFound) > 0) {
                    sendResponse(res, 200, true, "Get G2A listings successfully", {
                        numFound: numFound,
                        items: filtered,
                        message: "Product Not Available"
                    });
                    return [2 /*return*/];
                }
                if (!filtered.length && !Number(numFound)) {
                    sendResponse(res, 200, true, "Get G2A listings successfully", {
                        numFound: numFound,
                        items: filtered,
                        message: "Product Not Found"
                    });
                    return [2 /*return*/];
                }
                sendResponse(res, 200, true, "Get G2A listings successfully", {
                    numFound: numFound,
                    items: filtered,
                    message: "Product Not Found",
                    data: {
                        numFound: numFound,
                        items: filtered,
                        message: "Product Found"
                    }
                });
                return [2 /*return*/];
            case 3:
                error_3 = _a.sent();
                console.error(error_3);
                sendResponse(res, error_3.code, false, error_3.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var getG2aAuction = function (params, headers) { return __awaiter(void 0, void 0, void 0, function () {
    var response, json, data, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, utils_js_1.request({
                        url: config.PROXY_URL + "/https://www.g2a.com/marketplace/product/auctions/",
                        method: "GET",
                        headers: {
                            Origin: headers.origin,
                            "X-Requested-With": "fetch"
                        },
                        params: params
                    })];
            case 1:
                response = _a.sent();
                json = circular_json_1.default.stringify(response);
                data = JSON.parse(json).data;
                return [2 /*return*/, data];
            case 2:
                error_4 = _a.sent();
                console.log(error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
app.get("/api/v1/g2a/auction", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var query, data, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                query = req.query;
                if (!query.id) {
                    sendResponse(res, 400, false, "Auction id is required");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getG2aAuction(query, req.headers)];
            case 2:
                data = _a.sent();
                sendResponse(res, 200, true, "Get G2A auction successfully", data);
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.error(error_5);
                sendResponse(res, error_5.code, false, error_5.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
app.listen(process.env.PORT || 1337, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
