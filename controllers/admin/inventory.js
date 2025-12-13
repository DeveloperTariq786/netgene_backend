import mongoose, { mongo } from "mongoose";
import Inventory from "../../models/inventory.model.js";
import getInventoryStockStatus from "../../helpers/stock_status.js";
const updateInverntory = async (req, res) => {
    try {
        console.log("Update inventory was hit");
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
        if (!granted_permissions[0].can_update_records) {
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to update inventory`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to update inventory`
            })
        }
        const { product_stock } = req.body;
        const { inventory_id } = req.query;
        // console.log("Incomming req data->",product_stock,inventory_id);
        if (!product_stock) {
            return res.status(403).json({
                success: false,
                message: "Please enter product stock!"
            });
        }
        if (!inventory_id || !mongoose.Types.ObjectId.isValid(inventory_id)) {
            return res.status(401).json({
                success: false,
                message: "Invalid access or invalid inventory id"
            })
        }
        // checking if inventory exists or not:
        const isInventoryExisting = await Inventory.findById(inventory_id);
        if (!isInventoryExisting) {
            return res.status(404).json({
                success: false,
                message: "Inventory does not exists or inventory has been deleted"
            })
        }
        const filterObj = {
            _id: inventory_id
        };
        const updateObj = {};
        if (product_stock > 0 && product_stock <= 10) {
            updateObj.product_stock = product_stock;
            updateObj.stock_status = "Low Of Stock";
        }
        if (product_stock > 10) {
            updateObj.product_stock = product_stock;
            updateObj.stock_status = "In Stock";
        }
        else if (product_stock <= 0) {
            updateObj.product_stock = product_stock;
            updateObj.stock_status = "Out Of Stock";

        }

        const updateInventory = await Inventory.updateOne(filterObj,
            {
                $set: updateObj
            }
        )
        if (updateInventory) {
            return res.status(201).json({
                success: true,
                message: "Inventory updated successfully"
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "Inventory was not updated"
            })
        }



    }
    catch (err) {
        console.log("Error occured while updating inventory", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while updating inventory"
        });
    }

}
const bulkUpdateInventory = async (req, res) => {
    try {
        console.log("Bulk inventory update was hit");
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
        if (!granted_permissions[0].can_update_records) {
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to update inventory`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to update inventory`
            })
        }
        const { bulk_inventory } = req.body;
        // console.log("Req from body",bulk_inventory); 

        // checking for valid inventory_id's:
        let updateStatus = false;
        for (const payload of bulk_inventory) {
            let inventory_id = payload['inventory_id'];
            if (!mongoose.Types.ObjectId.isValid(inventory_id)) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid inventory id"
                })
            }
            // now preparing  bulk update payload
            let filterObj = {
                _id: inventory_id
            }
            let stock = payload['product_stock'];
            let stock_status = await getInventoryStockStatus(stock);
            let updateObj = {
                product_stock: stock,
                stock_status: stock_status
            }
            // finally Bulk update Operation:
            try {
                let bulkUpdate = await Inventory.updateOne(filterObj, {
                    $set: updateObj
                })

                if (bulkUpdate) {
                    console.log(`inventory updated for id ${inventory_id} successfully`);
                }
            }
            catch (err) {
                console.log(`Error occured while bulk updating for Id :${inventory_id} e${err.message} `);
                continue;
            }

        }
        return res.status(201).json({
            success: true,
            message: "Bulk update for Inventory Done successfully"
        })
    } catch (err) {
        console.log("Error occured while Updating bulk inventory", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while Updating bulk inventory"
        })


    }



}
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

        let { limit = 10,page = 1} = req.query;
        // console.log("Req items->", req.query);
        limit = parseInt(limit);
        page = parseInt(page);
        let skip = (page - 1) * limit;
        const count = await Inventory.countDocuments({});
        const totalPages = Math.ceil(count / limit);
        console.log("Limits",limit);
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
                    createdAt:1
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
                    createdAt:1,
                    product_url:1
                }
            },
             {
                $sort:{
                    createdAt:-1
                }
            },
            {
                $skip:skip
            },
            {
                $limit:limit
            },
        ]);

        if(inventoryResult){
            console.log("Inventory items fetched successfully");
            return res.status(200).json({
                success:true,
                message:"Inventory items fetched successfully",
                currentPage:page,
                limit:limit,
                totalPages:totalPages,
                data:inventoryResult
            });
        }else{

            console.log("Inventory items not found");
            return res.status(404).json({
                success:false,
                message:"Inventory items not found",
               
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
export { updateInverntory, bulkUpdateInventory, getBulkInventory };


