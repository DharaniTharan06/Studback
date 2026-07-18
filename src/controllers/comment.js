import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.js"
import { Video } from "../models/video.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    let { page=1,limit=10} = req.query
    page = Number(page) || 1
    limit = Number(limit) || 10

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"The videoid is invalid")
    }
    if(!(await Video.exists({_id: videoId}))){
        throw new apiError(404,"Video not found")
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
                foreignField: "_id",
                localField: "owner",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                content: 1,
                video: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: {
                    _id: "$owner._id",
                    username: "$owner.username",
                    fullname: "$owner.fullname"
                }
            }
        }
    ])
    const options = {
        page,
        limit
    }
    const comments = await Comment.aggregatePaginate(aggregate, options)

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                comments
            },
            "These are all the comments"
        )
    )
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"The videoid is invalid")
    }
    if(!(await Video.exists({_id: videoId}))){
        throw new apiError(404,"Video not found")
    }

    const { content } = req.body
    if(!content || content.trim()===""){
        throw new apiError(400,"Field empty")
    }

    const createdcomment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: userId
    })

    return res
    .status(201)
    .json(
        new apiResponse(
            201,
            {
                createdcomment
            },
            "Comment created"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id
    if(!isValidObjectId(commentId)){
        throw new apiError(400,"The commentid is invalid")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new apiError(404,"Comment not found")
    }
    if(comment.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    const { content } = req.body
    if(!content || content.trim()===""){
        throw new apiError(400,"Field empty")
    }

    comment.content = content.trim()
    const updatedcomment = await comment.save()

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                updatedcomment
            },
            "Comment updated"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user._id
    if(!isValidObjectId(commentId)){
        throw new apiError(400,"The commentid is invalid")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new apiError(404,"Comment not found")
    }
    if(comment.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    const deletedcomment = await comment.deleteOne()

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                commentId,
                deleted: deletedcomment.deletedCount === 1
            },
            "Comment deleted"
        )
    )
})

export {getVideoComments, addComment, updateComment,deleteComment}