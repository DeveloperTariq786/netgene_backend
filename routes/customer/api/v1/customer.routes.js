import express from "express";
const router = express.Router();

// Dashboard routes:

import { getBrandsWithProducts, getCategoriesWithSubCategories } from "../../../../controllers/customer/dashboard/dashboard.js";

router.get('/brands', getBrandsWithProducts);
router.get('/categories', getCategoriesWithSubCategories);

export { router };
