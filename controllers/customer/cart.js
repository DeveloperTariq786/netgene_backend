import mongoose from "mongoose";
import Cart from "../../models/cart.model.js";

const addToCart = async (req, res) => {
    try {
        console.log("Add cart was hit");
        const userDetails = req.user;
        if (userDetails.role !== "customer" || userDetails.permission_component[0].is_customer != true) {
            return res.status(403).json({
                success: false,
                message: "Un-authorised access Or Invalid access"
            })

        }

        const { product_id } = req.query;
        const user_id = userDetails?._id;
        let { no_of_products } = req.body;
        no_of_products = parseInt(no_of_products);
        //  console.log("User_id,product_id,noOfProducts", user_id, product_id, no_of_products);
        if (!product_id || !mongoose.Types.ObjectId.isValid(product_id)) {
            console.log("invalid product id");
            return res.status(403).json({
                success: false,
                message: "In-valid product id"
            })
        }
        // Adding product to the cart

        let cartItem = await new Cart({
            product_id: product_id,
            customer_id: user_id,
            no_of_products: no_of_products
        }).save();
        if (cartItem) {
            console.log("Item added to cart successfully");
            return res.status(201).json({
                success: true,
                message: "Cart item added successfully"
            });
        } else {
            console.log("Item was not added to cart");
            return res.status(404).json({
                success: true,
                message: "Cart item was not added"
            });

        }

    }
    catch (err) {
        console.log("Error occured while adding product to cart", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while adding product to cart"
        })


    }
}
const fetchCartItems = async (req, res) => {
    try {
        const userDetails = req.user;
        if (userDetails.role !== "customer" || userDetails.permission_component[0].is_customer != true) {
            return res.status(403).json({
                success: false,
                message: "Un-authorised access Or Invalid access"
            })
        }
        const user_id = userDetails?._id;
        const totalProductsInCart = await Cart.countDocuments({ customer_id: user_id });
        // console.log("Total products", totalProductsInCart);
        const cartItems = await Cart.aggregate([
            {
                $match: {
                    customer_id: new mongoose.Types.ObjectId(user_id)
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

                    name: "$product.product_name",
                    logo: "$product.avatar",
                    product_brand: "$product.product_brand",
                    product_dimension: "$product.dimensions",
                    no_of_products: 1,
                    product_price: "$product.final_price",
                    total_price: { $multiply: ["$no_of_products", "$product.final_price"] }
                }
            },
            {
                $lookup: {
                    from: "brands",
                    localField: "product_brand",
                    foreignField: "_id",
                    as: "brands"
                }


            },
            {
                $lookup: {
                    from: "metrics",
                    localField: "product_dimension",
                    foreignField: "_id",
                    as: "dimensions"
                }


            },
            {
                $unwind: "$brands"

            },

            {
                $unwind: "$dimensions"

            },
            {
                $project: {
                    name: 1,
                    logo: 1,
                    no_of_products: 1,
                    product_price: 1,
                    total_price: 1,
                    product_brand: "$brands.brand_name",
                    product_dimension: "$dimensions.dimension_name"

                }
            }

        ])
        let final_price = 0;
        cartItems.map(async (item) => {
            final_price = final_price + item.total_price;
        })
        // console.log("Final price ", final_price);
        if (cartItems.length >= 1) {
            return res.status(200).json({
                success: true,
                message: "Cart items found successfully",
                data: cartItems,
                totalItems: totalProductsInCart,
                final_price: final_price
            })

        } else {

            return res.status(404).json({
                success: false,
                message: "Cart items not found!",
            })

        }
    }


    catch (err) {
        console.log("Error occured while fetching Cart items", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching Cart items!",
        })

    }
}

export { addToCart, fetchCartItems };