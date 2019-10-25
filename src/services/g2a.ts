import http from "http";
import CircularJSON from "circular-json";
import dotenv from "dotenv";

import { request, helper } from "@utils";
import { g2aModels } from "@models";

dotenv.config();

const config = {
  DEFAULT_CURRENCY: 1,
  PROXY_URL: process.env.PROXY_URL
};

export const getG2aListings = async (
  params: g2aModels.listings.Params,
  headers: http.IncomingHttpHeaders
): Promise<g2aModels.listings.Listings> => {
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
    const { numFound: total, docs } = data;

    let message = "";

    // Filtered out all product with no active listing
    // Then remove unneeded fields
    const auctions = docs
      .filter((item: Record<string, any>) => item.retailQty > 0)
      .map((item: Record<string, any>) => {
        return helper.pick(
          item,
          "id",
          "name",
          "slug"
        ) as g2aModels.listings.Listing;
      });

    if (!auctions.length && Number(total) > 0) {
      message = "Product Not Available";
    } else if (!auctions.length && !Number(total)) {
      message = "Product Not Found";
    } else {
      message = "Product Found";
    }
    return {
      total,
      auctions,
      message
    };
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getG2aAuction = async (
  id: number | string,
  headers: http.IncomingHttpHeaders
): Promise<g2aModels.auction.Auction> => {
  try {
    const response = await request({
      url: `${config.PROXY_URL}/https://www.g2a.com/marketplace/product/auctions/`,
      method: "GET",
      headers: {
        Origin: headers.origin,
        "X-Requested-With": "fetch"
      },
      params: {
        id
      }
    });
    const json = CircularJSON.stringify(response);
    const { data } = JSON.parse(json);
    return helper.pick(
      { ...data, id },
      "id",
      "lowest_price"
    ) as g2aModels.auction.Auction;
  } catch (error) {
    return Promise.reject(error);
  }
};
