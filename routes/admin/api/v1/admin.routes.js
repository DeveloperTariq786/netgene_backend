import express from "express";
const router  = express.Router();
import { upload } from "../../../../middlewares/imageupload.js";
import {adminLogin, adminRegister} from "../../../../controllers/admin/admin.login.js";
import {addProduct, fetchAllProducts} from "../../../../controllers/admin/products.js";
import { addCategory, deleteCategory, fetchAllCategories,fetchsubCategoriesOfCategories, updateCategory } from "../../../../controllers/admin/categories.js";
import { addSubCategory, deleteSubCategory, fetchAllSubCategories, fetchSubCategoriesWithProducts, updateSubCategory } from "../../../../controllers/admin/sub_categories.js";
import { addBrand, getAllBrands, getBrand, updateBrand } from "../../../../controllers/admin/brands.js";
import { addUsers } from "../../../../controllers/admin/users.js";
import { authenticateJWT } from "../../../../middlewares/authenticate.routes.js";

// Admin login/signup routes:
router.post('/register',adminRegister);
router.post('/login',adminLogin);

// Admin Product routes:
router.post('/add-product',upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover_images", maxCount:20}
  ]),authenticateJWT,addProduct);
router.get('/products',authenticateJWT,fetchAllProducts);


// Admin category routes:
router.post('/add-category',upload.single("category_logo"),authenticateJWT,addCategory);
router.put('/update-category',upload.single("category_logo"),authenticateJWT,updateCategory);
router.get("/categories",authenticateJWT,fetchAllCategories);
router.delete('/category',authenticateJWT,deleteCategory);
router.get("/categories/sub-categories",authenticateJWT,fetchsubCategoriesOfCategories);



// Admin Sub-category routes:
router.post('/add-subcategory',upload.single("sub_category_logo"),authenticateJWT,addSubCategory);
router.get('/sub-categories',authenticateJWT,fetchAllSubCategories);
router.put('/update-subcategory',upload.single("sub_category_logo"),authenticateJWT,updateSubCategory);
router.get("/sub-categories/products",authenticateJWT,fetchSubCategoriesWithProducts);
router.delete('/sub-category',authenticateJWT,deleteSubCategory);


// Admin Brand routes:

router.post('/add-brand',upload.single("brand_logo"),addBrand);
router.put('/update-brand',upload.single("brand_logo"),updateBrand);
router.get('/brand',getBrand);
router.get('/brands',getAllBrands);

// Admin User routes:
router.post('/user',authenticateJWT,addUsers);

export {router};