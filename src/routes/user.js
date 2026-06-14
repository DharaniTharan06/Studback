import {Router} from "express"
import {changecurrentpassword, getcurruser, getuserchannelProfile, getwatchhistory, loginuser, logoutuser, refreshAccessToken, 
    registeruser, updateAccountDetails, updateuseravatar, updateusercoverimage} from "../controllers/user.js"
import {upload} from "../middlewares/multer.js"
import {verifyjwt} from "../middlewares/auth.js"

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

router.route("/login").post(
    loginuser
)

//Secured routes
router.route("/logout").post(
    verifyjwt,
    logoutuser
)

router.route("/refresh-token").post(
    refreshAccessToken
)

router.route("/change-pwd").post(
    verifyjwt,
    changecurrentpassword
)

router.route("/current-user").get(
    verifyjwt,
    getcurruser
)

router.route("/update/details").patch(
    verifyjwt,
    updateAccountDetails
)

router.route("/update/avatar").patch(
    verifyjwt,
    upload.single("avatar"),
    updateuseravatar
)

router.route("/update/cover-image").patch(
    verifyjwt,
    upload.single("coverimage"),
    updateusercoverimage
)
//Here we can also use route("/c") and use query option that if like /c?username=dharani and use req.query to get username
router.route("/c/:username").get( //Here we have : which specifies that it is the params 
    verifyjwt,
    getuserchannelProfile
)

router.route("/history").get(
    verifyjwt,
    getwatchhistory
)
export default router