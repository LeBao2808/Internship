import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";
import { baseTimestamps } from "./BaseTimestamps";

interface IRole extends Document {
  name: string;
}
export interface IUser extends Document, IBaseTimestamps {
  name: string;
  email: string;
  password?: string;
  image: string;
  role: mongoose.Schema.Types.ObjectId | IRole ;
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, 
  ...baseTimestamps
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;