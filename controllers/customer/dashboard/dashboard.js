
import Product from "../../../models/product.model.js";
import Category from "../../../models/category.model.js";
import Subcategory from "../../../models/sub_category.model.js";
import Brand from "../../../models/brand.model.js";

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
                $unwind: "$subcategories"
            },
            {
                $group: {
                    _id: "$_id",
                    category_name: { $first: "$category_name" },
                    subcategories: {
                        $push: {
                            subcategory_id: "$subcategories._id",
                            subcategory_name: "$subcategories.sub_category_name"
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
const getFeaturedProducts = async (req, res) => {
    try {
        console.log("Featured products was hit");
        let { page = 1, limit = 5 } = req.query;
        console.log("Page and limit", page, limit);
        page = parseInt(page);
        limit = parseInt(limit);
        let skip = (page - 1) * limit;
        // calculating total no of products:
        let totalDocs = await Product.countDocuments({ featured: "true" });
        let totalPages = Math.ceil(totalDocs / limit);
        const featuredProducts = await Product.find({ featured: "true" }).skip(skip).limit(limit);
        if (featuredProducts) {
            console.log("Featured products found successfully");
            return res.status(200).json({
                success: true,
                message: "Featured products found successfully",
                data: featuredProducts,
                current_page: page,
                limit: limit,
                totalPages: totalPages
            });
        }


    } catch (err) {
        console.log("Error occured while fetching Featured products", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching Featured products"
        })


    }


}
const fetchNewProducts = async (req, res) => {
    try {
        console.log("New products was hit");
        let { page = 1, limit = 5 } = req.query;
        console.log("Page and limit", page, limit);
        page = parseInt(page);
        limit = parseInt(limit);
        let skip = (page - 1) * limit;
        // calculating total no of products:
        let totalDocs = await Product.countDocuments({ isNew: "true" });
        let totalPages = Math.ceil(totalDocs / limit);
        const newProducts = await Product.find({ isNew: "true" }).skip(skip).limit(limit);
        if (newProducts) {
            console.log("New products found successfully");
            return res.status(200).json({
                success: true,
                message: "New products found successfully",
                data: newProducts,
                current_page: page,
                limit: limit,
                totalPages: totalPages
            });
        }


    } catch (err) {
        console.log("Error occured while fetching New products", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching New products"
        })


    }





}
const dashboardData = async (req, res) => {
    try {
        const dashboard_obj = {};
        console.log("Customer dashboard API was hit");
        let { featured, sales, isNew } = req.query;
        let { featured_page = 1, featured_limit = 6 } = req.query;
        let { sales_page = 1, sales_limit = 6 } = req.query;
        let { isNew_page = 1, isNew_limit = 6 } = req.query;
        featured = parseInt(featured);
        sales = parseInt(sales);
        isNew = parseInt(isNew);

        // pagination for featured:
        featured_page = parseInt(featured_page);
        featured_limit = parseInt(featured_limit);
        let featured_skip = (featured_page - 1) * featured_limit;
        // total number of featured docs:
        const count_featured = await Product.countDocuments({ featured: true });
        const total_featured_pages = Math.ceil(count_featured / featured_limit);
        const featuredProducts = await Product.aggregate([
            {
                $match: {
                    featured: true
                }
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "inventory"
                }
            },
            {
                $unwind: "$inventory"
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    avatar: 1,
                    final_price: 1,
                    product_quantity: "$inventory.product_stock",
                    product_reviews: 1,
                    product_likes: 1,
                    featured: 1,
                    createdAt: 1

                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: featured_skip
            },
            {
                $limit: featured_limit
            }
        ]);
        if (featuredProducts.length >= 1) {
            dashboard_obj.featuredData = featuredProducts;
            let featuredPagination = {
                page: featured_page,
                limit: featured_limit,
                totalpages: total_featured_pages,
                total_products: count_featured
            }
            dashboard_obj.featuredPagination = featuredPagination;
        }
        else {
            dashboard_obj.featuredData = [];
            dashboard_obj.featuredPagination = {}


        }

        // pagination for sales:
        sales_page = parseInt(sales_page);
        sales_limit = parseInt(sales_limit);
        let sales_skip = (sales_page - 1) * sales_limit;
        // total number of featured docs:
        const count_sales = await Product.countDocuments({ sales: true });
        const total_sales_pages = Math.ceil(count_sales / sales_limit);
        const salesProducts = await Product.aggregate([
            {
                $match: {
                    sales: true
                }
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "inventory"
                }
            },
            {
                $unwind: "$inventory"
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    avatar: 1,
                    final_price: 1,
                    product_quantity: "$inventory.product_stock",
                    product_reviews: 1,
                    product_likes: 1,
                    sales: 1,
                    createdAt: 1

                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: sales_skip
            },
            {
                $limit: sales_limit
            }
        ]);
        if (salesProducts.length >= 1) {
            dashboard_obj.salesData = salesProducts;
            let salesPagination = {
                page: sales_page,
                limit: sales_limit,
                totalpages: total_sales_pages,
                total_products: count_sales
            }
            dashboard_obj.salesPagination = salesPagination;
        } else {
            dashboard_obj.salesData = [];
            dashboard_obj.salesPagination = {}


        }


        // pagination for sales:
        isNew_page = parseInt(isNew_page);
        isNew_limit = parseInt(isNew_limit);
        let isNew_skip = (isNew_page - 1) * isNew_limit;
        // total number of featured docs:
        const count_isNew = await Product.countDocuments({ isNew: true });
        const total_isNew_pages = Math.ceil(count_isNew / isNew_limit);
        const isNewProducts = await Product.aggregate([
            {
                $match: {
                    isNew: true
                }
            },
            {
                $lookup: {
                    from: "inventories",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "inventory"
                }
            },
            {
                $unwind: "$inventory"
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    avatar: 1,
                    final_price: 1,
                    product_quantity: "$inventory.product_stock",
                    product_reviews: 1,
                    product_likes: 1,
                    isNew: 1,
                    createdAt: 1

                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: isNew_skip
            },
            {
                $limit: isNew_limit
            }
        ]);
        if (isNewProducts.length >= 1) {
            dashboard_obj.isNewData = isNewProducts;
            let isNewPagination = {
                page: isNew_page,
                limit: isNew_limit,
                totalpages: total_isNew_pages,
                total_products: count_isNew
            }
            dashboard_obj.isNewPagination = isNewPagination;
        } else {
            dashboard_obj.isNewData = [];
            dashboard_obj.isNewPagination = {}
        }






        return res.status(200).json({
            success: true,
            message: "Dashboard products found successfully",
            data: dashboard_obj
        })
    }
    catch (err) {
        console.log("Error occured in Customer dashboard data", err);
        return res.status(501).json({
            success: false,
            message: "Error occured in customer dashboard data"
        })
    }
}




export { getBrandsWithProducts, getCategoriesWithSubCategories, getFeaturedProducts, fetchNewProducts, dashboardData };