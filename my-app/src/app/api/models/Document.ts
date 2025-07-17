import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  content: { type: String, required: true },
  embedding: [{ type: Number }],
}, {
  timestamps: true,
});

export default mongoose.models.Document || mongoose.model("Document", DocumentSchema);