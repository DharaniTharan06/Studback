import mongoose, {isValidObjectId} from "mongoose"
import { User } from "../models/user.js"
import { Subscription } from "../models/subscription.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(channelId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await User.exists({_id: channelId}))){
        throw new apiError(404,"Channel does not exist")
    }
    if(channelId.toString() === userId.toString()){
        throw new apiError(400,"Can't self subscribe")
    }

    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId
    })

    if(existingSubscription){
        await Subscription.deleteOne({
            _id: existingSubscription._id
        })
    }else{
        await Subscription.create({
            channel: channelId,
            subscriber: userId
        })
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                subscribed: existingSubscription===null
            },
            "The subscription has been toggled"
        )
    )
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(channelId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await User.exists({_id: channelId}))){
        throw new apiError(404,"Channel does not exist")
    }
    if(userId.toString() !== channelId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $unwind: "$subscribers"
        },
        {
            $project: {
                channel: 1,
                subscriber: {
                    _id:"$subscribers._id",
                    username: "$subscribers.username",
                    fullname: "$subscribers.fullname"
                }
            }
        }
    ])

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                subscribers
            },
            "These are the subscribers to your channel"
        )
    )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(subscriberId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await User.exists({_id: subscriberId}))){
        throw new apiError(404,"Subscriber does not exist")
    }
    if(userId.toString() !== subscriberId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels"
            }
        },
        {
            $unwind: "$channels"
        },
        {
            $project: {
                subscriber: 1,
                channel: {
                    _id: "$channels._id",
                    username: "$channels.username"
                }
            }
        }
    ])
    
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                subscribedChannels
            },
            "These are the channels you have subscribed to"
        )
    )
})

export {toggleSubscription,getUserChannelSubscribers,getSubscribedChannels}