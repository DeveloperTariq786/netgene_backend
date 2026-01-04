import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    optional: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    optional: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const Supplier = mongoose.model("Supplier", SupplierSchema);
export default Supplier;
