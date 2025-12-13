

const getInventoryStockStatus = async(stock)=>{
  try{
      if(stock > 0 && stock<=10){
        return "Low Of Stock";
      }
      if(stock>10){
         return "In Stock"

      }
      else if(stock<=0){
         return "Out Of Stock"
      }


  }catch(err){
    console.log("Error occured in Stock status helper method",err);
  }

};
export default getInventoryStockStatus;