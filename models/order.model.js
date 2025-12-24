import mongoose from "mongoose";
const OrderItemSchema = new mongoose.Schema({
    cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart" },
    p_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    product_name: { type: String },
    product_logo: { type: String },
    product_price: { type: Number },
    total_price: { type: Number },
    ordered_products: { type: Number },
    product_brand: { type: String },
    product_dimension: { type: String },
    no_of_products: { type: Number }

})

const OrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true,
        default: () => {
            const prefix = "ORD";
            const date = new Date()
                .toISOString()
                .slice(0, 10)
                .replace(/-/g, "");
            const random = Math.random()
                .toString(36)
                .substring(2, 8)
                .toUpperCase();
            return `${prefix}-${date}-${random}`;
        }
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    order_status: {
        type: "String",
        enum: ["processing", "failed", "delivery", "delivered"]
    },
    order_items: [OrderItemSchema],
    shipping_address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderAddress"
    }

}, { timestamps: true });
// function generateOrderId() {
//     const prefix = "ORD";
//     const date = new Date()
//         .toISOString()
//         .slice(0, 10)
//         .replace(/-/g, "");

//     const random = Math.random()
//         .toString(36)
//         .substring(2, 8)
//         .toUpperCase();

//     return `${prefix}-${date}-${random}`;
// }

// OrderSchema.pre("save", function (next) {
//     if (!this.order_id) {
//         this.order_id = generateOrderId();
//     }
//     next();
// });



const Order = mongoose.model("Order", OrderSchema);
export default Order;
