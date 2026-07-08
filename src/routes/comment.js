import { Router } from 'express';
import { addComment, deleteComment, getVideoComments, updateComment } from "../controllers/comment.js"
import { verifyjwt } from "../middlewares/auth.js"

const router = Router();
router.use(verifyjwt); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:commentId")
    .delete(
        deleteComment
    )
    .patch(
        updateComment
    );
    
router.route("/:videoId")
    .get(
        getVideoComments
    )
    .post(
        addComment
    );


export default router