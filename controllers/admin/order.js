import Order from "../../models/order.model.js"
import Cart from "../../models/cart.model.js";
import Inventory from "../../models/inventory.model.js";
import mongoose from "mongoose";

const changeOrderStatus = async (req, res) => {
    try {
        console.log("Change order status was hit at admin side");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to change  order status`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to change order status`
            });
        }
        const { order_id } = req.query;
        let { order_status } = req.body;
        if (order_status == "confirmed" || order_status == "Confirmed") {
            // console.log("Order reached at confirming point");
            const order_filter = { _id: order_id };
            let order_update = { order_status: "confirmed" };

            const getOrderDetails = await Order.findOneAndUpdate(order_filter, { $set: order_update });
            if (getOrderDetails) {
                return res.status(201).json({
                    success: true,
                    message: "Order status changed to confirmed successfully",
                    order_status: "confirmed"
                })
            } else {
                return res.status(404).json({
                    success: false,
                    message: "Order status not changed to confirmed",
                })


            }
            // if (getOrderDetails) {
            //     // console.log("Order status changed", getOrderDetails);
            //     console.log("Order status changed sucessfully to confirmed");
            //     const order_items = getOrderDetails?.order_items;
            //     if (order_items?.length > 0) {
            //         // console.log("Order items found in confirmed", order_items);
            //         // here we have to do two ops simltaneously 
            //         // 1. do decrements in inventory
            //         // 2. do remove carts
            //         for (let item of order_items) {
            //             let cart_id = item.cart_id;
            //             let product_id = item.p_id;
            //             let total_products = item.no_of_products;
            //             console.log("Cart_id", cart_id);
            //             console.log("Product_id", product_id);
            //             console.log("Total Products", total_products);

            //             const updatedInventory = await Inventory.updateOne({ product_id: product_id },
            //                 {
            //                     $inc: {
            //                         product_stock: -total_products
            //                     }
            //                 }
            //             );

            //             const removeCart = await Cart.deleteOne({ _id: cart_id });


            //         }

            //     }
            //     return res.status(201).json({
            //         success: true,
            //         message: "Order status changed to confirmed successfully",
            //         order_status: "confirmed"
            //     })

            // } else {
            //     return res.status(404).json({
            //         success: false,
            //         message: "Order status was not changed to confirmed!"
            //     })

            // }


        }
        if (order_status == "Shipping" || order_status == "shipping") {

            const order_filter = { _id: order_id };
            let order_update = { order_status: "shipping" };

            const getOrderDetails = await Order.findOneAndUpdate(order_filter, { $set: order_update });
            if (getOrderDetails) {
                console.log("Order status changed", getOrderDetails);
                console.log("Order status changed sucessfully");
                return res.status(201).json({
                    success: true,
                    message: "Order status changed to Shipping successfully",
                    order_status: "shipping"
                })

            } else {
                return res.status(404).json({
                    success: false,
                    message: "Order status was not changed to Shipping!"
                })

            }

        }


        if (order_status == "Delivered" || order_status == "delivered") {
            const order_filter = { _id: order_id };
            let order_update = { order_status: "delivered" };
            const getOrderDetails = await Order.findOneAndUpdate(order_filter, { $set: order_update });
            if (getOrderDetails) {
                console.log("Order status changed", getOrderDetails);
                console.log("Order status changed sucessfully");
                return res.status(201).json({
                    success: true,
                    message: "Order status changed to Delivered successfully",
                    order_status: "delivered"
                })

            } else {
                return res.status(404).json({
                    success: false,
                    message: "Order status was not changed to Delivered!"
                })

            }

        }

        if (order_status == "Cancelled" || order_status == "cancelled") {



            const getCurrentOrderStatus = await Order.findOne({ _id: order_id });
            if (getCurrentOrderStatus) {
                const current_status = getCurrentOrderStatus.order_status;
                if (current_status == "delivered")
                    return res.status(403).json({
                        success: false,
                        message: "Order can't be cancelled as it is Already delivered"
                    }
                    );
            }
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

                    const getProductInInventory = await Inventory.findOne({ product_id: p_id });
                    if (getProductInInventory) {
                        // Updating Product Stock in Inventory:
                        const updateProductInInventory = await Inventory.updateOne({ product_id: p_id }, {
                            $inc: { product_stock: no_of_products }
                        });

                        if (updateProductInInventory) {
                            // now updatting the order status to cancelled:
                            const cancel_order = await Order.updateOne({
                                _id: order_id,
                            }, { $set: { order_status: "cancelled" } });
                            if (cancel_order) {
                                console.log("Oder cancelled successfully at admin side");
                                return res.status(201).json({
                                    success: true,
                                    message: "Order cancelled successsfully",
                                    order_status: "cancelled"
                                });
                            }
                        }
                    }
                    // }

                }



            }



        }


    }
    catch (err) {
        console.log("Error occured while changing order status at admin", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while changing order status at admin"
        });
    }

}

export { changeOrderStatus };