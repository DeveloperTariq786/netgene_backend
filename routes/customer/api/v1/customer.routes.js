import express from "express";
const router = express.Router();

// Dashboard routes:

import { getBrandsWithProducts } from "../../../../controllers/customer/dashboard/dashboard.js";

router.get('/dashboard/brands', getBrandsWithProducts);

export { router };
