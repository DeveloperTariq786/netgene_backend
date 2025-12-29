import Order from "../../models/order.model.js";

const fetchAllOrders = async (req, res) => {
    try {
        console.log("Fetch all orders for admin was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch orders`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch orders`
            });
        }

        // Pagination parameters
        let { page = 1, limit = 10 } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const skip = (page - 1) * limit;

        const totalOrders = await Order.countDocuments();
        const orders = await Order.find()
            .populate("customer_id", "first_name last_name email phone_number")
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
            console.log("All orders fetched successfully for admin");
            return res.status(200).json({
                success: true,
                message: "All orders fetched successfully",
                orders: formattedOrders,
                pagination: {
                    totalOrders,
                    currentPage: page,
                    totalPages: Math.ceil(totalOrders / limit),
                    limit
                }
            });
        } else {
            console.log("No orders found");
            return res.status(404).json({
                success: false,
                message: "No orders found"
            });
        }
    } catch (err) {
        console.log("Error occurred while fetching orders for admin", err);
        return res.status(501).json({
            success: false,
            message: "Error occurred while fetching orders"
        });
    }
};

export { fetchAllOrders };
