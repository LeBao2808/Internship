import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRole extends Document {
  name: string;
  description?: string;
}

const RoleSchema: Schema<IRole> = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

const Role: Model<IRole> = mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);

export default Role;