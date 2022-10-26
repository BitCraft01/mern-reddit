import express from "express"
import PostsCtrl from "./posts.controller.js"
import CommentsCtrl from "./comments.controller.js"

const router = express.Router()

router.route("/").get(PostsCtrl.apiGetPosts)
router.route("/id/:id").get(PostsCtrl.apiGetPostById)
router.route("/cuisines").get(PostsCtrl.apiGetPostCuisines)



router
.route("/comment")
.post(CommentsCtrl.apiPostComment)
.put(CommentsCtrl.apiUpdateComment)
.delete(CommentsCtrl.apiDeleteComment)

export default router