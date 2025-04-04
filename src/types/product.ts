
export interface Product {
  _id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  brand: string;
  category: string;
  countInStock: number;
  numReviews: number;
  description: string;
  features: string[];
  specifications: {
    [key: string]: string;
  };
}
