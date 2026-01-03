import mongoose from "mongoose";
import Inventory from "../../models/inventory.model.js";
import InventoryBill from "../../models/inventory_bill.model.js";
import getInventoryStockStatus from "../../helpers/stock_status.js";
const getBulkInventory = async (req, res) => {
    try {
        console.log("Get inventory items was hit");
        const userDetails = req.user;
        const allowedUsers = ['admin', 'superadmin'];
        const granted_permissions = userDetails.permission_component;
        if (!allowedUsers.includes(userDetails.role)) {
            console.log("Un-authorised access only admin and superadmin allowed");
            return res.status(403).json({
                success: false,
                message: "Un-authorised access only admin and superadmin allowed"

            })

        }
        if (!granted_permissions[0].can_add_records) {
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch inventory`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch inventory`
            })
        }

        let { limit = 10, page = 1 } = req.query;
        // console.log("Req items->", req.query);
        limit = parseInt(limit);
        page = parseInt(page);
        let skip = (page - 1) * limit;
        const count = await Inventory.countDocuments({});
        const totalPages = Math.ceil(count / limit);
        console.log("Limits", limit);
        // fetching inventory items:
        const inventoryResult = await Inventory.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "product_id",
                    foreignField: "_id",
                    as: "result"
                }
            },
            {
                $unwind: "$result"
            },

            {
                $project: {
                    _id: 1,
                    product_stock: 1,
                    product_code: 1,
                    stock_status: 1,
                    product_name: "$result.product_name",
                    product_url: "$result.avatar",
                    product_dimension: "$result.dimensions",
                    createdAt: 1
                }
            },
            {
                $lookup: {
                    from: "metrics",
                    localField: "product_dimension",
                    foreignField: "_id",
                    as: "dimension_result"
                }
            },
            {
                $unwind: "$dimension_result"
            },
            {
                $project: {
                    product_stock: 1,
                    product_code: 1,
                    stock_status: 1,
                    product_name: 1,
                    dimension_name: "$dimension_result.dimension_name",
                    createdAt: 1,
                    product_url: 1
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
        ]);

        if (inventoryResult) {
            console.log("Inventory items fetched successfully");
            return res.status(200).json({
                success: true,
                message: "Inventory items fetched successfully",
                currentPage: page,
                limit: limit,
                totalPages: totalPages,
                data: inventoryResult
            });
        } else {

            console.log("Inventory items not found");
            return res.status(404).json({
                success: false,
                message: "Inventory items not found",

            });



        }


    } catch (err) {
        console.log("Error occured while fething inventory items", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fething inventory items"
        });

    }
}

