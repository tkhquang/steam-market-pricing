/* eslint-disable @typescript-eslint/camelcase */
import "module-alias/register";
import express from "express";
import bodyParser from "body-parser";
import LRU from "lru-cache";
import http from "http";

import { steamServices, g2aServices } from "@services";

const cacheOptions = {
  max: 500,
  maxAge: 1000 * 60 * 60 // 1 hour
};

const app = express();
const cache = new LRU(cacheOptions);

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

const getCache = async (key: string): Promise<unknown> => {
  try {
    const result = await cache.get(key);
    return result;
  } catch (err) {
    return Promise.reject(err);
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

    const prices = await steamServices.getSteamItems();
    const data = Object.assign({}, ...prices);

    cache.set("steam-prices", data, cacheOptions.maxAge);
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

app.get("/api/v1/g2a/auctions", async (req, res) => {
  const { query } = req;
  if (!query.search) {
    sendResponse(res, 400, false, "Game title is required");
    return;
  }
  if (!req.headers.origin) {
    sendResponse(res, 407, false, "Proxy Authentication Required");
    return;
  }
  try {
    const result = await g2aServices.getG2aListings(query, req.headers);
    const data = result;

    sendResponse(res, 200, true, "Get G2A listings successfully", data);
  } catch (error) {
    console.error(error);
    sendResponse(res, error.code, false, error.message);
  }
});

app.get("/api/v1/g2a/auctions/:id", async (req, res) => {
  const { params } = req;
  if (!params.id) {
    sendResponse(res, 400, false, "Auction id is required");
    return;
  }
  if (!req.headers.origin) {
    sendResponse(res, 407, false, "Proxy Authentication False");
    return;
  }
  try {
    const data = await g2aServices.getG2aAuction(params.id, req.headers);
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
