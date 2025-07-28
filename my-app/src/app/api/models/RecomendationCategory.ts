import mongoose from "mongoose";

const RecomendationCategorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
}, {
  timestamps: true,
});

export default mongoose.models.RecomendationCategory || mongoose.model("RecomendationCategory", RecomendationCategorySchema);