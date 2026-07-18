import mongoose, {isValidObjectId} from "mongoose"
import { Video } from "../models/video.js"
import { User } from "../models/user.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadtocloud } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid id")
    }

    const video = await Video.findById(videoId)
    .populate("owner","username")
    if(!video){
        throw new apiError(404,"Video not found")
    }

    return res
    .status(200)
    .json(new apiResponse(
        200,
        {
            video
        },
        "Video has been retrieved successfully"
    ))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id
    
    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invaid id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new apiError(404,"Video not found")
    }
    if(video.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    const { title, description } = req.body
    if(title === undefined && description === undefined && !req.file) {
        throw new apiError(400, "No fields provided to update")
    }

    if(title !== undefined){
        if(!title || title.trim()===""){
            throw new apiError(400,"Title Field empty")
        }
        video.title = title.trim()
    }
    if(description !== undefined){
        if(!description || description.trim()===""){
            throw new apiError(400,"Description Field empty")
        }
        video.description = description.trim()
    }
    
    if(req.file){
        const thumbnailLocalPath = req.file.path
        if(!thumbnailLocalPath){
            throw new apiError(400,"Thumbnail file is missing")
        }

        const thumbnail = await uploadtocloud(thumbnailLocalPath)
        if(!thumbnail || !thumbnail.url){
            throw new apiError(400,"Thumbnail upload failed")
        }
        video.thumbnail = thumbnail.url
    }

    await video.save()

    return res
    .status(200)
    .json(new apiResponse(
        200,
        {
            video
        },
        "Details updated successfully"
    ))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invalid id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new apiError(404,"Video not found")
    }
    if(video.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }
    await video.deleteOne()

    return res
    .status(200)
    .json(new apiResponse(
        200,
        {
            deleted: true,
            videoId
        },
        "Video successfully deleted"
    ))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new apiError(400,"Invaild id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new apiError(404,"Video not found")
    }
    if(video.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    video.ispublished = !video.ispublished
    await video.save()

    return res
    .status(200)
    .json(new apiResponse(
        200,
        {  
            ispublished: video.ispublished
        },
        "Status toggled"
    ))
})

export {getAllVideos,publishAVideo,getVideoById,updateVideo,deleteVideo,togglePublishStatus}