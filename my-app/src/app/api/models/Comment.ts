import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";

export interface IComment extends Document, IBaseTimestamps {
content: string;
user: mongoose.Schema.Types.ObjectId;
blog: mongoose.Schema.Types.ObjectId;
}
const CommentSchema: Schema<IComment> = new Schema({
content: { type: String, required: true },
user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog" },
...baseTimestamps,
})

export const Comment: Model<IComment> =mongoose.models.Comment ||  mongoose.model<IComment>("Comment", CommentSchema);
export default Comment;