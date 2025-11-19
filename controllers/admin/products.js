import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";
import Brand from "../../models/brand.model.js";
import Subcategory from "../../models/sub_category.model.js";

const addProduct = async(req,res)=>{
  try{
     console.log("Add product route was hit");


   }
    catch(err){
     console.log("Error occured while adding products",err);
        return res.status(501).json({
        success:false,
        message:"Error occured while addibg products"
    })

  }
}

export {addProduct};




