import User from "../../models/user.model.js";


const addUsers = async (req, res) => {
  try {
    const loggedUser = req.user;
    console.log("Add user route hit", loggedUser.role);
    const accessParams = ["superadmin", "admin"];
    const accessRole = loggedUser.role;
    if (!accessParams.includes(accessRole)) {
      console.log("Roles other than admin and super admin not allowed");
      return res.status(403).json({
        success: false,
        message: "Roles other than admin and super admin not allowed"
      })


    }
    let { first_name, last_name, phone_number, email, password, role } = req.body;
    if (!first_name || !last_name || !phone_number || !email || !password || !role) {
      console.log("All fields are required");
      return res.status(403).json({
        success: false,
        message: "All fields are required!"
      });

    }
    // checking whether user exists:
    const existingUser = await User.find({ email: email });
    if (existingUser.length) {
      console.log("User already exists");
      return res.status(403).json({
        success: false,
        message: "User alredy exists please add new"
      })


    }


    const permissions = [];
    // const userObj = {};
    if (loggedUser.role === "superadmin" && role === "superadmin") {
      let obj = {
        can_add_superadmin: true,
        can_add_admin: true,
        can_add_records: true,
        can_update_records: true,
        can_read_records: true,
        can_delete_records: true

      }
      permissions.push(obj);

    }
    else if (loggedUser.role === "superadmin" && role === "admin") {

      let obj = {
        can_add_superadmin: false,
        can_add_admin: true,
        can_add_records: true,
        can_update_records: true,
        can_read_records: true,
        can_delete_records: false

      }
      permissions.push(obj);


    }
    else if (loggedUser.role === "admin" && role === "admin") {

      let obj = {
        can_add_superadmin: false,
        can_add_admin: true,
        can_add_records: true,
        can_update_records: true,
        can_read_records: true,
        can_delete_records: false

      }
      permissions.push(obj);

    }
    else if (loggedUser.role === "admin" && role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Admin cant add superadmin"

      })


    } else {
      return res.status(403).json({
        success: false,
        message: "No more roles allowed",
        role: role,
      })
    }

    console.log("Permissions given", permissions);
    // preparing users to create:
    const createUser = await new User({
      first_name: first_name.toLowerCase(),
      last_name: last_name.toLowerCase(),
      email: email.toLowerCase(),
      password: password,
      phone_number: phone_number,
      role: role.toLowerCase(),
      permission_component: permissions
    }).save();
    if (createUser) {
      console.log("User created successfully");
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        User: createUser
      })
    }
    else {
      console.log("User was not created!")
      return res.status(401).json({
        success: true,
        message: "User was not created "
      })


    }



  }
  catch (err) {
    console.log("Error occured while Adding user", err);
    return res.status(501).json({
      success: false,
      message: "Error occured while Adding User"
    });

  }
}

const getAllUsers = async (req, res) => {
  try {
    const loggedUser = req.user;
    console.log("Get all users route hit", loggedUser.role);
    const accessParams = ["superadmin", "admin"];
    const accessRole = loggedUser.role;

    if (!accessParams.includes(accessRole)) {
      console.log("Un-authorised access");
      return res.status(403).json({
        success: false,
        message: "Un-authorised access"
      });
    }

    let query = {};
    if (accessRole === "admin") {
      // Admin can't fetch superadmin
      query = { role: { $ne: "superadmin" } };
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    if (users.length > 0) {
      console.log("Users fetched successfully");
      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        users: users
      });
    } else {
      console.log("No users found");
      return res.status(404).json({
        success: false,
        message: "No users found"
      });
    }
  } catch (err) {
    console.log("Error occurred while fetching users", err);
    return res.status(501).json({
      success: false,
      message: "Error occurred while fetching users"
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const loggedUser = req.user;
    const { user_id } = req.query;
    console.log("Update user route hit", loggedUser.role, "Target ID:", user_id);

    const accessParams = ["superadmin", "admin"];
    if (!accessParams.includes(loggedUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Un-authorised access"
      });
    }

    if (!user_id) {
      return res.status(403).json({
        success: false,
        message: "User ID is required"
      });
    }

    const targetUser = await User.findById(user_id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Restriction: Admin cannot edit superadmin
    if (loggedUser.role === "admin" && targetUser.role === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Admin cannot edit superadmin details"
      });
    }

    let { first_name, last_name, phone_number, email, password, role } = req.body;
    let updateObj = {};

    if (first_name) updateObj.first_name = first_name.toLowerCase();
    if (last_name) updateObj.last_name = last_name.toLowerCase();
    if (phone_number) updateObj.phone_number = phone_number;
    if (email) updateObj.email = email.toLowerCase();
    if (password) updateObj.password = password;

    if (role) {
      role = role.toLowerCase();
      // Admin cannot promote anyone to superadmin
      if (loggedUser.role === "admin" && role === "superadmin") {
        return res.status(403).json({
          success: false,
          message: "Admin cannot assign superadmin role"
        });
      }

      updateObj.role = role;
      const permissions = [];
      if (role === "superadmin") {
        permissions.push({
          can_add_superadmin: true,
          can_add_admin: true,
          can_add_records: true,
          can_update_records: true,
          can_read_records: true,
          can_delete_records: true
        });
      } else if (role === "admin") {
        permissions.push({
          can_add_superadmin: false,
          can_add_admin: true,
          can_add_records: true,
          can_update_records: true,
          can_read_records: true,
          can_delete_records: false
        });
      } else if (role === "customer") {
        permissions.push({
          is_customer: true
        });
      }
      updateObj.permission_component = permissions;
    }

    const updatedUser = await User.findByIdAndUpdate(user_id, { $set: updateObj }, { new: true });

    if (updatedUser) {
      console.log("User updated successfully");
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        user: updatedUser
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Failed to update user"
      });
    }
  } catch (err) {
    console.log("Error occurred while updating user", err);
    return res.status(501).json({
      success: false,
      message: "Error occurred while updating user"
    });
  }
};

export { addUsers, getAllUsers, updateUser };



