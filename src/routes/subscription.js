import { Router } from 'express';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.js"
import {verifyjwt} from "../middlewares/auth.js"

const router = Router();
router.use(verifyjwt);// Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId")
    .get(
        getSubscribedChannels
    )
    .post(
        toggleSubscription
    );

router.route("/u/:subscriberId").get(
    getUserChannelSubscribers
);

export default router