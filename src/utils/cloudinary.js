import {v2} from "cloudinary"
import fs from "fs"

v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API,
    api_secret: process.env.CLOUD_SECRET
});

const uploadtocloud = async (filepath) => {
    try {
        if(!filepath) return null
        const response = await v2.uploader.upload(filepath ,{
            resource_type: "auto"
        })
        console.log("File is uploaded ",response)
        return response
    } catch (err) {
        console.error("Cloudinary Upload Error:", err)
        fs.unlinkSync(filepath);
        throw err; 
    }
} 

export {uploadtocloud}