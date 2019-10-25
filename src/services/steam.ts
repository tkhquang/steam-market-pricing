/* eslint-disable @typescript-eslint/camelcase */
import qs from "qs";

import { request } from "@utils";
import { STEAM_ITEMS } from "@constants";
import { steamModels } from "@models";

const config = {
  DEFAULT_CURRENCY: 1
};

export const getSteamItems = (): Promise<steamModels.prices.PriceItem[]> => {
  const baseUrl = "https://steamcommunity.com/market/priceoverview/";
  console.log("Get Steam Price Data");

  try {
    return Promise.all(
      Object.entries(STEAM_ITEMS).map(
        async ([id, value]): Promise<steamModels.prices.PriceItem> => {
          const { appid, name, market_hash_name } = value;

          const { data } = await request({
            method: "GET",
            url: baseUrl,
            params: {
              currency: config.DEFAULT_CURRENCY,
              appid
            },
            paramsSerializer: params => {
              const newParams = {
                ...params,
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
    return Promise.reject(error);
  }
};
