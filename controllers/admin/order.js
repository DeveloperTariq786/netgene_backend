import Order from "../../models/order.model.js"
import Cart from "../../models/cart.model.js";
import Inventory from "../../models/inventory.model.js";
import mongoose from "mongoose";
const changeOrderStatus = async (req, res) => {
    try {
        console.log("Change order status was hit at admin side");
        const { order_id } = req.query;
        let { order_status } = req.body;
        if (order_status == "Shipping" || order_status == "shipping") {

            const order_filter = { _id: order_id };
            let order_update = { order_status: "shipping" };

            const getOrderDetails = await Order.findOneAndUpdate(order_filter, { $set: order_update });
            if (getOrderDetails) {
                console.log("Order status changed", getOrderDetails);
                console.log("Order status changed sucessfully");
                return res.status(201).json({
                    success: true,
                    message: "Order status changed to Shipping successfully"
                })

            } else {
                return res.status(404).json({
                    success: false,
                    message: "Order status was not changed to Shipping!"
                })

            }

        }

        if (order_status == "Cancelled" || order_status == "cancelled") {
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
                    const productInCart = await Cart.findOne({ _id: cart_id, customer_id: customer_id, product_id: p_id });
                    if (productInCart) {
                        console.log("Product found in cart in cancel section", productInCart);
                        // 1. incrementing the no of products in Inventory:
                        // 2. Changing the Order status of this product in cart: 
                        const getProductInInventory = await Inventory.findOne({ product_id: p_id });
                        if (getProductInInventory) {
                            // Updating Product Stock in Inventory:
                            const updateProductInInventory = await Inventory.updateOne({ product_id: p_id }, {
                                $inc: { product_stock: no_of_products }
                            });

                            if (updateProductInInventory) {
                                // now updatting the order status to cancelled:
                                const cancel_order = await Order.updateOne({
                                    _id: order_id, $set: { order_status: "cancelled" }
                                });
                                if (cancel_order) {
                                    console.log("Oder cancelled successfully at admin side");
                                    return res.status(201).json({
                                        success: true,
                                        message: "Order cancelled successsfully"
                                    });
                                }
                            }
                        }
                    }

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