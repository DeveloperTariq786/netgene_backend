import express from "express";
const router = express.Router();

// Dashboard routes:

import { fetchNewProducts, getBrandsWithProducts, getCategoriesWithSubCategories, getFeaturedProducts } from "../../../../controllers/customer/dashboard/dashboard.js";

router.get('/brands', getBrandsWithProducts);
router.get('/categories', getCategoriesWithSubCategories);
router.get('/featured', getFeaturedProducts);
router.get('/new', fetchNewProducts);

export { router };
