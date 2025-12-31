import Countdown from "../../models/countdown.model.js";
import { uploadToFirebaseStorage } from "../../helpers/uploadtofirebase.js"


const AddCountdownItem = async (req, res) => {
    try {
        console.log("Add/Update countdown was hit");
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
            console.log(`${userDetails.first_name} as a ${userDetails.role} is not allowed to add/update countdown`);
            return res.status(403).json({
                success: false,
                message: `${userDetails.first_name} as a ${userDetails.role} is not allowed to add/update countdown`
            });
        }

        let { category, brand, title, description, discount, endTime, association } = req.body;

        console.log("Body params", req.body);

        if (!title || !description || !discount || !endTime) {
            return res.status(403).json({
                success: false,
                message: "Title, description, discount and end time are required"
            });
        }

        // Fetch all existing countdown items
        const existingCountdowns = await Countdown.find();

        let countdown_url;
        if (req?.file) {
            const fileName = `assets/${req?.file?.originalname}`;
            countdown_url = await uploadToFirebaseStorage(
                req?.file?.buffer,
                fileName,
                req?.file?.mimetype
            );
        }

        if (existingCountdowns.length > 0) {
            // Update the first existing item
            const itemToUpdate = existingCountdowns[0];

            // If there are duplicates (more than 1), delete them to self-heal
            if (existingCountdowns.length > 1) {
                const idsToDelete = existingCountdowns.slice(1).map(item => item._id);
                await Countdown.deleteMany({ _id: { $in: idsToDelete } });
                console.log(`Cleaned up ${idsToDelete.length} duplicate countdown items.`);
            }

            itemToUpdate.countdown_title = title;
            itemToUpdate.countdown_description = description;
            itemToUpdate.countdown_discount = discount;
            itemToUpdate.countdown_end_time = endTime;
            itemToUpdate.countdown_association = association.toLowerCase();

            if (countdown_url) {
                itemToUpdate.countdown_url = countdown_url;
            }

            if (association === "Category") {
                itemToUpdate.countdown_category = category;
                itemToUpdate.countdown_brand = undefined; // Clear brand if switching to category
            } else if (association === "Brand") {
                itemToUpdate.countdown_brand = brand;
                itemToUpdate.countdown_category = undefined; // Clear category if switching to brand
            }

            await itemToUpdate.save();

            return res.status(200).json({
                success: true,
                message: `Countdown item updated successfully associated with ${association}`
            });

        } else {
            // Create new item
            console.log("Checking for files for new item->", req.file);
            if (!req?.file) {
                console.log("Please select file to upload");
                return res.status(403).json({
                    success: false,
                    message: "Please Select Countdown Image"
                });
            }

            if (!countdown_url) {
                return res.status(403).json({
                    success: false,
                    message: "Please Select Countdown Image"
                });
            }

            let newCountdownData = {
                countdown_title: title,
                countdown_description: description,
                countdown_discount: discount,
                countdown_end_time: endTime,
                countdown_url: countdown_url,
                countdown_association: association.toLowerCase()
            };

            if (association === "Category") {
                newCountdownData.countdown_category = category;
            } else if (association === "Brand") {
                newCountdownData.countdown_brand = brand;
            }

            const addCountdown = await new Countdown(newCountdownData).save();

            if (addCountdown) {
                return res.status(201).json({
                    success: true,
                    message: `Countdown item created successfully associated with ${association}`
                });
            }
        }

    }
    catch (err) {
        console.log("Error occured while adding/updating Countdown", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while adding/updating Countdown"
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

export { AddCountdownItem, fetchCountdownItems };
