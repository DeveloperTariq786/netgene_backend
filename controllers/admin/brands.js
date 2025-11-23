import Brand from "../../models/brand.model.js";
import {uploadToFirebaseStorage} from "../../helpers/uploadtofirebase.js";

const addBrand = async(req,res)=>{
  try{
    console.log("Add brand route was hit",req.file);
    const {brand_name} = req.body;
     // checking whether it exists or not:     
     if(!brand_name || !req.file){
        return res.status(401).json({
            success:false,
            message:"Please enter all fields"
        })
     }
     const existingBrand = await Brand.findOne({brand_name:brand_name.toLowerCase()});
     if(existingBrand){
      return res.status(403).json({
        success:false,
        message:"Brand already exists no need to insert it"
      })    

     }
     
    const fileName = `assets/${req.file.originalname}`;
    const logo_url = await uploadToFirebaseStorage(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );
    if(logo_url){
            
    const addBrand = await new Brand({
                         brand_name:brand_name?.toLowerCase(),
                         brand_logo:logo_url
                         }).save();

    if(addBrand){
      console.log("Brand was added");  
      return res.status(201).json({
        success:true,
        message:"Brand was added successfully",
        Brand:addBrand
      })       
    }
    else{
       console.log("Brand was not added");
       return res.status(404).json({
        success:false,
        message:"Category was not added"
      }) 

    }
   }

  }catch(err){
    console.log("Error occured while Adding Brand",err);

    return res.status(501).json({
        success:false,
        message:"Error occured while Adding Brand"
    })
  }
}

export {addBrand}