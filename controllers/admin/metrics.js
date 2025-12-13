import Metrics from "../../models/metrics.model.js";

const addMetrics = async(req,res)=>{
   try{
       console.log("Add metrics route was hit");
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
       if(!granted_permissions[0].can_add_records){
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add metrics`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to add metrics`
             })
         }  
    //   console.log("User in request",userDetails);
      let {dimension_name} = req.body;
       console.log("upcomming dimension ",dimension_name.toUpperCase()); 
       // checking if dimension already Exists:
       const existingDimension  = await Metrics.findOne({dimension_name:dimension_name.toUpperCase()});
       if(existingDimension) return res.status(403).json({
        success:false,
        message:"Dimension already exists!"
       })
       // preparing dimension to Enter: 
       const newDimension = await new Metrics({
        dimension_name:dimension_name.toUpperCase()
       }).save();
       if(newDimension){
        console.log("Metrics added successfully");
        return res.status(201).json({
            success:true,
            message:"Metrics added successfully",
            Dimension:newDimension
        })
       }else{
        console.log("Metrics was not added");
        return res.status(404).json({
            success:false,
            message:"Metrics was not added",
            Dimension:newDimension
        })
       } 
        
         
      
      
   }
   catch(err){
      console.log("Error occured while Adding metrics",err);
      return res.status(501).json({
        success:false,
        message:"Error occured while adding metrics"
      })
   }
}

const fetchAllMetrics = async(req,res)=>{
   try{
      console.log("fetch all metrics route was hit");
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
       if(!granted_permissions[0].can_add_records){
             console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add metrics`);
             return res.status(403).json({
              success:false,
              message:`${userDetails.first_name} as a ${userDetails.role} is not allowed to add metrics`
             })
         }
      // preparing all metrics to fetch
      const metrics  = await Metrics.find();
       console.log("Metrics",metrics);
       if(metrics.length>=1){
          console.log("Metrics found successfully");
          return res.status(200).json({
            success:true,
            message:"Metrics found successfully",
            metrics:metrics
          })
       }else{
          console.log("Metrics were not found");
          return res.status(404).json({
            success:true,
            message:"Metrics were not found",
            
          })
       }   

   }
   catch(err){
     console.log("Error occured while fetching all Metrics",err);
     return res.status(501).json({
      success:false,
      message:"Error occured while fetching all Metrics"
     })


   }

}

export {addMetrics,fetchAllMetrics};