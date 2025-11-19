import mongoose from "mongoose";



const connectDb = async()=>{
    let string  = `${process.env.MONGO_URI}`;
    // console.log("DB_NAME",string)
   await mongoose.connect(string);   

}

export default connectDb;