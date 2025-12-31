import Countdown from "../../../models/countdown.model.js";
import Banner from "../../../models/banner.model.js";
import Carousel from "../../../models/carousel.model.js";

const getLandingPageCarousel = async (req, res) => {
    try {
        console.log("Get Landing Page Carousel was hit");
        const carousels = await Carousel.find();
        return res.status(200).json({
            success: true,
            message: "Carousels fetched successfully",
            data: carousels
        });
    } catch (err) {
        console.log("Error occured while fetching carousels", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching carousels"
        });
    }
}

const getLandingPageBanner = async (req, res) => {
    try {
        console.log("Get Landing Page Banner was hit");
        const banners = await Banner.find();
        return res.status(200).json({
            success: true,
            message: "Banners fetched successfully",
            data: banners
        });
    } catch (err) {
        console.log("Error occured while fetching banners", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching banners"
        });
    }
}

const getLandingPageCountdown = async (req, res) => {
    try {
        console.log("Get Landing Page Countdown was hit");
        const countdowns = await Countdown.find();
        const countdownsWithTime = countdowns.map(item => {
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
        });

        console.log("Countdowns fetched successfully", countdownsWithTime);
        return res.status(200).json({
            success: true,
            message: "Countdowns fetched successfully",
            data: countdownsWithTime
        });

    } catch (err) {
        console.log("Error occured while fetching countdowns", err);
        return res.status(501).json({
            success: false,
            message: "Error occured while fetching countdowns"
        });
    }
}

export { getLandingPageCarousel, getLandingPageBanner, getLandingPageCountdown };
