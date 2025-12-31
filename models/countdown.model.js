import mongoose from "mongoose";

const CountdownSchema = new mongoose.Schema({
    countdown_title: { type: String, required: true },
    countdown_description: { type: String, required: true },
    countdown_discount: { type: String, required: true },
    countdown_end_time: { type: Date, required: true },
    countdown_category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    countdown_brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    countdown_url: { type: String, required: true },
    countdown_association: { type: String, required: true }

}, { timestamps: true });

const Countdown = mongoose.model("Countdown", CountdownSchema);
export default Countdown;
