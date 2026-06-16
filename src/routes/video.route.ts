import { Router } from "express";
import { auth, optionalAuth } from "../middleware/auth";
import { deleteVideo, getallvideos, getVideoById, likeVideo, searchVideos, uploadVideo, watchVideo } from "../controllers/video.controller";

const router=Router();

//get all videos
router.get("/",getallvideos);

//get specific video
router.get("/:id",optionalAuth,getVideoById);

//get search video
router.get("/search",searchVideos);


export default router;




