const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios");
const qs = require("qs");

app.all("/*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET");
  next();
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

const getSteamPrices = async () => {
  const baseUrl = "https://steamcommunity.com/market/priceoverview/";
  try {
    return await Promise.all(items.map(item => axios.get(baseUrl, {
      params: {
        currency: config.DEFAULT_CURRENCY,
        appid: item.appid
      },
      paramsSerializer: (params) => {
        const newParams = {...params, market_hash_name: item.hash_name};
        return qs.stringify(newParams);
      }
    }).then(res => {
      return {...res.data, id: item.id, item: item.name};
    })));
  } catch (error) {
    console.error(error);
  }
};

app.get("/steam-prices", async (req, res) => {
  console.log("GET From SERVER");
  const https = require("https");

  const prices = await getSteamPrices();

  res.writeHead(200);
  res.send(prices);
});

// eslint-disable-next-line no-undef
app.listen(process.env.PORT || 1337, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
