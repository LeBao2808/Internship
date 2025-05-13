import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";

export interface IUser extends Document, IBaseTimestamps {

  name: string;
  email: string;
  password?: string;
  role?: mongoose.Schema.Types.ObjectId;
  category?: mongoose.Schema.Types.ObjectId;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, 
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  ...baseTimestamps
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;