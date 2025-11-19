import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema  = new mongoose.Schema({
   first_name:{
    type:String,
    required:true
   },
   last_name:{
    type:String,
    required:true
   },
   phone_number:{
    type:String,
    required:true 
   },
   email:{
    type:String,
    required:true
   },
   password:{
    type:String,
    required:true
   },
   role:{
    type:String,
    enum:['admin','customer'],
    default:"admin"
   }           



},{timestamps:true});
UserSchema.pre("save",async function(next){
   if(!this.isModified('password')){
      return next();
  
   }
    this.password = await bcrypt.hash(this.password,10); 
    next();
})
UserSchema.methods.isPasswordCorrect = async function (password){
  // console.log("Password Hash is Schema",password);
           return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User",UserSchema);

export default User;