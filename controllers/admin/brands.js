import Brand from "../../models/brand.model.js";


const addBrand = async(req,res)=>{
  try{
    console.log("Add brand route was hit",req.file);
    const {brand_name} = req.body;
     if(!brand_name){
        return res.status(401).json({
            success:false,
            message:"Please enter brand name"
        })
     }
    
    const originalNameOfImage = req.file?.originalname;
    const destination = req.file?.destination;
    const imageUrl = `${destination}/${originalNameOfImage}`;
    console.log("Final Image Url",imageUrl);
     
    // Adding Brand:

    const addBrand = await new Brand({
      brand_name:brand_name?.toLowerCase(),
      brand_logo:imageUrl

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


  }catch(err){
    console.log("Error occured while Adding Brand",err);

    return res.status(501).json({
        success:false,
        message:"Error occured while Adding Brand"
    })


  }


}

export {addBrand}