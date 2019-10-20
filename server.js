require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const Axios = require("axios");
const qs = require("qs");
const CircularJSON = require("circular-json");
const LRU = require("lru-cache");

const cacheOptions = {
  max: 500,
  // 1 hour
  maxAge: 1000 * 60 * 60
};

const cache = new LRU(cacheOptions);

// Empty the cache on start
cache.reset();

const proxyUrl = process.env.PROXY_URL;

app.all("/*", function(req, res, next) {
  const allowedOrigins = [
    "http://127.0.0.1:8080",
    "http://localhost:8080"
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.indexOf(origin) > -1){
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept, Cache-Control, no-cache");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");

  return next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

const config = {
  DEFAULT_CURRENCY: 1
};

const items = [
  {
    id: 1,
    name: "Sack of Gems",
    appid: 753,
    hash_name: "753-Sack of Gems"
  },
  {
    id: 2,
    name: "CS:GO Key",
    appid: 730,
    hash_name: "CS:GO Case Key"
  },
  {
    id: 3,
    name: "TF2 Key",
    appid: 440,
    hash_name: "Mann Co. Supply Crate Key"
  }
];

const getCache = async (key) => {
  let result;
  try {
    result = cache.get(key);
  } catch (err) {
    return Promise.reject(err);
  }
  return Promise.resolve(result);
};

const getSteamPrices = async () => {
  const baseUrl = "https://steamcommunity.com/market/priceoverview/";
  console.log("Get Steam Price Data");

  try {
    return await Promise.all(items.map(item => Axios.get(baseUrl, {
      params: {
        currency: config.DEFAULT_CURRENCY,
        appid: item.appid
      },
      paramsSerializer: (params) => {
        const newParams = {...params, market_hash_name: item.hash_name};
        return qs.stringify(newParams);
      }
    }).then(res => {
      const data = {
        ...res.data,
        id: item.id,
        name:item.name
      };
      return data;
    })));
  } catch (error) {
    console.error(error);
  }
};

app.get("/api/v1/steam-prices", async (req, res) => {
  try {
    const cacheContent = await getCache("steam-prices");
    if (cacheContent) {
      console.log("Cache content found");
      return res.status(200).send({
        success: "true",
        message: "get steam prices successfully",
        data: cacheContent
      });
    }
    console.log("No cache found");

    const prices = await getSteamPrices();

    cache.set("steam-prices", prices, cacheOptions.maxAge);
    console.log("Content cached");
    // res.set({
    //   "Cache-Control": `max-age=${cacheOptions.maxAge}`
    // });
    return res.status(200).send({
      success: "true",
      message: "get steam prices successfully",
      data: prices
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status).send({
      success: "false",
      message: { error: error }
    });
  }
});

const getG2aListings = async (params, headers) => {
  try {
    const response = await Axios({
      url: `${proxyUrl}/https://www.g2a.com/lucene/search/filter`,
      method: "GET",
      params,
      headers: {
        Origin: headers.origin,
        "X-Requested-With": "fetch",
      },
    });
    const json = CircularJSON.stringify(response);
    const { data } = JSON.parse(json);
    return data;
  } catch (error) {
    console.log(error);
  }
};

app.get("/api/v1/g2a-listings", async (req, res) => {
  const { query } = req;
  if (!query.search) {
    return res.status(400).send({
      success: "false",
      message: "game title is required"
    });
  }
  try {
    const {numFound, docs} = await getG2aListings(query, req.headers);

    // Filtered out all product with no active listing
    const filtered = docs.filter(item => item.retailQty > 0);

    if (!filtered.length && Number(numFound) > 0) {
      return res.status(200).send({
        success: "true",
        message: "get g2a listings successfully",
        data: {
          numFound: numFound,
          items: filtered,
          message: "Product Not Available"
        }
      });
    }

    if (!filtered.length && !Number(numFound)) {
      return res.status(200).send({
        success: "true",
        message: "get g2a listings successfully",
        data: {
          numFound: numFound,
          items: filtered,
          message: "Product Not Found"
        }
      });
    }

    return res.status(200).send({
      success: "true",
      message: "get g2a listings successfully",
      data: {
        numFound: numFound,
        items: filtered,
        message: "Product Found"
      }
    });
  } catch (error) {
    console.error(error);
    res.status(error.status);
    res.render("error", { error: error });
  }
});

const getG2aItem = async (params, headers) => {
  try {
    const response = await Axios({
      url: `${proxyUrl}/https://www.g2a.com/marketplace/product/auctions/`,
      method: "GET",
      headers: {
        Origin: headers.origin,
        "X-Requested-With": "fetch",
      },
      params
    });
    const json = CircularJSON.stringify(response);
    const { data } = JSON.parse(json);
    return data;
  } catch (error) {
    console.log(error);
  }
};

app.get("/api/v1/g2a-auction", async (req, res) => {
  const { query } = req;
  if (!query.id) {
    return res.status(400).send({
      success: "false",
      message: "auction id is required"
    });
  }
  try {
    const data = await getG2aItem(query, req.headers);
    return res.status(200).send({
      success: "true",
      message: "get g2a listings successfully",
      data
    });
  } catch (error) {
    console.error(error);
    res.status(error.status);
    res.render("error", { error: error });
  }
});

app.listen(process.env.PORT || 1337, function () {
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
