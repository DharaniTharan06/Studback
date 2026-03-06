import {Router} from "express"
import registeruser from "../controllers/user.js"
import {upload} from "../middlewares/multer.js"

const router = Router()

//here the route have the prefix /api/v1/users and we add route to this url
router.route("/register").post(
    upload.fields([ //This is the middle ware which is added before the controller
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name:"coverImage",
            maxCount: 3
        }
    ]),
    registeruser
) // this give /api/v1/users/register and in this url we have register logic

export default router