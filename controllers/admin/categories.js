import Category from "../../models/category.model.js";
import {uploadToFirebaseStorage} from "../../helpers/uploadtofirebase.js"
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
       if(allCategories){
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
export {addCategory,fetchAllCategories};