const addInventoryBill = async (req, res) => {
    try {
        console.log("Add inventory bill was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add inventory bills`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to add inventory bills`
            });
        }

        const { bill_date, items } = req.body;

        if (!bill_date) {
            return res.status(400).json({
                success: false,
                message: "Bill date is required"
            });
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Items array is required and must not be empty"
            });
        }

        // Validate all items
        const billItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const { inventory_id, supplier_id, quantity, unit_price } = item;

            if (!inventory_id || !mongoose.Types.ObjectId.isValid(inventory_id)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid inventory_id: ${inventory_id}`
                });
            }

            if (!supplier_id || !mongoose.Types.ObjectId.isValid(supplier_id)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid supplier_id"
                });
            }

            if (!quantity || quantity <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Quantity must be greater than 0"
                });
            }

            if (!unit_price || unit_price < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Unit price must be 0 or greater"
                });
            }

            // Find inventory by inventory_id to ensure it exists
            const inventory = await Inventory.findById(inventory_id);
            if (!inventory) {
                return res.status(404).json({
                    success: false,
                    message: `Inventory not found for id: ${inventory_id}`
                });
            }

            billItems.push({
                inventory_id,
                supplier_id,
                quantity,
                unit_price
            });

            totalAmount += quantity * unit_price;
        }

        // Generate sequential bill number: INV-YYMM-XXXX
        const now = new Date();
        const year = now.getFullYear().toString().slice(-2);
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const prefix = `INV-${year}${month}-`;

        // Find the last bill for the current month
        const lastBill = await InventoryBill.findOne({
            bill_number: new RegExp(`^${prefix}`)
        }).sort({ createdAt: -1 });

        let sequence = 1;
        if (lastBill && lastBill.bill_number) {
            const lastSeq = parseInt(lastBill.bill_number.split('-').pop());
            if (!isNaN(lastSeq)) {
                sequence = lastSeq + 1;
            }
        }
        const billNumber = `${prefix}${sequence.toString().padStart(4, '0')}`;

        // Create the bill record
        const inventoryBill = new InventoryBill({
            bill_number: billNumber,
            bill_date,
            items: billItems,
            total_amount: totalAmount,
            created_by: userDetails._id
        });

        await inventoryBill.save();

        // Update inventory stock for each item
        for (const item of billItems) {
            const inventory = await Inventory.findById(item.inventory_id);
            const newStock = inventory.product_stock + item.quantity;
            const stockStatus = await getInventoryStockStatus(newStock);

            await Inventory.updateOne(
                { _id: item.inventory_id },
                {
                    $set: {
                        product_stock: newStock,
                        stock_status: stockStatus
                    }
                }
            );
        }

        console.log("Inventory bill added successfully");
        return res.status(201).json({
            success: true,
            message: "Inventory bill added successfully"
        });
    } catch (err) {
        console.log("Error occurred while adding inventory bill", err);
        return res.status(500).json({
            success: false,
            message: "Error occurred while adding inventory bill"
        });
    }
}

const getAllInventoryBills = async (req, res) => {
    try {
        console.log("Get all inventory bills was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch inventory bills`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch inventory bills`
            });
        }

        let { limit = 10, page = 1 } = req.query;
        limit = parseInt(limit);
        page = parseInt(page);
        let skip = (page - 1) * limit;

        const totalBills = await InventoryBill.countDocuments({});
        const totalPages = Math.ceil(totalBills / limit);

        const bills = await InventoryBill.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Map data to the requested format
        const formattedBills = bills.map(bill => {
            const date = new Date(bill.bill_date);
            const formattedDate = date.toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
            }) + ' • ' + date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }).toLowerCase();

            return {
                _id: bill._id,
                bill_number: bill.bill_number,
                bill_date: formattedDate,
                items_count: `${bill.items.length} ${bill.items.length === 1 ? 'item' : 'items'}`,
                total_amount: `$${bill.total_amount.toFixed(2)}`
            };
        });

        return res.status(200).json({
            success: true,
            totalBills,
            totalPages,
            currentPage: page,
            data: formattedBills
        });

    } catch (err) {
        console.log("Error occurred while fetching inventory bills", err);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching inventory bills"
        });
    }
}

const getInventoryBillById = async (req, res) => {
    try {
        console.log("Get inventory bill by ID was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch inventory bills`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to fetch inventory bills`
            });
        }

        const { id } = req.query;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid bill ID"
            });
        }

        const billData = await InventoryBill.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(id) } },
            { $unwind: "$items" },
            // Join with Inventory
            {
                $lookup: {
                    from: "inventories",
                    localField: "items.inventory_id",
                    foreignField: "_id",
                    as: "inventory_info"
                }
            },
            { $unwind: { path: "$inventory_info", preserveNullAndEmptyArrays: true } },
            // Join with Product
            {
                $lookup: {
                    from: "products",
                    localField: "inventory_info.product_id",
                    foreignField: "_id",
                    as: "product_info"
                }
            },
            { $unwind: { path: "$product_info", preserveNullAndEmptyArrays: true } },
            // Join with Supplier
            {
                $lookup: {
                    from: "suppliers",
                    localField: "items.supplier_id",
                    foreignField: "_id",
                    as: "supplier_info"
                }
            },
            { $unwind: { path: "$supplier_info", preserveNullAndEmptyArrays: true } },
            // Join with Metrics (Dimensions)
            {
                $lookup: {
                    from: "metrics",
                    localField: "product_info.dimensions",
                    foreignField: "_id",
                    as: "metrics_info"
                }
            },
            { $unwind: { path: "$metrics_info", preserveNullAndEmptyArrays: true } },
            // Group back
            {
                $group: {
                    _id: "$_id",
                    bill_number: { $first: "$bill_number" },
                    bill_date: { $first: "$bill_date" },
                    total_amount: { $first: "$total_amount" },
                    items: {
                        $push: {
                            product_name: { $ifNull: ["$product_info.product_name", "Unknown Product"] },
                            supplier_name: { $ifNull: ["$supplier_info.name", "Unknown Supplier"] },
                            unit: { $ifNull: ["$metrics_info.dimension_name", "N/A"] },
                            quantity: "$items.quantity",
                            unit_price: "$items.unit_price",
                            total: { $multiply: ["$items.quantity", "$items.unit_price"] }
                        }
                    }
                }
            }
        ]);

        if (!billData || billData.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Bill not found"
            });
        }

        const bill = billData[0];
        const date = new Date(bill.bill_date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'long',
            day: '2-digit',
            year: 'numeric'
        }) + ' • ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();

        const response = {
            bill_number: `#${bill.bill_number}`,
            bill_date: formattedDate,
            items: bill.items.map(item => ({
                product: item.product_name,
                supplier: item.supplier_name,
                unit: item.unit,
                price: `$${item.unit_price.toFixed(2)}`,
                qty: item.quantity,
                total: `$${item.total.toFixed(2)}`
            })),
            grand_total: `$${bill.total_amount.toFixed(2)}`
        };

        return res.status(200).json({
            success: true,
            data: response
        });

    } catch (err) {
        console.log("Error occurred while fetching inventory bill details", err);
        return res.status(500).json({
            success: false,
            message: "Error occurred while fetching inventory bill details"
        });
    }
}

export { getBulkInventory, addInventoryBill, getAllInventoryBills, getInventoryBillById };
