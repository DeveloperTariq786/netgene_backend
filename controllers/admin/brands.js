import Brand from "../../models/brand.model.js";
import {uploadToFirebaseStorage} from "../../helpers/uploadtofirebase.js";
import { mongoose } from 'mongoose';

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

const updateBrand = async(req,res)=>{
  try{
    let brandObj = {};
    console.log("Update brand was hit");
    const {brand_name} = req.body;
    brandObj.brand_name = brand_name.toLowerCase(); 
    const brand_id = req.query.brand_id;    
     if(!brand_id || !mongoose.Types.ObjectId.isValid(brand_id)){
       console.log("Please select brand or brand not valid");
       return res.status(403).json({
        success:false,
        message:"Invalid brand or select brand"
       })
     }
     // checking whether brand exists :
     const checkBrand = await Brand.findById(brand_id);  
     if(!checkBrand){
        return res.status(403).json({
          success:false,
          message:"Brand does not exists please add brand first"
        })

     }
      //
      let logo_url;
      if(req?.file){    
     const fileName = `assets/${req.file.originalname}`;
      logo_url = await uploadToFirebaseStorage(
        req.file.buffer,
        fileName,
        req.file.mimetype
      );
       }
       // preparing brand to get updated:
         const brandFilter = {_id:brand_id};
         if(logo_url){
            brandObj.brand_logo = logo_url;          
         } 
      let updateBrand = await Brand.updateOne(brandFilter,{
                                              $set:brandObj     
      });
      if(updateBrand){
        console.log("Brand updated successfully");
        return res.status(201).json({
          success:true,
          message:"Brand updated successfully",
        })
      }else{
         return res.status(404).json({
          success:false,
          message:"Brand was not updated"
         })
      }

     
  }
  catch(err){
   console.log("Error occured while updating the brand",err);
    return res.status(501).json({
      success:false,
      message:"Error occured while updating the brand"
    })

  }
}

const getBrand = async(req,res)=>{
  try{
    console.log("Get brand was hit");
    const {brand_id} = req.query;
    if(!brand_id || !mongoose.Types.ObjectId.isValid(brand_id)){
      return res.status(403).json({
        success:false,
        message:"Select brand or invalid brand"
      });
    }

    let getSingleBrand = await Brand.findById(brand_id).select({_id:1,brand_name:1,brand_logo:1});
    if(getSingleBrand){
        console.log("Brand Fetched Successfully");
        return res.status(200).json({
          success:true,
          message:"Brand found Successfully",
          Brand:getSingleBrand
        })
    }
    else{
      console.log("Brand was not found!");
        return res.status(404).json({
          success:false,
          message:"Brand was not found",
        })
    }



  }catch(err){
    console.log("Error occured while fetching single brand",err);
    return res.status(501).json({
      success:false,
      message:"Error occured while fetching single brand"
    })

  }
}
const getAllBrands = async(req,res)=>{
  try{
    console.log("Get all brands was hit");
    const data = await Brand.find().select({_id:1,brand_name:1,brand_logo:1}).sort({createdAt:-1});
     if(data.length){
        console.log("Brands fetched successfully");
        return res.status(200).json({
          success:true,
          message:"Brands fetched successfully",
          allBrands:data
        });

     }
     else{
        console.log("Brands not found please add some brands first");

         return res.status(404).json({
          success:false,
          message:"Brands not found please add some brands first",
        });
     }

  }
  catch(err){
    console.log("Error occured while fetching all brands",err);
    return res.status(501).json({
      success:false,
      message:"Error occured while fetching all brands"
    })
  }

}

export {addBrand,updateBrand,getBrand,getAllBrands}