import Carousel from "../../models/carousel.model.js";
import { uploadToFirebaseStorage } from "../../helpers/uploadtofirebase.js"


const AddcarouselItem = async (req, res) => {
    try {
        console.log("Add carousel was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add  carousel`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to add carousel}`
            });
        }

        let { category, brand, title, description, association } = req.body;

        console.log("Body params", req.body);

        if (!title || !description) {
            return res.status(403).json({
                success: false,
                message: "Title and description is required"
            })
        }

        console.log("Checking for files->", req.file);
        if (!req?.file) {
            console.log("Please select file to upload");
            return res.status(403).json({
                success: false,
                message: "Please Select Carousel Image"
            })
        }
        const fileName = `assets/${req?.file?.originalname}`;
        const carousel_url = await uploadToFirebaseStorage(
            req?.file?.buffer,
            fileName,
            req?.file?.mimetype
        );
        if (association == "Category") {
            // creating new carousel item:
            const addCarousel = await new Carousel({
                carousel_title: title.toLowerCase(),
                carousel_description: description.toLowerCase(),
                carousel_category: category,
                carousel_url: carousel_url,
                carousel_association: association.toLowerCase()
            }).save();
            if (addCarousel) {
                return res.status(201).json({
                    success: true,
                    message: `Carousel item created successfully associated with ${association}`
                })

            }

        }
        else if (association == "Brand") {
            const addCarousel = await new Carousel({
                carousel_title: title.toLowerCase(),
                carousel_description: description.toLowerCase(),
                carousel_url: carousel_url,
                carousel_brand: brand,
                carousel_association: association.toLowerCase()
            }).save();
            if (addCarousel) {
                return res.status(201).json({
                    success: true,
                    message: `Carousel item created successfully associated with ${association}`
                })

            }

        }

    }
    catch (err) {
        console.log("Error occured while adding Carousel", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while adding Carousel"

        });
    }
}

const updateCarouselItem = async (req, res) => {
    try {
        console.log("Update Carousel was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to update  carousel`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to update carousel}`
            });
        }
        let { category, brand, title, description, association } = req.body;
        const { carousel_id } = req.query;
        let carousel_obj = {};
        if (category) {
            carousel_obj.carousel_category = category
        }
        if (brand) {
            carousel_obj.brand_category = brand
        }
        if (association) {
            carousel_obj.carousel_association = association
        }
        if (title) {
            carousel_obj.carousel_title = title
        }
        if (description) {
            carousel_obj.carousel_description = description
        }
        // console.log("File --->", req.file);
        if (req?.file) {
            const fileName = `assets/${req?.file?.originalname}`;
            const carousel_url = await uploadToFirebaseStorage(
                req?.file?.buffer,
                fileName,
                req?.file?.mimetype
            );
            carousel_obj.carousel_url = carousel_url;
        }

        const id_filter = { _id: carousel_id }
        const updateCarousel = await Carousel.updateOne(id_filter,
            {
                $set: carousel_obj
            }
        )
        if (updateCarousel) {
            return res.status(201).json({
                success: true,
                message: "Carousel updated successfully"
            })
        } else {
            return res.status(404).json({
                success: true,
                message: "Carousel was not updated"
            })

        }


    }
    catch (err) {
        console.log("Error accured while updating carousel item");
        return res.status(501).json({
            success: false,
            message: "Error accured while updating carousel item"
        })

    }
}

const fetchCarouselItems = async (req, res) => {
    try {
        console.log("Fetch carousel items was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to read  carousels`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to read carousels}`
            });
        }
        const carousels = await Carousel.find();
        if (carousels.length >= 1) {
            return res.status(200).json({
                success: true,
                message: "Carousel items found successfully",
                data: carousels
            })
        } else {
            return res.status(404).json({
                success: false,
                message: "Carousel items not found",
            })
        }

    } catch (err) {
        console.log("Error occured while fetching carousel items", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching carousel items"
        })
    }
}

const deleteCarouselItems = async (req, res) => {
    try {
        console.log("Delete carousel was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to delete  carousels`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to delete carousels}`
            });
        }

        const { carousel_id } = req.query;

        const deleteCarousel = await Carousel.deleteOne({ _id: carousel_id });
        if (deleteCarousel) {
            return res.status(201).json({
                success: true,
                message: "Carousel item was deleted successfully"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Carousel item was not deleted!"
            });

        }


    }
    catch (err) {
        console.log("Error occured while deleting carousels", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while Deleting Carousel"
        });



    }

}







export { AddcarouselItem, updateCarouselItem, fetchCarouselItems, deleteCarouselItems };