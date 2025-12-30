import mongoose, { mongo } from "mongoose";

const CarouselSchema = new mongoose.Schema({
    carousel_title: { type: String, required: true },
    carousel_description: { type: String, required: true },
    carousel_category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    carousel_brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    carousel_url: { type: String, required: true },
    carousel_association: { type: String, required: true }

}, { timestamps: true });

const Carousel = mongoose.model("Carousel", CarouselSchema);
export default Carousel;