import mongoose, {isValidObjectId} from "mongoose"
import { Video } from "../models/video.js"
import { User } from "../models/user.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadtocloud } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType } = req.query

    const allowedSortFields = [
        "createdAt",
        "updatedAt",
        "views",
        "title",
        "duration"
    ]

    page = Number(page) || 1
    limit = Number(limit) || 10

    sortBy = sortBy?.trim() || "createdAt"
    if(!(allowedSortFields.includes(sortBy))){
        sortBy = "createdAt"
    }

    sortType = sortType?.trim() || ''
    sortType = sortType.toLowerCase() === "asc"? 1:-1;

    const pipeline = [
        {
            $match:{
                ispublished: true
            }
        } 
    ] 

    if(query?.trim()){
        pipeline.push({
            $match:{
                $or:[
                    {
                        title:{
                            $regex: query.trim(),
                            $options: "i"
                        }
                    },
                    {
                        description:{
                            $regex: query.trim(),
                            $options: "i"
                        }
                    }
                ]
            }
        })
    }

    pipeline.push({
        $sort:{
            [sortBy]: sortType
        }
    })

    const aggregate = Video.aggregate(pipeline)
    const options = {
        page,
        limit
    }
    const videos = await Video.aggregatePaginate(aggregate,options)

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                video: videos
            },
            "These are all the videos"
        )
    )
})

const publishAVideo = asyncHandler(async (req, res) => {
    let { title, description} = req.body
    const userId = req.user._id

    if(!title || title.trim()===""){
        throw new apiError(400,"Title Field empty")
    }
    if(!description || description.trim()===""){
        throw new apiError(400,"Description Field empty")
    }
    title = title.trim()
    description = description.trim()

    const videoFile = req.files?.videoFile[0]?.path
    if(!videoFile){
        throw new apiError(400,"Video file is missing")
    }
    if (!req.files.videoFile[0].mimetype.startsWith("video/")) {
        throw new apiError(400, "Only video files are allowed");
    }
    
    const video = await uploadtocloud(videoFile)
    if(!video){
        throw new apiError(400,"Video upload failed")
    }

    const thumbnailFile = req.files?.thumbnailFile[0]?.path
    if(!thumbnailFile){
        throw new apiError(400,"Thumbnail file is missing")
    }
    const thumbnail = await uploadtocloud(thumbnailFile)
    if(!thumbnail){
        throw new apiError(400,"Thumbnail upload failed")
    }

    const createdvideo = await Video.create({
        videofile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: userId
    })

    return res
    .status(201)
    .json(
        new apiResponse(
            201,
            {
                video: createdvideo
            },
            "Video published"
        )
    )
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
    if (!video.ispublished && !video.owner._id.equals(req.user._id)) {
        throw new apiError(403, "Video not available")
    }

    if (!video.owner._id.equals(req.user._id)) {
        video.views += 1;
        await video.save();
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
        if(!thumbnail){
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
            video: video
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