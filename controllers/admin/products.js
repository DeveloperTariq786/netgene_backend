import Product from "../../models/product.model.js";
import Category from "../../models/category.model.js";
import Brand from "../../models/brand.model.js";
import Subcategory from "../../models/sub_category.model.js";
import mongoose from "mongoose";
import {uploadToFirebaseStorage} from "../../helpers/uploadtofirebase.js" 
const addProduct = async(req,res)=>{
  try{
       console.log("Add product route was hit",req.body);
      // console.log("Add product route was hit",req.files);
      let {product_name,product_description,product_quantity,product_price,discount_percentage} = req.body;
      const {brand_id,category_id,sub_category_id} = req.query;
      //  console.log("brandId",brand_id,"categoryId",category_id,"subCategoryId",sub_category_id);    
          product_price =  parseFloat(product_price);
          discount_percentage = parseFloat(discount_percentage);
          discount_percentage = discount_percentage?discount_percentage:0;    
          // console.log("Discount",discount_percentage);  
      if(!product_name || !product_description || !product_quantity || !product_price){
         console.log("All fields are required");
         return res.status(403).json({
          success:false,
          message:"All fields are required"
         }); 
      }
     if(!mongoose.Types.ObjectId.isValid(brand_id) || !mongoose.Types.ObjectId.isValid(category_id) || !mongoose.Types.ObjectId.isValid(sub_category_id) ){
        console.log("invalid query fields");
        return res.status(403).json({
          success:false,
          message:"Invalid brand_id or category_id or sub_category_id"
        })
     }
     
     // checking whether query params exists in db;
     let existingBrand = await Brand.findById(brand_id);
     let existingCategory = await Category.findById(category_id);
     let existingSubcategory = await Subcategory.findById(sub_category_id);
      if(!existingBrand || !existingCategory || !existingSubcategory){
         console.log("Brand/Category/Subcategory does not exists from db");
         return res.status(404).json({
          success:false,
          message:"Brand or Category or Sub-category does not exists please add first"
         })
      } 

 
      if(!req.files){
        console.log("Avatar and CoverImages are required!");
         return res.status(403).json({
         success:false,
         message:"Avatar and CoverImages are required!" 
        })
      }
      let avatarImage = req?.files.avatar[0];
      let coverImages = req?.files.cover_images;

      // console.log("Avatar image ",avatar`Image);
      if(!avatarImage){
          console.log("Please select avatar"); 
          return res.status(403).json({
            success:false,
            message:"Please upload avatar"

          })
      }
      if(!coverImages.length){
          console.log("Please upload product images"); 
          return res.status(403).json({
            success:false,
            message:"Please upload product images"

          })
      }
     
      // console.log("Product Price",product_price,typeof(product_price),typeof(discount_percentage),discount_percentage);
      const final_price = product_price - (product_price * (discount_percentage/100));
      // console.log("Final price of product:",final_price);  

      // checking whether the product exists :
      const existingProduct = await Product.findOne({product_name:product_name,product_description:product_description});
      if(existingProduct){
        console.log("Product already exists update it according to the requirments");
        return res.status(403).json({
          success:false,
          message:"Product already exists update it according to the requirments"
        })
      }
      // now preparing images to upload :
      // avatar upload:
       let imgArr = [];
      const fileName = `assets/${avatarImage.originalname}`;
          const avatar_logo_url = await uploadToFirebaseStorage(
              avatarImage.buffer,
              fileName,
              avatarImage.mimetype
            );
        if(avatar_logo_url){
           console.log("Avatar image uploaded",avatar_logo_url); 
        }
        for(let i=0; i<coverImages.length;i++){
             let fileName = `assets/${coverImages[i].originalname}`; 
           const coverimage_url = await uploadToFirebaseStorage(
              coverImages[i].buffer,
              fileName,
              coverImages[i].mimetype
            );
            if(coverimage_url){
                let imgObj = {
                  url:coverimage_url
                }
                imgArr.push(imgObj)
            }
        }
        if(imgArr.length){
           console.log("Cover_images uploaded successfully",imgArr);       
        }
     // now preparing product doc to save in db:

       const addProduct = await new Product({
        product_name:product_name.toLowerCase(),
        product_description:product_description.toLowerCase(),
        product_quantity:product_quantity,
        discount_precentage:discount_percentage,
        product_price:product_price,
        final_price:final_price,
        avatar:avatar_logo_url,
        cover_images:imgArr,
        product_category:category_id,
        product_sub_category:sub_category_id,
        product_brand:brand_id

       }).save();

       if(addProduct){
         console.log("Product was added successfulyy");
         return res.status(201).json({
          success:true,
          message:"product added successfuly",
          product:addProduct
         })
       }else{
        console.log("Product was not added");
         return res.status(403).json({
          success:false,
          message:"product added not added",
         
         })
       }
        
                        
    
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




