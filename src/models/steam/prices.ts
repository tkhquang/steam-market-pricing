/* eslint-disable @typescript-eslint/camelcase */
// const SteamPrices = require("constants");

interface Item {
  lowest_price: string;
  median_price: string;
  name: string;
}

interface SetPriceParams extends Item {
  id: string;
}

export interface PriceItem {
  [id: string]: {
    lowest_price: number;
    median_price: number;
    name: string;
  };
}
