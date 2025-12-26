import mongoose from "mongoose";
const CusotmerReviewsSchema = new mongoose.Schema({
    customer_reviews: {
        type: String,
        required: true
    }

})

const ReviewsSchema = new mongoose.Schema({
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        // unique: true
    },
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        // unique: true
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        required: true
    },
    reviews: [CusotmerReviewsSchema]



}, { timestamps: true });

const Rating = mongoose.model("Rating", ReviewsSchema);

export default Rating;
