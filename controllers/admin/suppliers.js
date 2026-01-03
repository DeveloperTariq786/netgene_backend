import Supplier from "../../models/supplier.model.js";

// Add a new supplier
const addSupplier = async (req, res) => {
  try {
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

    if (!granted_permissions[0].can_add_records) {
      console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add suppliers`);
      return res.status(403).json({
        success: false,
        message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to add suppliers`
      });
    }

    console.log("Add supplier route was hit");
    const { name, email, phone } = req.body;

    // Check if name is provided (required field)
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required"
      });
    }

    // Check if supplier already exists
    const existingSupplier = await Supplier.findOne({ name: name.trim() });
    if (existingSupplier) {
      return res.status(403).json({
        success: false,
        message: "Supplier with this name already exists"
      });
    }

    // Create new supplier
    const newSupplier = await new Supplier({
      name: name.trim(),
      email: email ? email.trim() : undefined,
      phone: phone ? phone.trim() : undefined
    }).save();

    if (newSupplier) {
      console.log("Supplier was added successfully");
      return res.status(201).json({
        success: true,
        message: "Supplier was added successfully",
        supplier: newSupplier
      });
    } else {
      console.log("Supplier was not added");
      return res.status(500).json({
        success: false,
        message: "Supplier was not added"
      });
    }

  } catch (err) {
    console.log("Error occurred while adding supplier", err);
    return res.status(500).json({
      success: false,
      message: "Error occurred while adding supplier"
    });
  }
};

// Fetch all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const userDetails = req.user;
    const allowedUsers = ['admin', 'superadmin'];

    if (!allowedUsers.includes(userDetails.role)) {
      console.log("Un-authorised access only admin and superadmin allowed");
      return res.status(403).json({
        success: false,
        message: "Un-authorised access only admin and superadmin allowed"
      });
    }

    console.log("Fetch all suppliers route was hit");
    
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    if (suppliers && suppliers.length > 0) {
      console.log("Suppliers fetched successfully");
      return res.status(200).json({
        success: true,
        message: "Suppliers fetched successfully",
        totalCount: suppliers.length,
        suppliers: suppliers
      });
    } else {
      console.log("No suppliers found");
      return res.status(200).json({
        success: true,
        message: "No suppliers found",
        totalCount: 0,
        suppliers: []
      });
    }

  } catch (err) {
    console.log("Error occurred while fetching suppliers", err);
    return res.status(500).json({
      success: false,
      message: "Error occurred while fetching suppliers"
    });
  }
};

export { addSupplier, getAllSuppliers };
