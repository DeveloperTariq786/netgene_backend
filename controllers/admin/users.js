import User from "../../models/user.model.js";


const addUsers = async(req,res)=>{
  try{
          const loggedUser  = req.user;
          console.log("Add user route hit",loggedUser.role); 
          const accessParams = ["superadmin","admin"];
          const accessRole = loggedUser.role;
       if(!accessParams.includes(accessRole)){
          console.log("Roles other than admin and super admin not allowed");
           return res.status(403).json({
            success:false,
            message:"Roles other than admin and super admin not allowed"
           })


       }     
      let {first_name,last_name,phone_number,email,password,role} = req.body;
         if(!first_name || !last_name || !phone_number || !email || !password || !role){
             console.log("All fields are required");
             return res.status(403).json({
                success:false,
                message:"All fields are required!"
             });

         }
         // checking whether user exists:
         const existingUser = await User.find({email:email});
              if(existingUser.length){
                console.log("User already exists");
                 return res.status(403).json({
                    success:false,
                    message:"User alredy exists please add new"
                 })
 

              }
         

        const permissions = [];
        // const userObj = {};
      if(loggedUser.role==="superadmin" && role==="superadmin"){
          let obj = {
            can_add_superadmin:true,
            can_add_admin:true,
            can_add_records:true,
            can_update_records:true,
            can_read_records:true,
            can_delete_records:true

          }
          permissions.push(obj); 
            
      }
      else if(loggedUser.role==="superadmin" && role==="admin"){

             let obj = {
            can_add_superadmin:false,
            can_add_admin:true,
            can_add_records:true,
            can_update_records:true,
            can_read_records:true,
            can_delete_records:false

          }
          permissions.push(obj); 


      }
      else if(loggedUser.role==="admin" && role==="admin"){

            let obj = {
            can_add_superadmin:false,
            can_add_admin:true,
            can_add_records:true,
            can_update_records:true,
            can_read_records:true,
            can_delete_records:false

          }
          permissions.push(obj); 

      }
      else if(loggedUser.role==="admin" && role==="superadmin"){
           return res.status(403).json({
             success:false,
             message:"Admin cant add superadmin"

           })


      }else{
           return res.status(403).json({
            success:false,
            message:"No more roles allowed",
            role:role,
           })
      } 
      
      console.log("Permissions given",permissions);
      // preparing users to create:
       const createUser  =  await new User({
        first_name:first_name.toLowerCase(),
        last_name:last_name.toLowerCase(),
        email:email.toLowerCase(),
        password:password,
        phone_number:phone_number,
        role:role.toLowerCase(),
        permission_component:permissions
       }).save();
       if(createUser){
           console.log("User created successfully");
           return res.status(201).json({
            success:true,
            message:"User created successfully",
            User:createUser
           })
       }
       else{
            console.log("User was not created!") 
            return res.status(401).json({
            success:true,
            message:"User was not created "
           })


       } 

                                      

  }
  catch(err){
    console.log("Error occured while Adding user",err);
    return res.status(501).json({
        success:false,
        message:"Error occured while Adding User"
    });

  }
}

export {addUsers};



