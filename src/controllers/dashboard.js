import mongoose from "mongoose"
import { Video } from "../models/video.js"
import { Subscription } from "../models/subscription.js"
import { Like } from "../models/like.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const [stats] = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $group: {
                _id: null,
                totalVideos: {
                    $sum: 1
                },
                totalViews: {
                    $sum: "$views"
                },
                videoIds: {
                    $push: "$_id"
                }
            }
        },
        {
            $lookup: {
                from: "likes",
                let: {
                    channelVideoIds: "$videoIds"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $in: ["$video", "$$channelVideoIds"]
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                as: "likeStats"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                let: {
                    channelId: req.user?._id
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$channel", "$$channelId"]
                            }
                        }
                    },
                    {
                        $count: "count"
                    }
                ],
                as: "subscriberStats"
            }
        },
        {
            $addFields: {
                totalLikes: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                "$likeStats.count",
                                0
                            ]
                        },
                        0
                    ]
                },
                totalSubscribers: {
                    $ifNull: [
                        {
                            $arrayElemAt: [
                                "$subscriberStats.count",
                                0
                            ]
                        },
                        0
                    ]
                }
            }
        },
        {
            $project: {
                _id: 0,
                videoIds: 0,
                likeStats: 0,
                subscriberStats: 0
            }
        }
    ])

    const channelStats = stats || {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalSubscribers: await Subscription.countDocuments({
            channel: req.user?._id
        })
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
    // TODO: Get all the videos uploaded by the channel
    const videos = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

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
