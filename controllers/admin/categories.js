import Category from "../../models/category.model.js";

const addCategory = async(req,res)=>{
  try{
    console.log("Add category route was hit",req.file);
    const {category_name} = req.body;
     if(!category_name){
        return res.status(401).json({
            success:false,
            message:"Please enter category name"
        })
     }
    
    const originalNameOfImage = req.file?.originalname;
    const destination = req.file?.destination;
    const imageUrl = `${destination}/${originalNameOfImage}`;
    console.log("Final Image Url",imageUrl);
     
    // Adding Category:

    const addCategory = await new Category({
      category_name:category_name?.toLowerCase(),
      category_logo:imageUrl

    }).save();

    if(addCategory){
      console.log("Category was added");  
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
