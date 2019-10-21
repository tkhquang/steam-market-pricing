/* eslint-disable @typescript-eslint/camelcase */
import express from "express";
import bodyParser from "body-parser";
import qs from "qs";
import CircularJSON from "circular-json";
import LRU from "lru-cache";
import http from "http";
import dotenv from "dotenv";

import { request } from "./utils.js";

import { STEAM_ITEMS } from "./constants";
import { steamPrices } from "./models/steam";
import { listings, auction } from "./models/g2a";

dotenv.config();

const config = {
  DEFAULT_CURRENCY: 1,
  CACHE_OPTIONS: {
    max: 500,
    maxAge: 1000 * 60 * 60 // 1 hour
  },
  PROXY_URL: process.env.PROXY_URL
};

const app = express();
const cache = new LRU(config.CACHE_OPTIONS);

app.all("/*", function(req, res, next) {
  const allowedOrigins = ["http://127.0.0.1:8080", "http://localhost:8080"];
  const headers: http.IncomingHttpHeaders = req.headers;

  const index = allowedOrigins.findIndex(
    allowedOrigin => allowedOrigin === headers.origin
  );

  if (index > -1) {
    res.header("Access-Control-Allow-Origin", headers.origin);
  }

  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Accept, Cache-Control, no-cache"
  );
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");

  return next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Empty the cache on start
cache.reset();

const sendResponse = (
  res: express.Response,
  code: number,
  success: boolean,
  message: string,
  data: any = null
): any => {
  res.status(code).send({
    success: success,
    message: message,
    data: data
  });
};

// eslint-disable-next-line prettier/prettier
function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const copy = {} as Pick<T, K>;

  keys.forEach(key => {
    copy[key] = obj[key]
  });

  return copy;
}

const getCache = async (key: string): Promise<unknown> => {
  try {
    const result = await cache.get(key);
    return result;
  } catch (err) {
    console.log(err);
  }
};

const getSteamItems = (): Promise<steamPrices.PriceItem[]> | undefined => {
  const baseUrl = "https://steamcommunity.com/market/priceoverview/";
  console.log("Get Steam Price Data");

  try {
    return Promise.all(
      Object.entries(STEAM_ITEMS).map(
        async ([id, value]): Promise<steamPrices.PriceItem> => {
          const { appid, name, market_hash_name } = value;

          const { data } = await request({
            method: "GET",
            url: baseUrl,
            params: {
              currency: config.DEFAULT_CURRENCY,
              appid
            },
            paramsSerializer: params_1 => {
              const newParams = {
                ...params_1,
                market_hash_name
              };
              return qs.stringify(newParams);
            }
          });
          const { lowest_price, median_price } = data;
          const toNumber = (string: string): number => {
            return Number(string.replace(/[^\d.]/g, ""));
          };
          const result = {
            [id]: {
              lowest_price: toNumber(lowest_price),
              median_price: toNumber(median_price),
              name
            }
          };
          return result;
        }
      )
    );
  } catch (error) {
    console.error(error);
  }
};

app.get("/api/v1/steam/prices", async (req, res) => {
  try {
    const cacheContent = await getCache("steam-prices");
    if (cacheContent) {
      console.log("Cache content found");
      sendResponse(
        res,
        200,
        true,
        "Get steam prices successfully (cached)",
        cacheContent
      );
      return;
    }
    console.log("No cache found");

    const prices = await getSteamItems();
    const data = Object.assign({}, ...prices);

    cache.set("steam-prices", data, config.CACHE_OPTIONS.maxAge);
    console.log("Content cached");
    // res.set({
    //   "Cache-Control": `max-age=${cacheOptions.maxAge}`
    // });
    sendResponse(res, 200, true, "Get steam prices successfully", data);
  } catch (error) {
    console.error(error);
    sendResponse(res, error.code, false, error.message);
  }
});

const getG2aListings = async (
  params: listings.Params,
  headers: http.IncomingHttpHeaders
): Promise<listings.Listings | undefined> => {
  try {
    const response = await request({
      url: `${config.PROXY_URL}/https://www.g2a.com/lucene/search/filter`,
      method: "GET",
      params,
      headers: {
        Origin: headers.origin,
        "X-Requested-With": "fetch"
      }
    });
    const json = CircularJSON.stringify(response);
    const { data } = JSON.parse(json);
    return data;
  } catch (error) {
    console.log(error);
  }
};

app.get("/api/v1/g2a/listings", async (req, res) => {
  const { query } = req;
  if (!query.search) {
    sendResponse(res, 400, false, "Game title is required");
    return;
  }
  try {
    const result = await getG2aListings(query, req.headers);
    if (!result) {
      sendResponse(res, 400, false, "Game listing undefied");
      return;
    }
    const { numFound, docs } = result;

    // Filtered out all product with no active listing
    // Then remove unneeded fields
    const filtered = docs.filter(item => item.retailQty > 0).map(item => {
      return pick(item, "id", "name", "slug") as listings.Listing;
    });

    if (!filtered.length && Number(numFound) > 0) {
      sendResponse(res, 200, true, "Get G2A listings successfully", {
        numFound: numFound,
        listings: filtered,
        message: "Product Not Available"
      });
      return;
    }

    if (!filtered.length && !Number(numFound)) {
      sendResponse(res, 200, true, "Get G2A listings successfully", {
        numFound: numFound,
        listings: filtered,
        message: "Product Not Found"
      });
      return;
    }

    sendResponse(res, 200, true, "Get G2A listings successfully", {
      numFound: numFound,
      listings: filtered,
      message: "Product Found",
    });
    return;
  } catch (error) {
    console.error(error);
    sendResponse(res, error.code, false, error.message);
  }
});

const getG2aAuction = async (
  params: auction.Params,
  headers: http.IncomingHttpHeaders
): Promise<auction.Auction | undefined> => {
  try {
    const response = await request({
      url: `${config.PROXY_URL}/https://www.g2a.com/marketplace/product/auctions/`,
      method: "GET",
      headers: {
        Origin: headers.origin,
        "X-Requested-With": "fetch"
      },
      params
    });
    const json = CircularJSON.stringify(response);
    const { data } = JSON.parse(json);
    return pick(data, "id", "lowest_price" ) as auction.Auction;
  } catch (error) {
    console.log(error);
  }
};

app.get("/api/v1/g2a/auction", async (req, res) => {
  const { query } = req;
  if (!query.id) {
    sendResponse(res, 400, false, "Auction id is required");
    return;
  }
  try {
    const data = await getG2aAuction(query, req.headers);
    sendResponse(res, 200, true, "Get G2A auction successfully", data);
  } catch (error) {
    console.error(error);
    sendResponse(res, error.code, false, error.message);
  }
});

app.listen(process.env.PORT || 1337, function() {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );
});
