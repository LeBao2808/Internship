import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";

export interface ICategory extends Document, IBaseTimestamps {
  name: string;
  description?: string;
}

const CategorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  ...baseTimestamps
});

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export default Category;