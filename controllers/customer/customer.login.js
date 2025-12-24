import User from "../../models/user.model.js";
import jwt from "jsonwebtoken";

const loginAndRegister = async (req, res) => {
    try {
        console.log("Customer login and register route was hit");
        const { first_name, last_name, email } = req.body;
        if (!first_name || !last_name || !email) {
            console.log("All feilds are required");
            return res.status(403).json({
                success: false,
                message: "All feilds are required"
            });
        }
        // checking if user already exists:
        const existingUser = await User.findOne({ first_name: first_name, last_name: last_name, email: email });
        if (existingUser) {

            const Token = jwt.sign({ Users: existingUser._doc }, process.env.JWT_SECRET_KEY, { expiresIn: "2d" });
            const userDetails = {
                email: existingUser.email,
                name: `${existingUser.first_name} ${existingUser.last_name}`,
                role: existingUser.role,
                permission: existingUser.permission_component,
                _id: existingUser._id
            };
            if (Token) {

                return res.status(200).json({
                    success: true,
                    message: "Existing Customer logged in successfully",
                    token: Token,
                    user: userDetails

                })
            }

        } else {
            // registering new customer:
            const permissions = [
                {
                    can_add_superadmin: false,
                    can_add_admin: false,
                    can_add_records: false,
                    can_update_records: false,
                    can_read_records: false,
                    can_delete_records: false,
                    is_customer: true
                }
            ];

            const newCustomer = await new User({
                first_name: first_name,
                last_name: last_name,
                email: email,
                password: `${first_name}${last_name}`,
                permission_component: permissions,
                role: "customer"

            }).save();
            if (newCustomer) {
                const Token = jwt.sign({ Users: newCustomer._doc }, process.env.JWT_SECRET_KEY, { expiresIn: "2d" });
                const userDetails = {
                    email: newCustomer.email,
                    name: `${newCustomer.first_name} ${newCustomer.last_name}`,
                    role: newCustomer.role,
                    permission: newCustomer.permission_component,
                    _id: newCustomer._id
                };

                if (Token) {
                    return res.status(201).json({
                        success: true,
                        Message: "New Customer logged In Successfully!",
                        user: userDetails,
                        Token: Token

                    })
                }

            }




        }






    }
    catch (err) {
        console.log("Error occured while Login and Registering customer", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while Login and Registering customer"
        })



    }
}

export { loginAndRegister };

