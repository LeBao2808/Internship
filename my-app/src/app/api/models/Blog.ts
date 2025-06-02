import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";
import slugify from "slugify";

export interface IBlog extends Document, IBaseTimestamps {
  title: string;
  content: string;
  image_url: string; 
  user: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
  slug: string;
}

const BlogSchema: Schema<IBlog> = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  image_url: { type: String }, 
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  slug: {
    type: String,
    unique: true,
  },
  ...baseTimestamps
});

BlogSchema.pre("save", function (next) {
  if (!this.slug && this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
})
const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;