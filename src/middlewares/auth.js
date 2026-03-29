import { apiError } from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import { User } from "../models/user";
import jwt from "jsonwebtoken"

export const verifyjwt = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.accesstoken || 
        req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new apiError(401,"Unauthorized request")
        }
    
        const orgtoken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(orgtoken?._id).select(
            "-password -refreshtoken"
        )
    
        if(!user){
            throw new apiError(401,"AccessToken is Invalid")
        }
    
        req.user = user
        next()
    } catch (err) {
        throw new apiError(401,err?.message || "Invalid AccessToken")
    }
})