import mongoose from "mongoose";

const InventorySchema = mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    product_stock: {
        type: Number,
        required: true,
        default: 0
    },
    product_code: {
        type: String,
        // unique:true,
        // index:1
    },
    stock_status: {
        type: String,
        enum: ["In Stock", "Low Of Stock", "Out Of Stock"]
    },
    date: {
        type: String
    }
}, { timestamps: true });
const Inventory = mongoose.model("Inventory", InventorySchema);
export default Inventory;