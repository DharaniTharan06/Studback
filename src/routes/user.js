import {Router} from "express"
import registeruser from "../controllers/user.js"

const router = Router()

//here the route have the prefix /api/v1/users and we add route to this url
router.route("/register").post(registeruser) // this give /api/v1/users/register and in this url we have register logic

export default router