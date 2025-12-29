
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
        let { featured_limit = 6, recent_limit = 5 } = req.query;
        let { sales_limit = 6 } = req.query;
        let { isNew_limit = 6 } = req.query;
        featured = parseInt(featured);
        sales = parseInt(sales);
        isNew = parseInt(isNew);
        recent_limit = parseInt(recent_limit);
        // recently ordered products:

        const recentOrders = await Order.aggregate(
            [
                {
                    $match: {
                        order_status: "processing"
                    }
                },
                {
                    $unwind: "$order_items"
                },
                {
                    $project: {
                        createdAt: 1,
                        product_id: "$order_items.p_id",

                    }
                },
                {
                    $lookup: {
                        from: "products",
                        localField: "product_id",
                        foreignField: "_id",
                        as: "product"
                    }
                },

                {
                    $unwind: "$product"
                },
                {
                    $project: {
                        createdAt: 1,
                        product_name: "$product.product_name",
                        product_price: "$product.product_price",
                        discount_price: "$product.final_price",
                        featured: "$product.featured",
                        sales: "$product.sales",
                        isNew: "$product.isNew",
                        product_id: 1,
                        product_brand: "$product.product_brand",
                        product_dimension: "$product.dimensions"
                    }
                },
                {
                    $lookup: {
                        from: "metrics",
                        localField: "product_dimension",
                        foreignField: "_id",
                        as: "dimension"
                    }

                },
                {
                    $lookup: {
                        from: "inventories",
                        localField: "product_id",
                        foreignField: "product_id",
                        as: "inventory"
                    }

                },
                {
                    $lookup: {
                        from: "brands",
                        localField: "product_brand",
                        foreignField: "_id",
                        as: "brand"
                    }
                },
                {

                    $lookup: {
                        from: "ratings",
                        localField: "product_id",
                        foreignField: "product_id",
                        as: "rating"
                    }
                },
                {
                    $unwind: {
                        path: "$dimension",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$brand",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$rating",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $unwind: {
                        path: "$inventory",
                        preserveNullAndEmptyArrays: true
                    }
                },

                {
                    $project: {
                        createdAt: 1,
                        product_name: 1,
                        product_dimension: 1,
                        product_id: 1,
                        product_price: 1,
                        discount_price: 1,
                        product_stock: "$inventory.product_stock",
                        product_dimension: "$dimension.dimension_name",
                        featured: 1,
                        sales: 1,
                        isNew: 1,
                        product_brand: "$brand.brand_name",
                        rating: {
                            $avg: "$rating.rating"
                        },
                        reviews: "$rating.reviews"
                    }
                },
                {
                    $sort: {
                        createdAt: -1
                    }
                },
                {
                    $limit: recent_limit
                }

            ]);

        if (recentOrders) {
            dashboard_obj.recentOrders = recentOrders;

        }



        // 

        // pagination for featured:

        featured_limit = parseInt(featured_limit);

        // total number of featured docs:
        // const count_featured = await Product.countDocuments({ featured: true });
        // const total_featured_pages = Math.ceil(count_featured / featured_limit);




        const featuredProducts = await Product.aggregate([

            {
                $match: {
                    featured: true
                }
            },
            {
                $lookup: {
                    from: "metrics",
                    localField: "dimensions",
                    foreignField: "_id",
                    as: "dimension"
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "ratings"
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
                $unwind: {
                    path: "$dimension",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$ratings",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$inventory",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    final_price: 1,
                    avatar: 1,
                    createdAt: 1,
                    dimension: "$dimension.dimension_name",
                    product_quantity: "$inventory.product_stock",
                    rating: {
                        $avg: "$ratings.rating"
                    },
                    product_reviews: "$ratings.reviews"
                }

            },
            // {
            //   $unwind: {
            //     path: "$product_reviews",
            //     preserveNullAndEmptyArrays:true
            //   }
            // },  
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    final_price: 1,
                    avatar: 1,
                    dimension: 1,
                    product_quantity: 1,
                    rating: 1,
                    createdAt: 1,
                    // product_reviews:1
                    total_reviews: {
                        $size: {
                            $ifNull: ["$product_reviews", []]
                        }
                    }

                }

            },
            {
                $limit: featured_limit
            }

        ]);
        if (featuredProducts.length >= 1) {

            if (featured === 1) {
                dashboard_obj.featuredData = featuredProducts;
            } else {
                dashboard_obj.featuredData = {}

            }
        }
        else {
            dashboard_obj.featuredData = [];

        }


        sales_limit = parseInt(sales_limit);

        // total number of featured docs:
        // const count_sales = await Product.countDocuments({ sales: true });
        // const total_sales_pages = Math.ceil(count_sales / sales_limit);
        const salesProducts = await Product.aggregate([
            {
                $match: {
                    sales: true
                }
            },
            {
                $lookup: {
                    from: "metrics",
                    localField: "dimensions",
                    foreignField: "_id",
                    as: "dimension"
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "ratings"
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
                $unwind: {
                    path: "$dimension",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$ratings",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$inventory",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    final_price: 1,
                    avatar: 1,
                    createdAt: 1,
                    dimension: "$dimension.dimension_name",
                    product_quantity: "$inventory.product_stock",
                    rating: {
                        $avg: "$ratings.rating"
                    },
                    product_reviews: "$ratings.reviews"
                }

            },
            // {
            //   $unwind: {
            //     path: "$product_reviews",
            //     preserveNullAndEmptyArrays:true
            //   }
            // },  
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    final_price: 1,
                    avatar: 1,
                    dimension: 1,
                    product_quantity: 1,
                    rating: 1,
                    createdAt: 1,
                    // product_reviews:1
                    total_reviews: {
                        $size: {
                            $ifNull: ["$product_reviews", []]
                        }
                    }

                }

            },
            {
                $limit: sales_limit
            }
        ]);
        if (salesProducts.length >= 1) {
            if (sales === 1) {
                dashboard_obj.salesData = salesProducts;
            } else {
                dashboard_obj.salesData = {};

            }
        } else {
            dashboard_obj.salesData = [];
        }


        // pagination for sales:
        // isNew_page = parseInt(isNew_page);
        isNew_limit = parseInt(isNew_limit);
        // let isNew_skip = (isNew_page - 1) * isNew_limit;
        // total number of featured docs:
        // const count_isNew = await Product.countDocuments({ isNew: true });
        // const total_isNew_pages = Math.ceil(count_isNew / isNew_limit);
        const isNewProducts = await Product.aggregate([
            {
                $match: {
                    isNew: true
                }
            },
            {
                $lookup: {
                    from: "metrics",
                    localField: "dimensions",
                    foreignField: "_id",
                    as: "dimension"
                }
            },
            {
                $lookup: {
                    from: "ratings",
                    localField: "_id",
                    foreignField: "product_id",
                    as: "ratings"
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
                $unwind: {
                    path: "$dimension",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$ratings",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$inventory",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    final_price: 1,
                    avatar: 1,
                    createdAt: 1,
                    dimension: "$dimension.dimension_name",
                    product_quantity: "$inventory.product_stock",
                    rating: {
                        $avg: "$ratings.rating"
                    },
                    product_reviews: "$ratings.reviews"
                }

            },
            // {
            //   $unwind: {
            //     path: "$product_reviews",
            //     preserveNullAndEmptyArrays:true
            //   }
            // },  
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    final_price: 1,
                    avatar: 1,
                    dimension: 1,
                    product_quantity: 1,
                    rating: 1,
                    createdAt: 1,
                    // product_reviews:1
                    total_reviews: {
                        $size: {
                            $ifNull: ["$product_reviews", []]
                        }
                    }

                }

            },
            {
                $limit: isNew_limit
            }
        ]);
        if (isNewProducts.length >= 1) {
            if (isNew === 1) {
                dashboard_obj.isNewData = isNewProducts;
            } else {
                dashboard_obj.isNewData = {};


            }
        } else {
            dashboard_obj.isNewData = [];
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