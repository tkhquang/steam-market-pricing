export interface Listing {
  id: number;
  name: string;
  slug: string;
  retailQty: number;
}

export interface Listings {
  total: number;
  auctions: Listing[];
  message: string;
}

export interface Params {
  search: string;
}
