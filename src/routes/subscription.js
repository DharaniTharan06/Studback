import { Router } from 'express';
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.js"
import {verifyjwt} from "../middlewares/auth.js"

const router = Router();
router.use(verifyjwt);// Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId") //Here channelId is actually userid
    .get(
        getUserChannelSubscribers
    )
    .post(
        toggleSubscription
    );

router.route("/u/:subscriberId").get( //Here subscriberId is actully userid
    getSubscribedChannels
);

export default router