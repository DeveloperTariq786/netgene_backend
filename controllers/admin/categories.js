import Category from "../../models/category.model.js";
import {uploadToFirebaseStorage} from "../../helpers/uploadtofirebase.js"
const addCategory = async(req,res)=>{
  try{
    console.log("Add category route was hit");
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
export {addCategory};
