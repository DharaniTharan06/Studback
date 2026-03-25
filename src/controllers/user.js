import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.js"
import { uploadtocloud } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registeruser = asyncHandler(async(req,res)=>{

    const {fullname , email , username , password} = req.body
    console.log(`email : ${email}`);
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
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

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

export default registeruser