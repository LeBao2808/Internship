import mongoose, { Schema, Document, Model } from "mongoose";
import { IBlog } from "./Blog"; // Import interface Blog nếu có
import { ICategory } from "./Category";

export interface IViewHistory extends Document {
  user: mongoose.Schema.Types.ObjectId;
  blog: mongoose.Schema.Types.ObjectId | (IBlog & { category?: ICategory }); 
  viewedAt: Date;
}

const ViewHistorySchema: Schema<IViewHistory> = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blog: { type: mongoose.Schema.Types.ObjectId, ref: "Blog", required: true },
  viewedAt: { type: Date, default: Date.now },
});

const ViewHistory: Model<IViewHistory> =
  mongoose.models.ViewHistory || mongoose.model<IViewHistory>("ViewHistory", ViewHistorySchema);

export default ViewHistory;