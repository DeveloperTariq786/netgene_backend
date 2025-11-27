import Subcategory from "../../models/sub_category.model.js";
import mongoose from "mongoose";
import {uploadToFirebaseStorage} from "../../helpers/uploadtofirebase.js";
import Category from "../../models/category.model.js";
const addSubCategory = async(req,res)=>{
    try{
       console.log("Add sub-category route was hit");
       const userDetails = req.user;
       const allowedUsers = ['admin','superadmin'];
       const granted_permissions = userDetails.permission_component; 
       if(!allowedUsers.includes(userDetails.role)){
           console.log("Un-authorised access only admin and superadmin allowed");
           return res.status(403).json({
            success:false,
            message:"Un-authorised access only admin and superadmin allowed"

           })  

         }
       if(!granted_permissions[0].can_read_records){
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add sub-categories`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to add sub-categories`
             })
         } 

        const {sub_category_name} = req.body;
        const category_id = req.query.C_ID;
         
     if(!sub_category_name || !req.file){
        return res.status(403).json({
            success:false,
            message:"All fields are required"
        })
     }
     if(!category_id || !mongoose.Types.ObjectId.isValid(category_id)){
        return res.status(403).json({
            success:false,
            message:"Please Enter Category Id or Enter valid category id"
        })
     }
      // checking whether parent category exists or not:
      let parentCategory  = await Category.findById(category_id);
        if(!parentCategory){
          console.log("Please Enter correct Category Id");
          return res.status(404).json({
            success:false,
            message:"Category Id not found please enter latest category id"
          })
        }        

     const existingSubCategory = await Subcategory.findOne({sub_category_name:sub_category_name.toLowerCase()});
     if(existingSubCategory){
      return res.status(403).json({
        success:false,
        message:"Sub-Category already exists no need to insert it"
      })    

     }
    
    // const originalNameOfImage = req.file?.originalname;
    // const destination = req.file?.destination;
    // const imageUrl = `${destination}/${originalNameOfImage}`;
    // console.log("Final Image Url",imageUrl);
     
    // Adding Subcategory:
     const fileName = `assets/${req.file.originalname}`;
        const logo_url = await uploadToFirebaseStorage(
            req.file.buffer,
            fileName,
            req.file.mimetype
          );



    const addSubCategory = await new Subcategory({
      sub_category_name:sub_category_name?.toLowerCase(),
      sub_category_logo:logo_url,
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
      console.log("Error occured while adding Sub-category",err);
      return res.status(501).json({
        success:false,
        message:"Error occured while adding Sub-category"
      })  
 


    }


}

const fetchAllSubCategories = async(req,res)=>{
   try{
       console.log("Fetch all sub categories was hit");
       const userDetails = req.user;
       const allowedUsers = ['admin','superadmin'];
       const granted_permissions = userDetails.permission_component; 
       if(!allowedUsers.includes(userDetails.role)){
           console.log("Un-authorised access only admin and superadmin allowed");
           return res.status(403).json({
            success:false,
            message:"Un-authorised access only admin and superadmin allowed"

           })  

         }
       if(!granted_permissions[0].can_read_records){
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch all sub-categories`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch all sub-categories`
             })
         }
        // Preparing to fetch all sub-categories
        const allSubCategories = await Subcategory.find();
        if(allSubCategories.length>=1){
           console.log("All Sub-categories found successfully");
           return res.status(200).json({
            success:true,
            message:"All Sub-categories found successfully",
            Subcategories:allSubCategories
           })
        }else{
          console.log("All Sub-categories not found");
           return res.status(404).json({
            success:false,
            message:"All Sub-categories not found",
           }) 
        }  
         
   }
   catch(err){
       console.log("error occured while fetching all sub-categories",err);
       return res.status(501).json({
        success:false,
        message:"Error occured while fetching all sub-categories"
       }) 


   }


}



export {addSubCategory,fetchAllSubCategories};