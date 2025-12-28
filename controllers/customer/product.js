import Product from "../../models/product.model.js"
import Rating from "../../models/reviews_rating.model.js"
import mongoose from "mongoose";


const addReviewsAndRating = async (req, res) => {
    try {
        console.log("Reviews and ratings route was hit");
        const userDetails = req.user;
        if (userDetails.role !== "customer" || userDetails.permission_component[0].is_customer != true) {
            return res.status(403).json({
                success: false,
                message: "Un-authorised access Or Invalid access"
            })
        }
        console.log("userDetails in reviews", userDetails);
        const loggedInCustomerId = userDetails._id;
        const { customer_id } = req.query;
        if (!loggedInCustomerId == customer_id) {

            return res.status(403).json({
                success: false,
                message: "Cannot process further for orderes || Invalid customer"
            })
        }
        const { product_id } = req.query;
        let { reviews, ratings } = req.body;
        console.log("Reviews and ratings together", reviews, ratings);
        ratings = parseInt(ratings);
        // checking if user has already reviewed:
        const existingReviews = await Rating.findOne({ customer_id: loggedInCustomerId, product_id: product_id });
        if (existingReviews) {
            console.log(`${userDetails.first_name} has already reviewed`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} has already reviewed`
            });
        }

        // Addings reviews 

        const addReviews = await new Rating({
            product_id: product_id,
            customer_id: loggedInCustomerId,
            reviews: reviews,
            rating: ratings

        }).save();

        if (addReviews) {
            return res.status(201).json({
                success: true,
                message: "Reviews and ratings added successfully"
            })

        } else {
            return res.status(404).json({
                success: false,
                message: "Reviews and ratings not added!"
            })

        }
    }
    catch (err) {
        console.log("Error occured while adding reviews and rating", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while adding reviews and rating"
        });
    }

}

const fetchAllProducts = async (req, res) => {
    try {
        console.log("Fetch all products was hit");
        console.log("Request params", req.query);
        let { single_brand, single_category, brands, categories, from, to, limit } = req.query;
        let filterObj = {};
        if (single_brand) {
            filterObj.product_brand = new mongoose.Types.ObjectId(single_brand);
        }
        if (single_category) {
            filterObj.product_category = new mongoose.Types.ObjectId(single_category);
        }
        if (from && to) {
            from = parseFloat(from);
            to = parseFloat(to);
            filterObj.product_price = { $gte: from, $lte: to };
        }
        if (brands) {
            brands = brands.split(",");
            const brandObjectIds = brands.map(
                id => new mongoose.Types.ObjectId(id)
            );
            filterObj.product_brand = { $in: brandObjectIds }

        }
        if (categories) {
            categories = categories.split(",");
            const categoryObjectIds = categories.map(
                id => new mongoose.Types.ObjectId(id)
            );
            filterObj.product_category = { $in: categoryObjectIds }

        }

        console.log("Final Filter obj", filterObj);
        const pipeline = [
            {
                $match: { ...filterObj }

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
                    as: "rating"
                }

            },
            {
                $unwind: "$inventory"
            },
            {
                $unwind: "$dimension"
            },
            {
                $unwind: {
                    path: "$rating",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    product_name: 1,
                    product_price: 1,
                    discount_precentage: 1,
                    final_price: 1,
                    avatar: 1,
                    is_new: "$isNew",
                    is_featured: "$featured",
                    is_sale: "$sales",
                    dimension: "$dimension.dimension_name",
                    product_quantity: "$inventory.product_stock",
                    product_ratings: "$rating.rating",
                    product_reviews: "$rating.reviews",
                    customer_id: "$rating.customer_id.customer_reviews",
                }

            },
            {
                $lookup: {
                    from: "users",
                    localField: "customer_id",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            {
                $unwind: {
                    path: "$product_reviews",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: "$_id", // group by product id

                    product_name: { $first: "$product_name" },
                    product_price: { $first: "$product_price" },
                    final_price: { $first: "$final_price" },
                    discount_price: { $first: "$discount_precentage" },
                    avatar: { $first: "$avatar" },
                    is_new: { $first: "$is_new" },
                    is_featured: { $first: "$is_featured" },
                    is_sale: { $first: "$is_sale" },
                    dimension: { $first: "$dimension" },
                    product_quantity: { $first: "$product_quantity" },
                    avg_rating: { $avg: "$product_ratings" },

                    product_reviews: {
                        $push: {
                            review_id: "$product_reviews._id",
                            customer_reviews: "$product_reviews.customer_reviews",

                        }
                    }
                },
            },
            {
                $project: {
                    product_name: 1,
                    product_price: 1,
                    final_price: 1,
                    discount_price: 1,
                    avatar: 1,
                    is_new: 1,
                    is_featured: 1,
                    is_sale: 1,
                    dimension: 1,
                    product_quantity: 1,
                    avg_rating: 1,
                    reviews: {
                        $size: "$product_reviews"
                    }

                }
            }
        ];

        if (limit) {
            pipeline.push({
                $limit: parseInt(limit)
            });
        }

        const allProducts = await Product.aggregate(pipeline);

        console.log("Aggregated all products", allProducts);
        if (allProducts.length >= 0) {
            return res.status(200).json({
                success: true,
                message: "Products fetched successfully",
                data: allProducts
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Products are not fetched successfully"
            });



        }



    } catch (err) {
        console.log("Error occured while fetching all products", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching all products"
        })
    }



}
const fetchSingleProduct = async (req, res) => {
    try {
        console.log("Fetch single product was hit");
        let { product_id } = req.query;
        console.log("Product Id--->", product_id);
        const singleProduct = await Product.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(product_id)
                },
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
                $lookup: {
                    from: "brands",
                    localField: "product_brand",
                    foreignField: "_id",
                    as: "brand"
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
                    as: "rating"
                }

            },
            {
                $unwind: "$inventory"
            },
            {
                $unwind: "$dimension"
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
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    discount_precentage: 1,
                    featured: 1,
                    isNew: 1,
                    sales: 1,
                    final_price: 1,
                    avatar: 1,
                    cover_images: 1,
                    dimension: "$dimension.dimension_name",
                    product_quantity: "$inventory.product_stock",
                    product_ratings: "$rating.rating",
                    product_reviews: "$rating.reviews",
                    customer_id: "$rating.customer_id",
                    product_brand: "$brand.brand_name",
                    inventory_id: "$inventory.product_code",
                    // rating:"$rating.rating", 
                    rating_time: "$rating.createdAt",
                    tags: 1
                }

            },
            {
                $lookup: {
                    from: "users",
                    localField: "customer_id",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            {
                $unwind: {
                    path: "$product_reviews",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$customer",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_price: 1,
                    discount_precentage: 1,
                    final_price: 1,
                    avatar: 1,
                    cover_images: 1,
                    dimension: 1,
                    product_quantity: 1,
                    product_ratings: 1,
                    product_reviews: 1,
                    featured: 1,
                    isNew: 1,
                    sales: 1,
                    customer_id: 1,
                    product_brand: 1,
                    inventory_id: 1,
                    tags: 1,
                    // rating:1,
                    first_name: "$customer.first_name",
                    last_name: "$customer.last_name",
                    rating_time: 1
                }

            },
            {
                $group: {
                    _id: "$_id", // group by product id

                    product_name: { $first: "$product_name" },
                    product_description: { $first: "$product_description" },
                    product_price: { $first: "$product_price" },
                    final_price: { $first: "$final_price" },
                    product_brand: { $first: "$product_brand" },
                    discount_price: { $first: "$discount_precentage" },
                    first_name: { $first: "$first_name" },
                    last_name: { $first: "$last_name" },
                    avatar: { $first: "$avatar" },
                    tags: { $first: "$tags" },
                    cover_images: { $first: "$cover_images" },
                    dimension: { $first: "$dimension" },
                    product_quantity: { $first: "$product_quantity" },
                    avg_rating: { $avg: "$product_ratings" },
                    inventory_id: { $first: "$inventory_id" },
                    featured: { $first: "$featured" },
                    isNew: { $first: "$isNew" },
                    sales: { $first: "$sales" },
                    rating_time: { $first: "$rating_time" },


                    product_reviews: {
                        $push: {
                            review_id: "$product_reviews._id",
                            customer_reviews: "$product_reviews.customer_reviews",
                            // customer: "$customer"
                        }
                    }
                },
            },
            {
                $unwind: {
                    path: "$preserveNullAndEmptyArrays: true",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    product_name: 1,
                    product_description: 1,
                    product_brand: 1,
                    product_price: 1,
                    first_name: 1,
                    last_name: 1,
                    final_price: 1,
                    discount_price: 1,
                    avatar: 1,
                    featured: 1,
                    sales: 1,
                    isNew: 1,
                    rating_time: 1,
                    tags: 1,
                    cover_images: 1,
                    dimension: 1,
                    product_quantity: 1,
                    inventory_id: 1,
                    avg_rating: 1,
                    total_reviews: {
                        $size: "$product_reviews"
                    },
                    customer_reviews: "$product_reviews.customer_reviews"

                }
            }

        ]);
        console.log("Product--->", singleProduct);
        if (singleProduct.length === 1) {
            console.log("Product fetched successfully");
            return res.status(200).json({
                success: true,
                message: "Product fetched successfully",
                product: singleProduct
            });

        } else {

            return res.status(404).json({
                success: false,
                message: "Product not fetched",

            })




        }



    }
    catch (err) {
        console.log("Error occured while fetching single product", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching single product"
        })

    }

}

export { addReviewsAndRating, fetchAllProducts, fetchSingleProduct };