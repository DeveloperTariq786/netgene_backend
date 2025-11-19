import mongoose from "mongoose";
const CategorySchema = new mongoose.Schema({
   category_name:{
    type:String,
    required:true
   },
   category_logo:{
    type:String
   }
},{timestamps:true});

const Category = mongoose.model("Category",CategorySchema);
export default Category;
