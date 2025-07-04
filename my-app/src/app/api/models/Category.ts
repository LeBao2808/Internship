import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";

export interface ICategory extends Document, IBaseTimestamps {
  name: string;
  description?: string;
  image?: string; 
  slug: string;
}

const CategorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String },
  slug: { type: String, unique: true },
  ...baseTimestamps
});
CategorySchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "");
  }
  next();
});
const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>("Category", CategorySchema);
export default Category;