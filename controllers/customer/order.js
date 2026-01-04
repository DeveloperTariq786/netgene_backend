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
            let cart_id = item['cart_id'];

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
            const deleteCart = await Cart.deleteOne({ _id: cart_id });

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

const cancelOrder = async (req, res) => {
    try {
        console.log("Cancel order was hit at customer side");
        const userDetails = req.user;
        if (userDetails.role !== "customer" || userDetails.permission_component[0].is_customer !== true) {
            return res.status(403).json({
                success: false,
                message: "Un-authorised access Or Invalid access"
            })
        }
        const loggedInCustomerId = userDetails._id;
        const { order_id } = req.query;
        console.log("Order id in cancel order ", order_id);
        if (!order_id) {
            return res.status(403).json({
                success: false,
                message: "Forbidden access please select order id to proceed for cancellation"
            });
        }
        const orderDetails = await Order.findById(order_id);
        console.log("Order details in Cancel orddr", orderDetails);
        const order_status = orderDetails?.order_status;
        if (order_status == "delivered" || order_status == "Delivered") {
            return res.status(403).json({
                success: false,
                message: `Order can't be cancelled because order is already in ${order_status} mode`
            })
        }
        // Now preparing order to be cancelled;
        let filter = { _id: order_id };
        const cancel_obj = { order_status: "cancelled" };
        const cancelOrder = await Order.updateOne(filter, {
            $set: cancel_obj
        });
        if (cancelOrder) {
            const orderDetails = await Order.findOne({ _id: order_id });
            console.log("<----Cancelling order---->");
            if (orderDetails) {
                const customer_id = orderDetails?.customer_id;
                if (!customer_id) {
                    console.log("Invalid Order  at Admin side while changing the order status, Customer id not present");
                }
                const customer_orders = orderDetails?.order_items;
                for (let order_item of customer_orders) {
                    console.log("Order name in cancell section", order_item.product_name);
                    let cart_id = order_item?.cart_id;
                    let p_id = order_item?.p_id;
                    let no_of_products = order_item?.no_of_products;
                    // const productInCart = await Cart.findOne({ _id: cart_id, customer_id: customer_id, product_id: p_id });

                    // 1. incrementing the no of products in Inventory:
                    // 2. Changing the Order status of this product in cart: 
                    const getProductInInventory = await Inventory.findOne({ product_id: p_id });
                    if (getProductInInventory) {
                        // Updating Product Stock in Inventory:
                        const updateProductInInventory = await Inventory.updateOne({ product_id: p_id }, {
                            $inc: { product_stock: no_of_products }
                        });

                    }
                    return res.status(201).json({
                        success: true,
                        message: "Order cancelled successfully from customer"
                    })

                }



            }




        } else {
            if (cancelOrder) {
                return res.status(404).json({
                    success: false,
                    message: "Order was not cancelled!"
                })

            }


        }


    } catch (err) {
        console.log("Error occured while cancelling order at customer side", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while cancelling order at customer side"
        });

    }
}

export { placeOrder, getAllOrders, cancelOrder };