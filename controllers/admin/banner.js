import Banner from "../../models/banner.model.js";
import { uploadToFirebaseStorage } from "../../helpers/uploadtofirebase.js"


const AddBannerItem = async (req, res) => {
    try {
        console.log("Add banner was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add  banner`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to add banner}`
            });
        }

        let { category, brand, association } = req.body;

        console.log("Body params", req.body);

        console.log("Checking for files->", req.file);
        if (!req?.file) {
            console.log("Please select file to upload");
            return res.status(403).json({
                success: false,
                message: "Please Select Banner Image"
            })
        }
        const fileName = `assets/${req?.file?.originalname}`;
        const banner_url = await uploadToFirebaseStorage(
            req?.file?.buffer,
            fileName,
            req?.file?.mimetype
        );
        if (association == "Category") {
            // creating new banner item:
            const addBanner = await new Banner({
                banner_category: category,
                banner_url: banner_url,
                banner_association: association.toLowerCase()
            }).save();
            if (addBanner) {
                return res.status(201).json({
                    success: true,
                    message: `Banner item created successfully associated with ${association}`
                })

            }

        }
        else if (association == "Brand") {
            const addBanner = await new Banner({
                banner_url: banner_url,
                banner_brand: brand,
                banner_association: association.toLowerCase()
            }).save();
            if (addBanner) {
                return res.status(201).json({
                    success: true,
                    message: `Banner item created successfully associated with ${association}`
                })

            }

        }

    }
    catch (err) {
        console.log("Error occured while adding Banner", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while adding Banner"

        });
    }
}

const updateBannerItem = async (req, res) => {
    try {
        console.log("Update Banner was hit");
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

        if (!granted_permissions[0].can_update_records) {
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to update  banner`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to update banner}`
            });
        }
        let { category, brand, association } = req.body;
        const { banner_id } = req.query;
        let banner_obj = {};
        if (category) {
            banner_obj.banner_category = category
        }
        if (brand) {
            banner_obj.brand_category = brand
        }
        if (association) {
            banner_obj.banner_association = association
        }

        // console.log("File --->", req.file);
        if (req?.file) {
            const fileName = `assets/${req?.file?.originalname}`;
            const banner_url = await uploadToFirebaseStorage(
                req?.file?.buffer,
                fileName,
                req?.file?.mimetype
            );
            banner_obj.banner_url = banner_url;
        }

        const id_filter = { _id: banner_id }
        const updateBanner = await Banner.updateOne(id_filter,
            {
                $set: banner_obj
            }
        )
        if (updateBanner) {
            return res.status(201).json({
                success: true,
                message: "Banner updated successfully"
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Banner was not updated"
            })

        }


    }
    catch (err) {
        console.log("Error accured while updating banner item");
        return res.status(501).json({
            success: false,
            message: "Error accured while updating banner item"
        })

    }
}

const fetchBannerItems = async (req, res) => {
    try {
        console.log("Fetch banner items was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to read  banners`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to read banners}`
            });
        }
        const banners = await Banner.find();
        if (banners.length >= 1) {
            return res.status(200).json({
                success: true,
                message: "Banner items found successfully",
                data: banners
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Banner items not found",
                data: []
            })
        }

    } catch (err) {
        console.log("Error occured while fetching banner items", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching banner items"
        })
    }
}

const deleteBannerItems = async (req, res) => {
    try {
        console.log("Delete banner was hit");
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

        if (!granted_permissions[0].can_delete_records) {
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to delete  banners`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to delete banners}`
            });
        }

        const { banner_id } = req.query;

        const deleteBanner = await Banner.deleteOne({ _id: banner_id });
        if (deleteBanner) {
            return res.status(201).json({
                success: true,
                message: "Banner item was deleted successfully"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Banner item was not deleted!"
            });

        }


    }
    catch (err) {
        console.log("Error occured while deleting banners", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while Deleting Banner"
        });



    }

}







export { AddBannerItem, updateBannerItem, fetchBannerItems, deleteBannerItems };
