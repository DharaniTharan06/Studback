import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.js"
import { uploadtocloud } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateTokens = async(userid)=>{
    try {
        const user = await User.findById(userid)
        const accesstoken = user.generateAccessToken()
        const refreshtoken = user.generateRefreshToken()

        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })

        return {accesstoken , refreshtoken}
    } catch (err) {
        throw new apiError(500,"Something went wrong in token generation")
    }
}

const registeruser = asyncHandler(async(req,res)=>{

    const {fullname , email , username , password} = req.body
    if(
        [fullname , email , username , password].some((field)=>
        field?.trim() === "")
    ){
        throw new apiError(400,"Field Empty")
    } 

    const existedUser = await User.findOne({
        $or: [{ username } ,{ email } ]
    })

    if(existedUser){
        throw new apiError(409, "User already Exists")
    }
        
    const coverimagelocalpath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!coverimagelocalpath){
        throw new apiError(400, "Avatar is required")
    }

    const avatar = await uploadtocloud(coverimagelocalpath)
    const coverImage = await uploadtocloud(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const usercreated = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    if(!usercreated){
        throw new apiError(500,"Something went wrong while creating the user")
    }

    return res.status(201).json(
        new apiResponse(200, usercreated, "User registered successfully")
    )

    // res.status(200).json({
    //     message: "First testing of postman"
    // })
})

const loginuser = asyncHandler(async(req,res)=>{

    const {email , username , password} = req.body
    if(!(username || email)){
        throw new apiError(400,"Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new apiError(400,"User not found")
    }

    const checkpwd = await user.isPasswordCorrect (password)
    if(!checkpwd){
        throw new apiError(401,"Invalid password")
    }

    const {accesstoken , refreshtoken} = await generateTokens(user._id)
    const loggedInuser = await User.findById(user._id).select(
        "-password -refreshtoken"
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accesstoken",accesstoken,options)
    .cookie("refreshtoken",refreshtoken,options)
    .json(
        new apiResponse(
            200,
            {
                user: loggedInuser, accesstoken, refreshtoken
            },
            "User has been logged In"
        )
    )
})

const logoutuser = asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshtoken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accesstoken",options)
    .clearCookie("refreshtoken",options)
    .json(
        new apiResponse(
            200,
            {},
            "User Logged Out"
        )
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{

    const incomingresfreshtoken = req.cookies?.refreshtoken || req.body.refreshtoken
    if(!incomingresfreshtoken){
        throw new apiError(401,"Unauthorized request")
    }

    try {
        const decodedtoken = jwt.verify(
            incomingresfreshtoken,
            process.env.ACCESS_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedtoken?._id)
        if(!user){
            throw new apiError(401,"Invalid refresh token")
        }
    
        if(incomingresfreshtoken !== user?.refreshtoken){
            throw new apiError(401,"Refresh is expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
        const {accesstoken , newrefreshtoken} = await generateTokens(user._id)
    
        return res
        .status(200)
        .cookie("accesstoken",accesstoken,options)
        .cookie("refrestoken",newrefreshtoken,options)
        .json(
            new apiResponse(
                200,
                {accesstoken , refreshtoken: newrefreshtoken},
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw new  apiError(401,error?.message || "Invalid refresh Token")
    }
})

const changecurrentpassword = asyncHandler(async(req,res)=>{
    const {oldPassword , newPassword , confirmpassword} = req.body
    if(newPassword !== confirmpassword){
        throw new apiError(401,"Check if the newpassword match")
    }

    const user = await User.findById(req.user?._id)  
    const iscorrect = await user.isPasswordCorrect(oldPassword)

    if(!iscorrect){
        throw new apiError(400,"Invalid old password")
    }


    user.password = newPassword
    await user.save({validateBeforeSave: false})
    
    return res
    .status(200)
    .json(new apiResponse(200,{},"Password changed successfully"))
})

const getcurruser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new apiResponse(200,req.user,"Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname , email } = req.body
    if(!fullname || !email){
        throw new apiError(400,"All fields are required")
    }

    const user = await User.findByIdAndUpdate( req.user?._id,{
        $set:{
            fullname,
            email
        }
    },{
        new: true
    }).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"Account details updated successfully"))
})

const updateuseravatar = asyncHandler(async(req,res)=>{
    const avatarlocalpath = req.file?.path
    if(!avatarlocalpath){
        throw new apiError(400,"Avatar file is missing")
    }

    const avatar = await uploadtocloud(avatarlocalpath)
    if(!avatar.url){
        throw new apiError(400,"Avatar upload failed")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar: avatar.url 
        }
    },{
        new: true //This returns the info of the user after updating
    }).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"Avatar updated successfully"))
})

const updateusercoverimage = asyncHandler(async(req,res)=>{
    const coverimagelocalpath = req.file?.path
    if(!coverimagelocalpath){
        throw new apiError(400,"CoverImage file is missing")
    }

    const coverImage = await uploadtocloud(coverimagelocalpath)
    if(!coverImage.url){
        throw new apiError(400,"CoverImage upload failed")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverimage: coverImage.url 
        }
    },{
        new: true
    }).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200,user,"CoverImage updated successfully"))
})

const getuserchannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new apiError(400, "username is missing")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username: username?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount:{
                    $size: "$subscribers"
                },
                channelsSubscribedToCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverimage: 1,
                email: 1
            }
        }
    ])

    if(!channel?.length){
        throw new apiError(404,"channel does not exists")
    }

    return res
    .status(200)
    .json(
        new apiResponse(200,channel[0],"User channel fetched successfully")
    )
})

export {registeruser,loginuser,logoutuser,refreshAccessToken,changecurrentpassword,getcurruser,
    updateAccountDetails,updateuseravatar,updateusercoverimage,getuserchannelProfile}