import express from "express";
const router  = express.Router();
import { upload } from "../../../../middlewares/imageupload.js";
import {adminLogin, adminRegister} from "../../../../controllers/admin/admin.login.js";
import {addProduct} from "../../../../controllers/admin/products.js";
import { addCategory } from "../../../../controllers/admin/categories.js";
import { addSubCategory } from "../../../../controllers/admin/sub_categories.js";
import { addBrand } from "../../../../controllers/admin/brands.js";
// Admin login/signup routes:
router.post('/register',adminRegister);
router.post('/login',adminLogin);

// Admin Product routes:
router.post('/add-product',upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover_images", maxCount:20}
  ]),addProduct);

// Admin category routes:
router.post('/add-category',upload.single("category_logo"),addCategory);




// Admin Sub-category routes:
router.post('/add-subcategory',upload.single("sub_category_logo"),addSubCategory);



// Admin Brand routes:

router.post('/add-brand',upload.single("brand_logo"),addBrand)
export {router};