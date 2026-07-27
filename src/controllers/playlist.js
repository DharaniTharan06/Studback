import mongoose, {isValidObjectId} from "mongoose"
import { Playlist } from "../models/playlist.js"
import { User } from "../models/user.js"
import { Video } from "../models/video.js"
import { apiError } from "../utils/ApiError.js"
import { apiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    const userId = req.user._id

    if(!name || name.trim()===""){
        throw new apiError(400,"Name field empty")
    }
    if(!description || description.trim()===""){
        throw new apiError(400,"Description field empty")
    }

    const newplaylist = await Playlist.create({
        name: name.trim(),
        description: description.trim(),
        owner: userId
    })

    return res
    .status(201)
    .json(
        new apiResponse(
            201,
            {
                createdPlaylist: newplaylist
            },
            "Playlist created successfully"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {     
    const { userId } = req.params

    if(!isValidObjectId(userId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await User.exists({_id: userId}))){
        throw new apiError(404,"User not found")
    }

    const playlist = await Playlist.find({
        owner: userId
    }).sort({ createdAt: -1 })

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                userPlaylists: playlist
            },
            "Playlist got successfully"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid id")
    }

    const playlist = await Playlist.findById(playlistId)
    .populate('owner','username fullname')
    .populate('videos','title thumbnail duration views ispublished')

    if(!playlist){
        throw new apiError(404,"Playlist not found")
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                playlist
            },
            "Playlist got successfully"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await Video.exists({_id: videoId}))){
        throw new apiError(404,"Video not found")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(404,"Playlist not found")
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    if (playlist.videos.some(id => id.equals(videoId))) {
        throw new apiError(409, "Video already exists in playlist")
    }
    
    playlist.videos.push(videoId)
    await playlist.save()

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                playlist
            },
            "Video added to playlist successfully"
        )
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new apiError(400,"Invalid id")
    }
    if(!(await Video.exists({_id: videoId}))){
        throw new apiError(404,"Video not found")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(404,"Playlist not found")
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    const index = playlist.videos.findIndex(id=> id.equals(videoId))
    if(index === -1){
        throw new apiError(400, "Video does not exist in playlist")
    }
    playlist.videos.splice(index,1)
    await playlist.save()
    
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                playlist
            },
            "Video removed from playlist"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid id")
    }
    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(404,"Playlist not found")
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    await playlist.deleteOne()

    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                deleted: true,
                playlistId
            },
            "Playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const userId = req.user._id

    if(!isValidObjectId(playlistId)){
        throw new apiError(400,"Invalid id")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new apiError(404,"Playlist not found")
    }
    if(playlist.owner.toString() !== userId.toString()){
        throw new apiError(403,"Invalid access request")
    }

    const { name, description } = req.body
    if(name === undefined && description === undefined) {
        throw new apiError(400, "No fields provided to update")
    }
    
    if(name !== undefined){
        if(!name || name.trim()===""){
            throw new apiError(400,"Name Field empty")
        }
        playlist.name = name.trim()
    }
    if(description !== undefined){
        if(!description || description.trim()===""){
            throw new apiError(400,"Description Field empty")
        }
        playlist.description = description.trim()
    }

    await playlist.save()
    
    return res
    .status(200)
    .json(
        new apiResponse(
            200,
            {
                playlist
            },
            "Details updated successfully"
        )
    )
})

export {createPlaylist,getUserPlaylists,getPlaylistById,addVideoToPlaylist,removeVideoFromPlaylist,deletePlaylist,updatePlaylist}