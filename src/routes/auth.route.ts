import express from "express";
import {signin,signup,logout} from "../controllers/auth.controller";
import cors from "cors"
import { auth } from "../middleware/auth";
import { deleteVideo, likeVideo, uploadVideo, watchVideo } from "../controllers/video.controller";


const router=express.Router();

router.get("/chech-auth",auth);

router.post("/signup",signup);

router.post("/signin",signin);

router.post("/logout",logout);


//upload video
router.post("/upload",auth,uploadVideo);

//like video
router.get("/:id/like",auth,likeVideo);

//watch video
router.get("/:id/watched",auth,watchVideo);

//delete Route
router.delete("/:id",auth,deleteVideo);

export default router;
