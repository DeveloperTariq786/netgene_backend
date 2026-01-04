import mongoose from "mongoose";

const InventoryPurchaseItemSchema = new mongoose.Schema({
    inventory_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Inventory",
        required: true
    },
    supplier_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Supplier",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    unit_price: {
        type: Number,
        required: true,
        min: 0
    }
});

const InventoryBillSchema = new mongoose.Schema({
    bill_number: {
        type: String,
        unique: true
    },
    bill_date: {
        type: Date,
        required: true
    },
    items: [InventoryPurchaseItemSchema],
    total_amount: {
        type: Number,
        default: 0
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const InventoryBill = mongoose.model("InventoryBill", InventoryBillSchema);
export default InventoryBill;
