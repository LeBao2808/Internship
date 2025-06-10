import mongoose, { Schema, Document, Model } from "mongoose";
import { IBaseTimestamps } from "./BaseTimestamps";

export interface IJob extends Document, IBaseTimestamps {
  name: string;
  description?: string;
}

const JobSchema: Schema<IJob> = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String }
});

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;