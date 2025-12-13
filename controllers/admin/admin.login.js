 import User from "../../models/user.model.js";
 import jwt from "jsonwebtoken";

const adminRegister = async(req,res)=>{
    try{
      console.log(`Admin Register was hit`);
      let {first_name,last_name,email,password,phone_number,role} = req.body;
          if(role!="superadmin"){
              return res.status(403).json({
                success:false,
                message:"Only special members are allowed"
              }) 

          }
        if(!first_name || !last_name || !email || !password || !phone_number || !role){
           console.log("All fields are Necessary");   
           return res.status(403).json({
            success:false,
            message:"Please Enter all fields"
           })
        }
        const existingUser = await User.find({email:email,first_name:first_name});
        if(existingUser.length){
           console.log("User already Registered Please login"); 
           return res.status(401).json({
            success:false,
            message:"User already Registered Please login"
           })
        }
        // preparing permissions for special user:
        const permissions = [
          {
             can_add_superadmin:true,
             can_add_admin:true,
             can_add_records:true,  
             can_update_records:true,
             can_read_records:true,
             can_delete_records:true
          }

        ]
       let newUser = await new User({
        first_name:first_name.toLowerCase(),
        last_name:last_name.toLowerCase(),
        email:email.toLowerCase(),
        password:password,
        phone_number:phone_number,
        role:role,
        permission_component:permissions
       }).save()
       if(newUser){
        console.log("New user registered successfully",newUser);
        return res.status(201).json({
         success:true,
         message:"Admin registered successfully!",
          Admin:{
            name: `${newUser.first_name}`,
            email:`${newUser.email}`

         }


        }) 

       }
       else{

        return res.status(404).json({
         success:false,
         message:"Admin was not registered!",
        //  Admin:newUser 


        }) 
           

       }
    }
    
    catch(err){
     console.log(`Error Ocurred While Registering Admin ${err}`);
     
     return res.status(404).json({
         success:false,
         message:"Error Ocurred While Registering Admin",
        });

    }



}
const adminLogin = async(req,res)=>{
  try{
    console.log("Admin login was hit");
   const {email,password} = req.body;
   if(!email || !password){
     return res.status(403).json({
      success:false,
      message:"All fields are required!"
     })

   }
   // verfiying  valid user :
   const validUser = await User.findOne({email:email});
         
       if(!validUser){
          // checking if user exists or not:
           return res.status(404).json({
            success:false,
            message:"Wrong email entered or register first" 
           }) 
          
       }
      //  checking whether password matches or not:
        let verifiedUser = await validUser.isPasswordCorrect(password);  
           if(!verifiedUser){
              return res.status(404).json({
               success:false,
               message:"Wrong password entered or register first!"
              })
           } 
     // Generating  of Token for protection of further end-points  
      // console.log("JWT TOKEN",jwt);
      const Token = jwt.sign({Users:validUser._doc},process.env.JWT_SECRET_KEY,{expiresIn:"2d"});
      console.log("Token has been Generated",Token); 
      const userDetails = {
        email:validUser.email,
        name: `${validUser.first_name} ${validUser.last_name}`,
        role:validUser.role,
        permission:validUser.permission_component
      };

       if(Token){
         return res.status(201).json({
            success:true,
            Message:"User logged In Successfully!",
            user:userDetails,
            Token:Token

         })
       }                             

  }
  catch(err){
   console.log("Error occured while Login",err);
    return res.status(501).json({
      success:false,
      Message:"Error occured while Logging in",
      error:err.message
    })

  }  
}

export {adminRegister,adminLogin};

