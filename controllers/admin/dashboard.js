import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import Brand from "../../models/brand.model.js";
import Category from "../../models/category.model.js";
import Subcategory from "../../models/sub_category.model.js";

const getDashboardData = async (req, res) => {
    try {
        console.log("Get dashboard data route was hit");
        const userDetails = req.user;
        const allowedUsers = ['admin', 'superadmin'];
        const granted_permissions = userDetails.permission_component;

        if (!allowedUsers.includes(userDetails.role)) {
            console.log("Un-authorised access only admin and superadmin allowed");
            return res.status(403).json({
                success: false,
                message: "Un-authorised access only admin and superadmin allowed"
            });
        }

        if (!granted_permissions[0].can_read_records) {
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch dashboard data`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch dashboard data`
            });
        }

        // Fetch counts for all requested entities
        const [totalOrders, totalProducts, totalBrands, totalCategories, totalSubCategories] = await Promise.all([
            Order.countDocuments(),
            Product.countDocuments(),
            Brand.countDocuments(),
            Category.countDocuments(),
            Subcategory.countDocuments()
        ]);

        console.log("Dashboard data fetched successfully");
        return res.status(200).json({
            success: true,
            message: "Dashboard data fetched successfully",
            data: {
                totalOrders,
                totalProducts,
                totalBrands,
                totalCategories,
                totalSubCategories
            }
        });
    } catch (err) {
        console.log("Error occurred while fetching dashboard data", err);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching dashboard data"
        });
    }
};

export { getDashboardData };
