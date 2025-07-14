import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";
import slugify from "slugify";

export interface ISaveBlog extends Document, IBaseTimestamps {
blog: mongoose.Schema.Types.ObjectId;
user: mongoose.Schema.Types.ObjectId;
slug: string;
}
const SaveBlogSchema: Schema<ISaveBlog> = new Schema({
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  slug: {
    type: String,
    unique: true,
  },
  ...baseTimestamps
});

SaveBlogSchema.pre("save", async function (next) {
  if (!this.slug && this.user) {
    const User = mongoose.models.User || mongoose.model("User", new Schema({}));
    const user = await User.findById(this.user);
    const blog = await mongoose.models.Blog.findById(this.blog);
    

    this.slug = slugify(`${(user?.name || 'user')}, ${(blog?.title || 'blog')}-blogsave`, { lower: true, strict: true });
  }
  next();
});

const SaveBlog: Model<ISaveBlog> = mongoose.models.SaveBlog || mongoose.model<ISaveBlog>("SaveBlog", SaveBlogSchema);
export default SaveBlog;