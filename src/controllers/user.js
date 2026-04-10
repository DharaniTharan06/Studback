import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.js"
import { uploadtocloud } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

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
        
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar is required")
    }

    const avatar = await uploadtocloud(avatarLocalPath)
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

export {registeruser,loginuser,logoutuser}