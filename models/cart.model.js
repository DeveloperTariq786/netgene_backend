import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    no_of_products: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Cart = mongoose.model("Cart", CartSchema);
export default Cart;