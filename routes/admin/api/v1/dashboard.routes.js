import express from "express";
const router = express.Router();
import { getDashboardData } from "../../../../controllers/admin/dashboard.js";
import { authenticateJWT } from "../../../../middlewares/authenticate.routes.js";

router.get('/data', authenticateJWT, getDashboardData);

export { router };
