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
        const loggedInCustomerId = userDetails._id;
        const { customer_id } = req.query;
        console.log("User details", loggedInCustomerId, customer_id);
        if (!loggedInCustomerId === customer_id) {
            return res.status(403).json({
                success: false,
                message: "Cannot process further for orderes || Invalid customer"
            })
        }

        let { first_name, last_name, email, phone_number, address, state, country, city, postal_code } = req.body;

        if (!first_name || !last_name || !email || !phone_number || !address || !state || !country || !city || !postal_code) {
            return res.status(403).json({
                success: false,
                message: "All fields are required"
            });


        }

        // creating shipping address:
        const shippingAddress = await new OrderAddress({
            customer_id: loggedInCustomerId,
            first_name: first_name.toLowerCase(),
            last_name: last_name.toLowerCase(),
            email: email.toLowerCase(),
            phone_number: phone_number,
            address: address.toLowerCase(),
            state: state.toUpperCase(),
            country: country.toUpperCase(),
            city: city.toUpperCase(),
            postal_code: postal_code
        }).save();

        if (shippingAddress) {
            return res.status(201).json({
                success: true,
                message: "Shipping address created successfuly"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Shipping address not created!"
            });
        }
    }
    catch (err) {
        console.log("Error occured while adding Shipping Address", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while adding Shipping Address"
        });

    }


}
export { addShippingAddress };