import OrderAddress from "../../models/order_address.model.js";


const addShippingAddress = async (req, res) => {
    try {
        console.log("Add shipping address was hit");
        const userDetails = req.user;
        if (userDetails.role !== "customer" || userDetails.permission_component[0].is_customer != true) {
            return res.status(403).json({
                success: false,
                message: "Un-authorised access Or Invalid access"
            })

        }

    }
    catch (err) {
        console.log("Error occured while adding Shipping Address");
        return res.status(501).json({
            success: false,
            message: "Error occured while adding Shipping Address"
        });

    }


}
export { addShippingAddress };