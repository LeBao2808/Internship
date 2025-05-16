import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";

export interface IRole extends Document, IBaseTimestamps {
  name: string;
  description?: string;
}

const RoleSchema: Schema<IRole> = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);

export default Role;