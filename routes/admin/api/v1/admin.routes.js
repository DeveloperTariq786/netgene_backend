import express from "express";
const router = express.Router();
import { upload } from "../../../../middlewares/imageupload.js";
import { adminLogin, adminRegister } from "../../../../controllers/admin/admin.login.js";
import { addProduct, fetchAllProducts, updateProduct } from "../../../../controllers/admin/products.js";
import { addCategory, deleteCategory, fetchAllCategories, fetchsubCategoriesOfCategories, updateCategory } from "../../../../controllers/admin/categories.js";
import { addSubCategory, deleteSubCategory, fetchAllSubCategories, fetchSubCategoriesWithProducts, updateSubCategory } from "../../../../controllers/admin/sub_categories.js";
import { addBrand, getAllBrands, getBrand, getproductsOfBrand, updateBrand } from "../../../../controllers/admin/brands.js";
import { addUsers, getAllUsers, updateUser } from "../../../../controllers/admin/users.js";
import { authenticateJWT } from "../../../../middlewares/authenticate.routes.js";
import { addMetrics, fetchAllMetrics } from "../../../../controllers/admin/metrics.js";
import { bulkUpdateInventory, getBulkInventory, updateInverntory } from "../../../../controllers/admin/inventory.js";
import { fetchAllOrders } from "../../../../controllers/admin/orders.js";
import { router as dashboardRouter } from "./dashboard.routes.js";
import { AddcarouselItem, deleteCarouselItems, fetchCarouselItems, updateCarouselItem } from "../../../../controllers/admin/carousel.js";
import { AddBannerItem, deleteBannerItems, fetchBannerItems, updateBannerItem } from "../../../../controllers/admin/banner.js";
import { AddCountdownItem, fetchCountdownItems } from "../../../../controllers/admin/countdown.js";

// Admin dashboard routes:
router.use('/dashboard', dashboardRouter);

// Admin login/signup routes:
router.post('/register', adminRegister);
router.post('/login', adminLogin);

// Admin Product routes:
router.post('/add-product', upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover_images", maxCount: 20 }
]), authenticateJWT, addProduct);
router.put('/update-product', upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "cover_images", maxCount: 20 }
]), authenticateJWT, updateProduct);
router.get('/products', authenticateJWT, fetchAllProducts);


// Admin category routes:
router.post('/add-category', upload.single("category_logo"), authenticateJWT, addCategory);
router.put('/update-category', upload.single("category_logo"), authenticateJWT, updateCategory);
router.get("/categories", authenticateJWT, fetchAllCategories);
router.delete('/category', authenticateJWT, deleteCategory);
router.get("/categories/sub-categories", authenticateJWT, fetchsubCategoriesOfCategories);



// Admin Sub-category routes:
router.post('/add-subcategory', upload.single("sub_category_logo"), authenticateJWT, addSubCategory);
router.get('/sub-categories', authenticateJWT, fetchAllSubCategories);
router.put('/update-subcategory', upload.single("sub_category_logo"), authenticateJWT, updateSubCategory);
router.get("/sub-categories/products", authenticateJWT, fetchSubCategoriesWithProducts);
router.delete('/sub-category', authenticateJWT, deleteSubCategory);


// Admin Brand routes:

router.post('/add-brand', upload.single("brand_logo"), authenticateJWT, addBrand);
router.put('/update-brand', upload.single("brand_logo"), authenticateJWT, updateBrand);
router.get('/brand', authenticateJWT, getBrand);
router.get('/brands', authenticateJWT, getAllBrands);
router.get('/brands/products', authenticateJWT, getproductsOfBrand);

// Admin Metrics routes:
router.post('/add-metrics', authenticateJWT, addMetrics);
router.get('/metrics', authenticateJWT, fetchAllMetrics);
// Admin inventory routes:
router.put('/update-inventory', authenticateJWT, updateInverntory);
router.put('/bulk-inventory-update', authenticateJWT, bulkUpdateInventory);
router.get('/inventory', authenticateJWT, getBulkInventory);

// Admin User routes:
router.post('/user', authenticateJWT, addUsers);
router.get('/users', authenticateJWT, getAllUsers);
router.put('/update-user', authenticateJWT, updateUser);

// Admin Order routes:
router.get('/orders', authenticateJWT, fetchAllOrders);

// Admin carousel route:
router.post('/add-carousel', upload.single("carousel_img"), authenticateJWT, AddcarouselItem);
router.put('/update-carousel', upload.single("carousel_img"), authenticateJWT, updateCarouselItem);
router.get('/carousel', authenticateJWT, fetchCarouselItems);
router.delete('/carousel', authenticateJWT, deleteCarouselItems);

// Admin banner route:
router.post('/add-banner', upload.single("banner_img"), authenticateJWT, AddBannerItem);
router.put('/update-banner', upload.single("banner_img"), authenticateJWT, updateBannerItem);
router.get('/banner', authenticateJWT, fetchBannerItems);
router.delete('/banner', authenticateJWT, deleteBannerItems);

// Admin countdown route:
router.post('/add-countdown', upload.single("countdown_img"), authenticateJWT, AddCountdownItem);
router.get('/countdown', authenticateJWT, fetchCountdownItems);

export { router };