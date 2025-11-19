import mongoose from "mongoose";
const ImageSchema = new mongoose.Schema({
    url:{
        type:String,
        required:false
    }

});
const ReviewsSchema =new mongoose.Schema({
   commented_by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
      
   },
   comments:{
    type:String
   }    

});
const LikedAndUnlikedSchema = new mongoose.Schema({
   likedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    isLiked:Boolean
   } 
})

const ProductSchema = new mongoose.Schema({
product_name:{
    type:String,
    required:true
},
product_description:{
    type:String,
    default:"Not Known"
},
product_quantity:{
    type:Number,
    required:true,
},
product_price:{
    type:Number,
    required:true,
    default:0
},
discount_precentage:{
    type:Number,
    required:true,
    default:0
},
final_price:{
    type:Number,
    
},
product_brand:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Brand"
},
product_category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Category"
},
product_sub_category:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Subcategory"
},
avatar:{
    type:String,
       
},
cover_images:[ImageSchema],
product_reviews:[ReviewsSchema],
product_likes:[LikedAndUnlikedSchema],
added_by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
},
updated_by:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
}
},{timestamps:true});

const Product = mongoose.model("Product",ProductSchema);
export default Product;