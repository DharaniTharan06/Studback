import mongoose, {isValidObjectId} from "mongoose"
import { Like } from "../models/like.js"
import { Video } from "../models/video.js"
import { Comment } from "../models/comment.js"
import { Tweet } from "../models/tweet.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await Video.exists({_id: videoId}))){
        throw new apiError(404,"Video does not exist")
    }

    const getlike = await Like.findOne({
        video: videoId,
        likedby: userId
    })

    if(getlike){
        await Like.deleteOne({
            _id: getlike._id
        })
    }else{
        await Like.create({
            video: videoId,
            likedby: userId
        })
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                liked: getlike===null
            },
            "The like has been toggled"
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(commentId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await Comment.exists({_id: commentId}))){
        throw new apiError(404,"Comment does not exist")
    }

    const getlike = await Like.findOne({
        comment: commentId,
        likedby: userId
    })

    if(getlike){
        await Like.deleteOne({
            _id: getlike._id
        })
    }else{
        await Like.create({
            comment: commentId,
            likedby: userId
        })
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                liked: getlike===null
            },
            "The like has been toggled"
        )
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await Tweet.exists({_id: tweetId}))){
        throw new apiError(404,"Tweet does not exist")
    }

    const getlike = await Like.findOne({
        tweet: tweetId,
        likedby: userId
    })

    if(getlike){
        await Like.deleteOne({
            _id: getlike._id
        })
    }else{
        await Like.create({
            tweet: tweetId,
            likedby: userId
        })
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                liked: getlike===null
            },
            "The like has been toggled"
        )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const getAllLike = await Like.find({
        likedby: userId,
        video: { $exists: true }
    }).populate("video")

    return res
    .status(200)
    .json(
        new apiResponse(
        200,
        {
            getAllLike
        },
        "All like are shown"
        )
    )
})

const getLikedComments = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const getAllLike = await Like.find({
        likedby: userId,
        comment: { $exists: true }
    }).populate("comment")

    return res
    .status(200)
    .json(
        new apiResponse(
        200,
        {
            getAllLike
        },
        "All like are shown"
        )
    )
})

const getLikedTweets = asyncHandler(async (req, res) => {
    const userId = req.user._id

    const getAllLike = await Like.find({
        likedby: userId,
        tweet: { $exists: true }
    }).populate("tweet")

    return res
    .status(200)
    .json(
        new apiResponse(
        200,
        {
            getAllLike
        },
        "All like are shown"
        )
    )
})

export {toggleCommentLike,toggleTweetLike,toggleVideoLike,getLikedVideos,getLikedComments,getLikedTweets}