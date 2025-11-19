import dotenv from "dotenv";
dotenv.config();  
import express from "express";
import {router as adminRouter} from "./routes/admin/api/v1/admin.routes.js";
import connectDb from "./config/db/connect.js";
import cors from "cors";
const app = express();
app.use(cors());
connectDb().then(()=>{
  console.log("Connected to the db successfully");
}).catch((err)=>{
  console.log(` error occured while connecting db ${err}`);
})

// Midllewares to parse JSON:    
app.use(express.urlencoded({extended:true}));
app.use(express.json());
// Middleware to get path to the public folder where we store images/pdf's,etc:
app.use(express.static('public')); 
const PORT = process.env.PORT_NUMBER || 3000;

// possible routes:

app.get('/',(req,res)=>{
  console.log("Home Route Was Hit");
  res.send("<h1> Welcome to the Ecomm App <h1/>");  


})
// rest end-points:
// admin routes:
app.use('/api/v1/admin',adminRouter);

app.listen(PORT,()=>{
   console.log(`Listening to the portNumber ${PORT}`); 

})

