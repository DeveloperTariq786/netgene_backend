
import Product from "../../../models/product.model.js";
import Category from "../../../models/category.model.js";
import Subcategory from "../../../models/sub_category.model.js";
import Brand from "../../../models/brand.model.js";
import Order from "../../../models/order.model.js";

const getBrandsWithProducts = async (req, res) => {
    try {
        console.log("Dashboard Brands  route was hit");
        const results = await Brand.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "product_brand",
                    as: "product"
                }
            },
            {
                $project: {
                    brand_name: 1,
                    brand_logo: 1,
                    no_of_products: {
                        $size: "$product"
                    }
                }
            }
        ])
        if (results.length >= 1) {
            return res.status(200).json({
                success: true,
                message: "Brands with products found successfully at dashboard",
                data: results
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "Brands with products were not found  at dashboard",
                data: results
            })
        }
    }
    catch (err) {
        console.log("Error occured in Dashboard Brands", err);
        return res.status(501).json({
            success: false,
            message: "Error occured in Dashboard"
        });
    }
}

const getCategoriesWithSubCategories = async (req, res) => {
    try {
        console.log("Get Categories with subcategories was hit");
        const categoryResult = await Category.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "_id",
                    foreignField: "parent_category",
                    as: "subcategories"
                }
            },
            {
                $project: {
                    category_name: 1,
                    category_logo: 1,
                    no_of_subcategories: { $size: "$subcategories" },
                    subcategories: {
                        $map: {
                            input: "$subcategories",
                            as: "sub",
                            in: {
                                subcategory_id: "$$sub._id",
                                subcategory_name: "$$sub.sub_category_name"
                            }
                        }
                    }
                }
            }
        ]);
        if (categoryResult.length >= 1) {
            return res.status(200).json({
                success: true,
                message: "Categories fetch on dashboard successfully",
                data: categoryResult
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Categories not fetched on dashboard!"
            })
        }
    } catch (err) {
        console.log("Error occured while fetching categories on dashboard", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching categories on dashboard!"
        })
    }
}

