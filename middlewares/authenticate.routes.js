import jwt from "jsonwebtoken";

const authenticateJWT = async(req,res,next)=>{
    try{
        // console.log("Auth middleware was hit");
       let token = req.header('authorization').split(" ")[1];
       if(!token){
           console.log("Please login first");
           return res.status(403).json({
            success:false,
            message:"Un-authorized Kindly login first!"
           })       
       }
       
       try{

       
        let verifyToken = jwt.decode(token,process.env.JWT_SECRET_KEY);
        //  console.log("Verified token",verifyToken); 
         req.user = verifyToken.Users;
         next();
       }catch(err){
          console.log("Invalid token");
          return res.status(403).json({
            success:false,
            message:"Invalid-token"
          })

       }


       
       
          
             


    }
    catch(err){
      console.log("Error occured in Auth",err);
    }

}
export {authenticateJWT};

