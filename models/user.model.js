import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const PermissionSchema = new Schema({
   can_add_superadmin: {
      type: Boolean,
      default: true,
   },
   can_add_admin: {
      type: Boolean,
      default: true,
   },
   can_add_records: {
      type: Boolean,
      default: true,
   },
   can_update_records: {
      type: Boolean,
      default: true,
   },
   can_read_records: {
      type: Boolean,
      default: true,
   },
   can_delete_records: {
      type: Boolean,
      default: true,
   },
   is_customer: {
      type: Boolean,
      default: false
   }
})

const UserSchema = new mongoose.Schema({
   first_name: {
      type: String,
      required: true
   },
   last_name: {
      type: String,
      required: true
   },
   phone_number: {
      type: String,
      //  required:true 
   },
   email: {
      type: String,
      required: true
   },
   password: {
      type: String,
      required: true
   },
   role: {
      type: String,
      enum: ['admin', 'customer', "superadmin"],
      required: true
   },
   permission_component: [PermissionSchema]



}, { timestamps: true });
UserSchema.pre("save", async function (next) {
   if (!this.isModified('password')) {
      return next();

   }
   this.password = await bcrypt.hash(this.password, 10);
   next();
})
UserSchema.methods.isPasswordCorrect = async function (password) {
   // console.log("Password Hash is Schema",password);
   return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", UserSchema);

export default User;