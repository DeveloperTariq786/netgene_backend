import Order from "../../models/order.model.js";
import Cart from "../../models/cart.model.js";
import Inventory from "../../models/inventory.model.js"
import mongoose from "mongoose";

const placeOrder = async (req, res) => {
    try {
        console.log("Place order route was hit");
        const userDetails = req.user;
        if (userDetails.role !== "customer" || userDetails.permission_component[0].is_customer != true) {
            return res.status(403).json({
                success: false,
                message: "Un-authorised access Or Invalid access"
            })
        }
        const loggedInCustomerId = userDetails._id;
        const { customer_id, address_id } = req.query;
        console.log("User details", loggedInCustomerId, customer_id);
        if (!loggedInCustomerId === customer_id) {
            return res.status(403).json({
                success: false,
                message: "Cannot process further for orderes || Invalid customer"
            })
        }
        // checking valid address_id:
        if (!address_id || !mongoose.Types.ObjectId.isValid(address_id)) {
            console.log("Address is not valid");
            return res.status(403).json({
                success: false,
                message: "Address is required OR invalid address"
            });
        }

        // fetching carts corresponding to the customer:
        // const cartItems = await Cart.find({ customer_id: loggedInCustomerId }).select({ _id: 1 });
        // console.log("Cart Items-->", cartItems);
        const cartItems = await Cart.aggregate([
            [
                {
                    $match: {
                        customer_id: new mongoose.Types.ObjectId(loggedInCustomerId)
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
                        cart_id: "$_id",
                        p_id: "$product._id",
                        product_name: "$product.product_name",
                        product_logo: "$product.avatar",
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
                        cart_id: 1,
                        p_id: 1,
                        product_name: 1,
                        product_logo: 1,
                        no_of_products: 1,
                        product_price: 1,
                        total_price: 1,
                        product_brand: "$brands.brand_name",
                        product_dimension: "$dimensions.dimension_name"

                    }
                },
                {
                    $lookup: {
                        from: "inventories",
                        localField: "p_id",
                        foreignField: "product_id",
                        as: "inventory"
                    }
                },
                { $unwind: "$inventory" },
                {
                    $project: {
                        cart_id: 1,
                        p_id: 1,
                        product_name: 1,
                        product_logo: 1,
                        no_of_products: 1,
                        product_price: 1,
                        total_price: 1,
                        product_brand: 1,
                        product_dimension: 1,
                        product_quantity: "$inventory.product_stock"
                    }

                }
            ]

        ]);

        // console.log("Cart Items-->", cartItems);
        for (let item of cartItems) {
            let quantity = item['product_quantity'];
            let products_ordered = item['no_of_products'];
            let product_name = item['product_name'];
            let product_id = item['p_id'];

            console.log("Product Quantity", quantity, products_ordered);
            if (quantity < products_ordered) {
                console.log("Order cannot be placed as products are not in limited stock");
                return res.status(403).json({
                    success: false,
                    message: `Order cannot be placed as ${product_name} is not in limited stock`
                })
            }
            let filter = { product_id: product_id };
            // decreementing no of products from inventory:
            const updatedProduct = await Inventory.updateOne(filter,
                {
                    $inc: { product_stock: -products_ordered }
                }
            );
        }

        // creating order:
        const order = await new Order({
            customer_id: loggedInCustomerId,
            order_status: "processing",
            order_items: cartItems,
            shipping_address: address_id
        }).save()

        // now creating order:


        if (order) {
            console.log("Orders created successfully");
            return res.status(201).json({
                success: true,
                message: "Orders created successfully",
                orders: order
            })
        } else {
            console.log("Orders not created!");
            return res.status(404).json({
                success: false,
                message: "Orders not created!"
            })

        }
    }
    catch (err) {
        console.log("Error occured while placing order", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while placing order"
        })

    }

}

const getAllOrders = async (req, res) => {
    try {
        const userDetails = req.user;
        if (userDetails.role !== "customer" || userDetails.permission_component[0].is_customer !== true) {
            return res.status(403).json({
                success: false,
                message: "Un-authorised access Or Invalid access"
            })
        }
        const loggedInCustomerId = userDetails._id;

        // Pagination parameters
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const totalOrders = await Order.countDocuments({ customer_id: loggedInCustomerId });
        const orders = await Order.find({ customer_id: loggedInCustomerId })
            .populate("shipping_address")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const formattedOrders = orders.map(order => {
            const totalAmount = order.order_items.reduce((sum, item) => sum + (item.total_price || 0), 0);
            return {
                ...order._doc,
                total_amount: totalAmount
            };
        });

        if (formattedOrders.length > 0) {
            return res.status(200).json({
                success: true,
                orders: formattedOrders,
                pagination: {
                    totalOrders,
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    limit
                }
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "No orders found for this customer"
            });
        }
    } catch (err) {
        console.log("Error occurred while fetching orders", err);
        return res.status(501).json({
            success: false,
            message: "Error occurred while fetching orders"
        });
    }
}

export { placeOrder, getAllOrders };