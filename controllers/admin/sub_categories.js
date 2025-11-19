import Subcategory from "../../models/sub_category.model.js";
import mongoose from "mongoose";

const addSubCategory = async(req,res)=>{
    try{
        console.log("Add sub-category route was hit");
        const {sub_category_name} = req.body;
        const category_id = req.query.C_ID;
         
     if(!sub_category_name){
        return res.status(403).json({
            success:false,
            message:"Please enter sub_category name"
        })
     }
     if(!category_id || !mongoose.Types.ObjectId.isValid(category_id)){
        return res.status(403).json({
            success:false,
            message:"Please Enter Category Id or Enter valid category id"
        })
     }
    
    const originalNameOfImage = req.file?.originalname;
    const destination = req.file?.destination;
    const imageUrl = `${destination}/${originalNameOfImage}`;
    console.log("Final Image Url",imageUrl);
     
    // Adding Subcategory:

    const addSubCategory = await new Subcategory({
      sub_category_name:sub_category_name?.toLowerCase(),
      sub_category_logo:imageUrl,
      parent_category:category_id

    }).save();

    if(addSubCategory){
      console.log("Subcategory was added");  
      return res.status(201).json({
        success:true,
        message:"Subcategory was added successfully",
        category:addSubCategory
      })       
    }
    else{
       console.log("Subcategory was not added");
       return res.status(404).json({
        success:false,
        message:"Subcategory was not added"
      }) 

    } 
 


    }catch(err){
      return res.status(501).json({
        success:false,
        message:"Error occured while adding Sub-category"
      })  
 


    }


}

export {addSubCategory};