
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
export { getBrandsWithProducts };