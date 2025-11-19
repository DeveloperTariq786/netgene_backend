import mongoose from "mongoose";

const BrandSchema = new mongoose.Schema({
   brand_name:{
    type:String,
    required:true,
    default:"None",
    unique:true
   },
   brand_logo:{
    type:String
   },
   brand_added_by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },
   brand_updated_by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },

},{timestamps:true});

const Brand = mongoose.model("Brand",BrandSchema);
export default Brand;