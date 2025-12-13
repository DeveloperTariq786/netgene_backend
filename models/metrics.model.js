import mongoose from "mongoose";

const MetricsSchema = new mongoose.Schema({
  dimension_name:   {type: String,required:true}
},{timestamps:true});

const Metrics  = mongoose.model("Metrics",MetricsSchema);
export default Metrics;

