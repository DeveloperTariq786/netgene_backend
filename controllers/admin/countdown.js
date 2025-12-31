import Countdown from "../../models/countdown.model.js";
import { uploadToFirebaseStorage } from "../../helpers/uploadtofirebase.js"


const AddCountdownItem = async (req, res) => {
    try {
        console.log("Add countdown was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add countdown`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to add countdown`
            });
        }

        let { category, brand, title, description, discount, endTime, association } = req.body;

        console.log("Body params", req.body);

        if (!title || !description || !discount || !endTime) {
            return res.status(403).json({
                success: false,
                message: "Title, description, discount and end time are required"
            })
        }

        console.log("Checking for files->", req.file);
        if (!req?.file) {
            console.log("Please select file to upload");
            return res.status(403).json({
                success: false,
                message: "Please Select Countdown Image"
            })
        }
        const fileName = `assets/${req?.file?.originalname}`;
        const countdown_url = await uploadToFirebaseStorage(
            req?.file?.buffer,
            fileName,
            req?.file?.mimetype
        );

        if (association == "Category") {
            const addCountdown = await new Countdown({
                countdown_title: title,
                countdown_description: description,
                countdown_discount: discount,
                countdown_end_time: endTime,
                countdown_category: category,
                countdown_url: countdown_url,
                countdown_association: association.toLowerCase()
            }).save();
            if (addCountdown) {
                return res.status(201).json({
                    success: true,
                    message: `Countdown item created successfully associated with ${association}`
                })
            }
        }
        else if (association == "Brand") {
            const addCountdown = await new Countdown({
                countdown_title: title,
                countdown_description: description,
                countdown_discount: discount,
                countdown_end_time: endTime,
                countdown_url: countdown_url,
                countdown_brand: brand,
                countdown_association: association.toLowerCase()
            }).save();
            if (addCountdown) {
                return res.status(201).json({
                    success: true,
                    message: `Countdown item created successfully associated with ${association}`
                })
            }
        }
    }
    catch (err) {
        console.log("Error occured while adding Countdown", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while adding Countdown"
        });
    }
}

const fetchCountdownItems = async (req, res) => {
    try {
        console.log("Fetch countdown items was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to read countdowns`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to read countdowns`
            });
        }
        const countdowns = await Countdown.find();

        const dataWithTime = countdowns.map(item => {
            const now = new Date().getTime();
            const endTime = new Date(item.countdown_end_time).getTime();
            const timeDiff = endTime - now;

            let remainingString = "00/00/00/00";

            if (timeDiff > 0) {
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

                remainingString = `${String(days).padStart(2, '0')}/${String(hours).padStart(2, '0')}/${String(minutes).padStart(2, '0')}/${String(seconds).padStart(2, '0')}`;
            }

            return {
                ...item._doc,
                remainingTime: remainingString
            }
        })

        if (dataWithTime.length >= 1) {
            return res.status(200).json({
                success: true,
                message: "Countdown items found successfully",
                data: dataWithTime
            })
        } else {
            return res.status(200).json({
                success: true,
                message: "Countdown items not found",
                data: []
            })
        }

    } catch (err) {
        console.log("Error occured while fetching countdown items", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching countdown items"
        })
    }
}

const deleteCountdownItems = async (req, res) => {
    try {
        console.log("Delete countdown was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to delete countdowns`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to delete countdowns`
            });
        }

        const { countdown_id } = req.query;

        const deleteCountdown = await Countdown.deleteOne({ _id: countdown_id });
        if (deleteCountdown) {
            return res.status(201).json({
                success: true,
                message: "Countdown item was deleted successfully"
            });
        } else {
            return res.status(404).json({
                success: false,
                message: "Countdown item was not deleted!"
            });
        }

    }
    catch (err) {
        console.log("Error occured while deleting countdowns", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while Deleting Countdown"
        });
    }
}

export { AddCountdownItem, fetchCountdownItems, deleteCountdownItems };