const getDashboardData = async (req, res) => {
    try {
        const { featured, isnew, toporders, toprated, topdiscount, limit = 5 } = req.query;
        const queryLimit = parseInt(limit);
        let products;
        let message;

        if (featured == 1 || isnew == 1) {
            const matchStage = featured == 1 ? { featured: true } : { isNew: true };
            message = featured == 1 ? "Featured products found successfully" : "New products found successfully";

            products = await Product.aggregate([
                { $match: matchStage },
                { $limit: queryLimit },
                { $lookup: { from: "metrics", localField: "dimensions", foreignField: "_id", as: "dimension" } },
                { $lookup: { from: "ratings", localField: "_id", foreignField: "product_id", as: "ratings" } },
                { $lookup: { from: "inventories", localField: "_id", foreignField: "product_id", as: "inventory" } },
                { $lookup: { from: "brands", localField: "product_brand", foreignField: "_id", as: "brand" } },
                { $unwind: { path: "$dimension", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        product_name: 1,
                        product_description: 1,
                        product_price: 1,
                        discount_precentage: 1,
                        final_price: 1,
                        avatar: 1,
                        featured: 1,
                        isNew: 1,
                        sales: 1,
                        createdAt: 1,
                        dimension: "$dimension.dimension_name",
                        product_brand: "$brand.brand_name",
                        product_stock: "$inventory.product_stock",
                        rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
                        total_reviews: { $size: { $ifNull: ["$ratings", []] } }
                    }
                }
            ]);
        } else if (toporders == 1) {
            message = "Top ordered products found successfully";
            products = await Order.aggregate([
                { $unwind: "$order_items" },
                { $group: { _id: "$order_items.p_id", totalOrders: { $sum: 1 } } },
                { $sort: { totalOrders: -1 } },
                { $limit: queryLimit },
                { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
                { $unwind: "$product" },
                { $lookup: { from: "metrics", localField: "product.dimensions", foreignField: "_id", as: "dimension" } },
                { $lookup: { from: "ratings", localField: "product._id", foreignField: "product_id", as: "ratings" } },
                { $lookup: { from: "inventories", localField: "product._id", foreignField: "product_id", as: "inventory" } },
                { $lookup: { from: "brands", localField: "product.product_brand", foreignField: "_id", as: "brand" } },
                { $unwind: { path: "$dimension", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: "$product._id",
                        product_name: "$product.product_name",
                        product_description: "$product.product_description",
                        product_price: "$product.product_price",
                        discount_precentage: "$product.discount_precentage",
                        final_price: "$product.final_price",
                        avatar: "$product.avatar",
                        featured: "$product.featured",
                        isNew: "$product.isNew",
                        sales: "$product.sales",
                        product_stock: "$inventory.product_stock",
                        dimension: "$dimension.dimension_name",
                        product_brand: "$brand.brand_name",
                        rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
                        total_reviews: { $size: { $ifNull: ["$ratings", []] } },
                        totalOrders: 1,
                        createdAt: "$product.createdAt"
                    }
                }
            ]);
        } else if (toprated == 1) {
            message = "Top rated products found successfully";
            products = await Product.aggregate([
                { $lookup: { from: "ratings", localField: "_id", foreignField: "product_id", as: "ratings" } },
                { $addFields: { avgRating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] } } },
                { $sort: { avgRating: -1 } },
                { $limit: queryLimit },
                { $lookup: { from: "metrics", localField: "dimensions", foreignField: "_id", as: "dimension" } },
                { $lookup: { from: "inventories", localField: "_id", foreignField: "product_id", as: "inventory" } },
                { $lookup: { from: "brands", localField: "product_brand", foreignField: "_id", as: "brand" } },
                { $unwind: { path: "$dimension", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        product_name: 1,
                        product_description: 1,
                        product_price: 1,
                        discount_precentage: 1,
                        final_price: 1,
                        avatar: 1,
                        featured: 1,
                        isNew: 1,
                        sales: 1,
                        createdAt: 1,
                        dimension: "$dimension.dimension_name",
                        product_brand: "$brand.brand_name",
                        product_stock: "$inventory.product_stock",
                        rating: "$avgRating",
                        total_reviews: { $size: { $ifNull: ["$ratings", []] } }
                    }
                }
            ]);
        } else if (topdiscount == 1) {
            message = "Top discount products found successfully";
            products = await Product.aggregate([
                { $sort: { discount_precentage: -1 } },
                { $limit: queryLimit },
                { $lookup: { from: "metrics", localField: "dimensions", foreignField: "_id", as: "dimension" } },
                { $lookup: { from: "ratings", localField: "_id", foreignField: "product_id", as: "ratings" } },
                { $lookup: { from: "inventories", localField: "_id", foreignField: "product_id", as: "inventory" } },
                { $lookup: { from: "brands", localField: "product_brand", foreignField: "_id", as: "brand" } },
                { $unwind: { path: "$dimension", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        product_name: 1,
                        product_description: 1,
                        product_price: 1,
                        discount_precentage: 1,
                        final_price: 1,
                        avatar: 1,
                        featured: 1,
                        isNew: 1,
                        sales: 1,
                        createdAt: 1,
                        dimension: "$dimension.dimension_name",
                        product_brand: "$brand.brand_name",
                        product_stock: "$inventory.product_stock",
                        rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
                        total_reviews: { $size: { $ifNull: ["$ratings", []] } }
                    }
                }
            ]);
        } else {
            // Case: No params - Recently Sold Products (Unique Products)
            message = "Recently sold products found successfully";
            products = await Order.aggregate([
                { $unwind: "$order_items" },
                { $sort: { createdAt: -1 } },
                {
                    $group: {
                        _id: "$order_items.p_id",
                        latestSale: { $first: "$createdAt" }
                    }
                },
                { $sort: { latestSale: -1 } },
                { $limit: queryLimit },
                { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
                { $unwind: "$product" },
                { $lookup: { from: "metrics", localField: "product.dimensions", foreignField: "_id", as: "dimension" } },
                { $lookup: { from: "ratings", localField: "product._id", foreignField: "product_id", as: "ratings" } },
                { $lookup: { from: "inventories", localField: "product._id", foreignField: "product_id", as: "inventory" } },
                { $lookup: { from: "brands", localField: "product.product_brand", foreignField: "_id", as: "brand" } },
                { $unwind: { path: "$dimension", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$inventory", preserveNullAndEmptyArrays: true } },
                { $unwind: { path: "$brand", preserveNullAndEmptyArrays: true } },
                {
                    $project: {
                        _id: "$product._id",
                        product_name: "$product.product_name",
                        product_description: "$product.product_description",
                        product_price: "$product.product_price",
                        discount_precentage: "$product.discount_precentage",
                        final_price: "$product.final_price",
                        avatar: "$product.avatar",
                        featured: "$product.featured",
                        isNew: "$product.isNew",
                        sales: "$product.sales",
                        product_stock: "$inventory.product_stock",
                        dimension: "$dimension.dimension_name",
                        product_brand: "$brand.brand_name",
                        rating: { $ifNull: [{ $avg: "$ratings.rating" }, 0] },
                        total_reviews: { $size: { $ifNull: ["$ratings", []] } },
                        createdAt: "$latestSale"
                    }
                }
            ]);
        }

        return res.status(200).json({
            success: true,
            message,
            data: products
        });
    } catch (err) {
        console.log("Error in getDashboardData", err);
        return res.status(501).json({
            success: false,
            message: "Error occurred while fetching dashboard products"
        });
    }
};

export { getBrandsWithProducts, getCategoriesWithSubCategories, getDashboardData };