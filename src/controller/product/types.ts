import { Types } from "mongoose";

// What the Product looks like in MongoDB (Raw)
export interface RawProduct {
  _id: Types.ObjectId;
  name: string;
  price: any; // This is the Decimal128 object from Mongo
  categoryId: Types.ObjectId;
  imageSrc: string;
  timeToMake: number;
}

// What the Category looks like
export interface ICategory {
  _id: Types.ObjectId;
  name: string;
  displayOrder: number;
}

// What the Product looks like when sent to Frontend
export interface CleanProduct extends Omit<RawProduct, "price" | "category"> {
  price: number; // Price is now a clean string
  id: string;
}

// The final structure
export interface MenuCategory extends ICategory {
  items: CleanProduct[];
  id: string;
}
