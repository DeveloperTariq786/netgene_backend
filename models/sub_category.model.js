import mongoose from "mongoose";
const SubcategorySchema = new mongoose.Schema({
   sub_category_name:{
    type:String,
    required:true,
    unique:true
   },
   sub_category_logo:{
    type:String,
   },
   parent_category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category"
   }
},{timestamps:true});

const Subcategory = mongoose.model("Subcategory",SubcategorySchema);
export default Subcategory;