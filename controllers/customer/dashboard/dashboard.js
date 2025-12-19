
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


export { getBrandsWithProducts, getCategoriesWithSubCategories, getFeaturedProducts, fetchNewProducts };