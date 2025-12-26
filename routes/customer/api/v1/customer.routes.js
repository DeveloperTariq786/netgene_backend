import express from "express";
const router = express.Router();
import { authenticateJWT } from "../../../../middlewares/authenticate.routes.js";
import { dashboardData, fetchNewProducts, getBrandsWithProducts, getCategoriesWithSubCategories, getFeaturedProducts } from "../../../../controllers/customer/dashboard/dashboard.js";
import { loginAndRegister } from "../../../../controllers/customer/customer.login.js";
import { addToCart, fetchCartItems } from "../../../../controllers/customer/cart.js";
import { placeOrder } from "../../../../controllers/customer/order.js";
import { addShippingAddress, fetchShippingAddresses } from "../../../../controllers/customer/order.address.js";
import { addReviewsAndRating, fetchAllProducts } from "../../../../controllers/customer/product.js";


// customer login route:
router.post('/login', loginAndRegister)


// Dashboard routes:
router.get('/dashboard', dashboardData);
router.get('/brands', getBrandsWithProducts);
router.get('/categories', getCategoriesWithSubCategories);
router.get('/featured', getFeaturedProducts);
router.get('/new', fetchNewProducts);

// Cart routes:
router.post('/add-cart', authenticateJWT, addToCart);
router.get('/cart', authenticateJWT, fetchCartItems);

// Order routes:

router.post('/order', authenticateJWT, placeOrder);

// Shipping Address routes:
router.post('/address', authenticateJWT, addShippingAddress);
router.get('/address', authenticateJWT, fetchShippingAddresses);

// Product routes:

router.post('/reviews', authenticateJWT, addReviewsAndRating);
router.get('/products', fetchAllProducts)

export { router };
