import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";

export interface IBlog extends Document, IBaseTimestamps {
  title: string;
  content: string;
  user: mongoose.Schema.Types.ObjectId;
  category: mongoose.Schema.Types.ObjectId;
}

const BlogSchema: Schema<IBlog> = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  ...baseTimestamps
});

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;