import Category from "../../models/category.model.js";
import {uploadToFirebaseStorage} from "../../helpers/uploadtofirebase.js"
import mongoose from "mongoose";
const addCategory = async(req,res)=>{
  try{
    console.log("Add category route was hit");
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
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add categories`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to add categories`
             })
         }

    const {category_name} = req.body;
     if(!category_name || !req.file){
        return res.status(401).json({
            success:false,
            message:"All fields are required"
        })
     }
     // Checking whether category exists:
     const existingCategory = await Category.findOne({category_name:category_name.toLowerCase()});
     if(existingCategory){
      return res.status(403).json({
        success:false,
        message:"Category already exists no need to insert it"
      })    

     }    
    // const originalNameOfImage = req.file?.originalname;
    // const destination = req.file?.destination;
    // const imageUrl = `${destination}/${originalNameOfImage}`;
    // console.log("Final Image Url",imageUrl);
     
    // Adding Category:
    const fileName = `assets/${req.file.originalname}`;
        const logo_url = await uploadToFirebaseStorage(
            req.file.buffer,
            fileName,
            req.file.mimetype
          );
    const addCategory = await new Category({
      category_name:category_name?.toLowerCase(),
      category_logo:logo_url

    }).save();

    if(addCategory){
      console.log("Category was added successfully");  
      return res.status(201).json({
        success:true,
        message:"Category was added successfully",
        category:addCategory
      })       
    }
    else{
       console.log("Category was not added");
       return res.status(404).json({
        success:false,
        message:"Category was not added"
      }) 

    }

  }catch(err){
   console.log("Error occured while Adding category",err) 
    return res.status(501).json({
        success:false,
        message:"Error occured while Adding category"
    });

  }



}
const updateCategory = async(req,res)=>{
    try{
       console.log("Update category route was hit");
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
       if(!granted_permissions[0].can_update_records){
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to update categories`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to update categories`
             })
         }
       const category_id = req.query.category_id;
       let category_name = req.body.category_name;
       const filterObj  = {};
        if(category_name){
          filterObj.category_name = category_name.toLowerCase();
        }
       console.log("Category Id",category_id,category_name);
       // checking category_id is valid or not:
       if(!category_id || !mongoose.Types.ObjectId.isValid(category_id)){
          return res.status(403).json({
            success:false,
            message:"Category not found or invalid category"
          }); 
       }
      //  console.log("Files in request",req.file); 
        const fileName = `assets/${req.file.originalname}`;
        const logo_url = await uploadToFirebaseStorage(
            req.file.buffer,
            fileName,
            req.file.mimetype
          );
       const updateFilter={_id:category_id}
       if(logo_url){
           filterObj.category_url = logo_url; 

       }
       
       const updateCategory = await Category.updateOne(updateFilter,{
        $set:filterObj
       });

       if(updateCategory){
          console.log("Category updated successfully");
          return res.status(201).json({
            success:true,
            message:"Category updated successfully"
          });
       }
       else{
          console.log("Category was not updated");
          return res.status(404).json({
            success:true,
            message:"Category not updated"
          });
       }
    }
    catch(err){
      console.log("Error occured while updating the Category",err)
      return res.status(501).json({
        success:false,
        message:"Error occured while updating the Category"
      });
    }


}


const fetchAllCategories = async(req,res)=>{
    try{
        console.log("Fetch all categories route was hit");
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
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch categories`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch categories`
             })
         }

       // preparing categories to be fetched:
       
       const allCategories = await Category.find();
       if(allCategories.length){
           console.log("Categories found successfully");
           return res.status(200).json({
            success:true,
            message:"All categories found successfully",
            Categories:allCategories
           })

       }else{
           console.log("Categories not found");
           return res.status(404).json({
            success:false,
            message:"Catgories were not founc",
           })


       }   
      
    }catch(err){
      console.log("Error occured while fetching all categories",err);
      return res.status(501).json({
        success:false,
         message:"Error occured while fetching all categories"
      }) 



    }




}

const deleteCategory = async(req,res)=>{
    try{

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
       if(!granted_permissions[0].can_delete_records){
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to delete categories`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to delete categories`
             })
         }
        const category_id = req.query.category_id;
        if(!category_id || !mongoose.Types.ObjectId.isValid(category_id)){
           return res.status(403).json({
            success:false,
            message:"Category id not found or invalid category id"
           }) 
        }
      const delFilter = {_id:category_id};
         const deleteCategory = await Category.deleteOne(delFilter);
         if(deleteCategory){
            return res.status(201).json({
              success:true,
              message:"Category deleted successfully"
            })
         }else{
             return res.status(404).json({
              success:false,
              message:"Category was not deleted"
            })


         }



    }
    catch(err){
       console.log("Error occured while deleting Category");
       return res.status(501).json({
        success:false,
        message:"Error occured while deleting category"
       })

    }
   
}

const fetchsubCategoriesOfCategories = async(req,res)=>{
    try{
       console.log("Products of categories was hit"); 
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
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch of subcategoires under catgory`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch subcategoires under catgory`
             })
         }

      let categoryProducts = await Category.aggregate([
  {
    $lookup: {
      from: "subcategories",
      localField: "_id",
      foreignField: "parent_category",
      as: "result"
    }
  },
  {
     $project: {
       _id:0,
       category_id:"$_id",
       category_name:1,
       category_logo:1,
       total_subcategories:{$size:"$result"} 
     }    
  },
   {
    $sort: {
      total_subcategories:-1
    }
  },
  {
    $limit: 10
  }

]); 
        console.log("subcategoires under catgory",categoryProducts);                                               
         if(categoryProducts.length>=1){
            console.log("subcategoires under catgory found successfully");
            return res.status(200).json({
              success:true,
              message:"Subcategoires under catgory found successfully",
              catgoryProducts:categoryProducts

            }) 
         }else{
           
          console.log("subcategoires under catgory not found");
            return res.status(404).json({
              success:false,
              message:"Subcategoires under catgory not found",

            })
         }
     }
    catch(err){
     console.log("Error occured in subcategoires under catgory",err);
            return res.status(501).json({
              success:false,
              message:"Error occured in subcategoires under catgory",

            })
    }




}
export {addCategory,updateCategory,fetchAllCategories,deleteCategory,fetchsubCategoriesOfCategories};
