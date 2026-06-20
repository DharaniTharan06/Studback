import mongoose from "mongoose"
import { Video } from "../models/video.js"
import { Subscription } from "../models/subscription.js"
import { Like } from "../models/like.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const [videostats , subscribersstats] = await Promise.all([
        Video.aggregate([
            {
                $match: {
                    owner: req.user._id
                }
            },
            {
                $lookup: {
                    from:"likes",
                    localField: "_id",
                    foreignField: "video",
                    as: "Videolikes"
                }
            },
            {
                $group: {
                    _id:null,
                    totalVideos: {
                        $sum: 1
                    },
                    totalViews: {
                        $sum: "$views"
                    },
                    totalLikes: {
                        $sum: {
                            $size: "$Videolikes"
                        }
                    }
                }
            },
        ]),
        Subscription.countDocuments({
            channel: req.user._id
        })
    ])

    const stats = videostats[0]

    const channelStats = {
        totalVideos: stats?.totalVideos || 0,
        totalViews: stats?.totalViews || 0,
        totalLikes: stats?.totalLikes || 0,
        totalSubscribers: subscribersstats || 0
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                stats: channelStats
            },
            "Channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find(
        {
            owner: req.user._id
        }
    )
    .sort(
        {
            createdAt: -1
        }
    )

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {   
                videos
            },
            "Channel videos fetched successfully"
        )
    )
})

export {getChannelStats, getChannelVideos}
