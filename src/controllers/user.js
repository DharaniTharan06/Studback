import { apiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import {User} from "../models/user.js"

const registeruser = asyncHandler(async(req,res)=>{

    const {fullName , email , username , password} = req.body
    console.log(`email : ${email}`);

    if(
        [fullName , email , username , password].some((field)=>
        field?.trim === "")
    ){
        throw new apiError(400,"Field Empty")
    } 

    const existedUser = User.findOne({
        $or: [{ username } ,{ email } ]
    })

    if(existedUser){
        throw new apiError(409, "User already Exists")
    }
        
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverimage[0]?.path;

    res.status(200).json({
        message: "First testing of postman"
    })
})

export default registeruser