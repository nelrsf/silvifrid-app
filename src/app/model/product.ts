// New product interface matching the required English schema
export interface Product {
  _id?: string;          // MongoDB ObjectId
  name: string;          // Product name
  description: string;   // Product description
  images: string[];      // Array of image URLs, index 0 is main image
  price: number;         // Base price
  extendedPrice: number; // Extended price (wholesale/promotion)
  stock: number;         // Available quantity
}

// Product creation/update data transfer object
export interface ProductCreateDto {
  name: string;
  description: string;
  images?: string[];
  price: number;
  extendedPrice: number;
  stock: number;
}

// Product update data transfer object
export interface ProductUpdateDto {
  name?: string;
  description?: string;
  images?: string[];
  price?: number;
  extendedPrice?: number;
  stock?: number;
}