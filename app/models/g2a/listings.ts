export interface Listing {
  id: number;
  name: string;
  slug: string;
  retailQty: number;
}

export interface Listings {
  numFound: number;
  docs: Listing[];
}

export interface Params {
  search: string;
}
