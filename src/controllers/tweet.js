import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.js"
import { User } from "../models/user.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if(!content || content.trim()===""){
        throw new apiError(400,"Field empty")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    const createdTweet = await Tweet.aggregate([
        {
            $match: {
                _id: tweet._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner"
                }
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: {
                    _id: 1,
                    fullname: 1,
                    username: 1
                }
            }
        }
    ])

    return res
    .status(201)
    .json(
        new apiResponse(
            200,
            {
                createdTweet
            },
            "Tweet has been created"
        )
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    if(!userId){
        throw new apiError(400,"User id is missing")
    }
    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user id")
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" }
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: {
                    _id: 1,
                    fullname: 1,
                    username: 1
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
                tweets
            },
            "Tweets fetched successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if(!tweetId){
        throw new apiError(400,"Tweet id is missing")
    }
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id")
    }

    const { content } = req.body
    if(!content || content.trim()===""){
        throw new apiError(400,"Field is empty")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new apiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You are not allowed to update this tweet")
    }

    const updatedtweet = await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content: content.trim()
        }
    },{
        new: true
    })

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                updatedtweet
            },
            "Tweet content has been updated"
        )
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if(!tweetId){
        throw new apiError(400,"Tweet id is missing")
    }
    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new apiError(404, "Tweet not found")
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new apiError(403, "You are not allowed to delete this tweet")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    )
})

export {createTweet,getUserTweets,updateTweet,deleteTweet}