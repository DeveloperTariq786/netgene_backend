import mongoose from "mongoose";

const BannerSchema = new mongoose.Schema({
    banner_category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    banner_brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    banner_url: { type: String, required: true },
    banner_association: { type: String, required: true }

}, { timestamps: true });

const Banner = mongoose.model("Banner", BannerSchema);
export default Banner;
