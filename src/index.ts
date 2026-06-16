import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "node:path";
import authRoutes from "./routes/auth.route";
import homeRoutes from "./routes/video.route";


//loaded env variables
dotenv.config();


const app=express();
const PORT=process.env.PORT || 5000;
const _dirname=path.resolve();


app.use(cors({origin:"http://localhost:5173",credentials:true}));

//Middleware to parse Json and Cookie
app.use(express.json());
app.use(cookieParser());

//routes for authentication , all under "api/auth"
app.use("/api/auth",authRoutes);
app.use("/",homeRoutes)

//start
app.listen(PORT,()=>{
    console.log(`app listining on port ${PORT}`);
})






















// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import {json, promise, z} from "zod";
// import jwt  from "jsonwebtoken"
// import { prisma } from "./db/db.js";
// import bcrypt from "bcrypt"
// import { auth } from "./middleware.js";
// import { supabase } from "./lib/supabase.js";
// import { optionalAuth } from "./middleware/optionalAuth.js";
// import { connect } from "node:http2";



// const app=express();
// app.use(express.json());
// app.use(cors());
// dotenv.config();

// const JWT_SECRET=process.env.JWT_SECRET || "YOUR_SECRET_KEY" ;

// //validationSchema
// const signupSchema=z.object({
//     username:z.string().min(3),
//     password:z.string().min(3),
//     gender:z.enum(["Male","Female","Other"]),
//     channelName:z.string().min(1)
// })

// //const commentSchema
// const commentSchema=z.object({
//     content:z.string().max(200),
//     parentId:z.string().optional()
// })

// const signinSchema=z.object({
//     username:z.string(),
//     password:z.string()
// })



// const subscriberSchema=z.object({
//     channelOwnerId:z.string()
// })

// //Auth
// app.post("/api/signup",async(req,res)=>{
//     const parsed=signupSchema.safeParse(req.body);
//     if(!parsed.success) {res.status(400).json({ error:parsed.error.message}); return}

//     const {username,password,channelName,gender}=parsed.data;

//     const existing=await prisma.user.findFirst({where:{username}});
//     if(existing) {res.status(409).json({ error:"Username already taken"}); return};

//     const hashedPassword=await bcrypt.hash(password,10);
//     const user=await prisma.user.create({
//         data:{username,password:hashedPassword,channelName,gender}
//     })
//     const token= jwt.sign({userId:user.id},JWT_SECRET);
//     res.status(201).json({token,userid:user.id})
// })

// app.post("/api/signin", async(req,res)=>{

//     const parsed=signinSchema.safeParse(req.body);
//     if(!parsed.success) {res.status(400).json({error:parsed.error.message});return};

//     const {username,password}=parsed.data;

//     //check user is exist
//     const user=await prisma.user.findFirst({where:{username}});
//     if(!user){res.status(401).json({error:"Invalid Credentials"}); return}

//     //compare password
//     const valid= await bcrypt.compare(password,user.password);
//     if(!valid) {res.status(401).json({error:"Invalid Credentials"}); return}

//     const token=jwt.sign({userId:user.id},JWT_SECRET);
//     res.status(201).json({token,userId:user.id});
// })

// //get all videos
// app.get("/api/videos", async(req,res)=>{
//     const videos=await prisma.uploads.findMany({
//         include:{ user :{select:{username:true,channelName:true,profilePicture:true}}}, //using include so only this will see on res not all things 
//         orderBy:{createdAt:"desc"}
//     })
//     res.json(videos);
// })

// //route for search
// app.get("/api/videos/search",async(req,res)=>{
//     const { q }=req.query;
//     const videos=await prisma.uploads.findMany({
//         where:{
//             title:{
//                 contains:`${q}`,
//                 mode:"insensitive"
//             }
//         }
//     })

//     res.json(videos);
// })


// //get specific video from id
// app.get("/api/videos/:id",optionalAuth,async(req,res)=>{

//     let isSubscribed=false;

//     const video=await prisma.uploads.findUnique({
//         where:{id:req.params.id as string},
//         include:{
//             user:{select:{id:true,channelName:true,profilePicture:true,subscriberCount:true,}},
//             like:true
//         }
//     })

//     if(!video) {res.status(404).json({error:"Video not found"}); return};

   
    
//     if(req.userId && video){
//         const existing=await prisma.subscription.findUnique({
//             where:{
//                 subscriberId_channelOwnerId:{
//                     subscriberId:req.userId,
//                     channelOwnerId:video?.user.id
//                 }
//             }
            
//         })
//         if(existing){
//             isSubscribed=true
//         }
//         else{
//             isSubscribed=false
//         }
//     }

    
//     res.json({
//         video,
//         isSubscribed
//     });
// })

// //upload
// app.post("/api/videos",auth,async(req,res)=>{
//     const userId=req.userId;
//     if(!userId) {res.status(404).json({error:"Unauthorized"});return};
    

//     const parsed=uploadSchema.safeParse(req.body);
//     if(!parsed.success) {res.status(400).json({e:parsed.error.message}); return};

//     const video=await prisma.uploads.create({
//         data:{...parsed.data,userId}
//     })
//     res.status(200).json(video)
// })

// //presigned Url
// app.post("/getpresignedUrl", async (req, res) => {
//     const filePath=`videos/${Date.now()}.mp4`;

//         const { data, error } = await supabase.storage
//             .from("youtube-clone")
//             .createSignedUploadUrl(filePath);
 
//         if (error) {
//             return res.status(400).json(error);
//         }

//         const publicUrl=`${process.env.SUPABASE_URL}/storage/v1/object/public/youtube-clone/${filePath}`

//         return res.json({
//             signedUrl:data.signedUrl,
//             pathName:data.path,
//             publicUrl:publicUrl
//         });
// });

// //delete Route
// app.post("/api/videos/:id",auth,async(req,res)=>{
//     const userId=req.userId;
//     if(!userId){ res.status(404).json("Unauthorized");return};

//     const video=await prisma.uploads.findUnique({where:{id:req.params.id as string}});
//     if(!video){ res.status(404).json(" Video Not Found");return};
//     if(video.userId !== userId){ res.status(404).json("Forbidden");return};

//     await prisma.uploads.delete({where:{id:req.params.id as string}});
    
//     res.status(200).json({message:"Video Deleted"})
// });

// app.get("/channel/:username",async(req,res)=>{
//     const videoDetails=await prisma.user.findFirst({
//         where:{
//             username:req.params.username
//         },
//         select:{
//             id:true,
//             profilePicture:true,
//             banner:true,
//             channelName:true,
//             subscriberCount:true
//         }
//     })

//     if(!videoDetails){
//         res.status(404).json({message:"channel not found"}); return;
//     }

//     const uploads=await prisma.uploads.findMany({
//         where:{
//             userId:videoDetails?.id
//         }
//     })

//     res.json({uploads,videoDetails})
// })

// //subscribe route
// app.post("/api/videos/:id/subscribe",auth,async(req,res)=>{
//     const userId=req.userId;
//     const parsed =subscriberSchema.safeParse(req.body);
//     if(!parsed.success) {res.status(400).json({error:parsed.error.message});return};

//     const {channelOwnerId}=parsed.data;

//     const data=await prisma.subscription.create({
//         data:{
//             subscriberId:userId!,
//             channelOwnerId:channelOwnerId
//         }
//     })

//     res.json({"video":data,"isSubscribed":true});
// })

// //comment route
// app.get("/api/videos/:id/comments",async(req,res)=>{
//     const comments=await prisma.comment.findMany({
//         where:{
//             videoId:req.params.id
//         },
//         include:{
//             user:{
//                 select:{
//                     profilePicture:true,
//                     channelName:true
//                 }
//             },
//             replies:{
//                 include:{
//                     user:{
//                         select:{
//                         profilePicture:true,
//                         channelName:true
//                     }
//                     }
//                 }
//             }
//         },orderBy:{
//             createdAt:"desc"
//         }
//         })
//    res.json(comments);
// })

// //post comment route
// app.post("/api/videos/:id/comment",auth,async(req,res)=>{
//     const userId=req.userId;
//     if(!userId) {res.status(401).json({message:"Unauthorized"}); return};

//     const parsed= commentSchema.safeParse(req.body);
//     if(!parsed.success) {res.status(400).json({error:parsed.error.message}); return};

//     const comments=await prisma.comment.create({
//         data:{
//             content:parsed.data.content,
//             videoId:req.params.id as string,
//             userId:userId,
//             parentId:parsed.data.parentId as string
//         }
//     })

//     res.json(comments)

// })

// app.post("/api/videos/:id/like",auth,async(req,res)=>{
//     const userId=req.userId;
//      if(!userId) {res.status(401).json({message:"Unauthorized"}); return}
//     const videoId=req.params.id as string;
//     if(!videoId) {res.status(401).json({message:"error"}); return}

//     const existingLike=await prisma.like.findUnique({
//         where:{
//             userId_videoId:{
//                 userId:userId,
//                 videoId:videoId
//             }
//         }
//     })

//     if(existingLike){
//         return res.status(409).json({
//             message:"Already Liked"
//         });
//     }

//     await prisma.like.create({
//        data:{ 
//         userId:userId,
//         videoId:videoId
//     }
//     })

//     res.status(200).json({
//             message:"Video liKED"
//         })
    
// })

// app.post("/api/videos/:id/watched",auth,async(req,res)=>{
//     const userId=req.userId;
//     const videoId=req.params.id as string;
//     if(!userId) {res.status(401).json({message:"Unauthorized"});return;}

//     const existing=await prisma.history.findUnique({
//         where:{
//             userId_videoId:{
//                 userId,
//                 videoId
//             }
//         }
//     })

//     if(existing){
//         await prisma.history.update({
//             where:{
//                 userId_videoId:{
//                     userId,
//                     videoId
//                 }
//             },
//             data:{
//                 watchedAt: new Date()
//                 }
//         })
//     }else{
//        await prisma.$transaction([
//          prisma.history.create({
//             data:{
//                 userId,
//                 videoId
//             }
//         }),

//          prisma.uploads.update({
//             where:{
//                 id:videoId
//             },data:{
//                 views:{
//                     increment:1
//                 }
//             }
//         })
//        ])
//     }

// res.status(200).json({
//     message:"video added to watched table"
// })
    

// })

// //playlists routes
// app.post("/api/playlist",auth,async(req,res)=>{
//     const userId=req.userId;
//     if(!userId) {res.status(401).json("Unauthorized");return}
//     const playlists=await prisma.playlist.create({
//         data:{
//             name:req.body.name as string,
//             userId:userId,
//         }
//     })

//     res.status(200).json(playlists);
// })

// app.post("/api/playlist/:playlistId/videos",auth,async(req,res)=>{
//     const userId=req.userId;
//     const playlistId=req.params.playlistId as string;
    
//     if(!userId) {res.status(401).json("Unauthorized");return}
//     const playlistCheck=await prisma.playlist.findUnique({
//         where:{
//             id:playlistId
//         }
//     })
//     if(!playlistCheck){
//         return res.status(404).json({
//             message:"Playlist not found"
//         })
//     }

//     if(playlistCheck?.userId !== userId){
//         return res.status(403).json({
//             message:"You are not allowed to modify this playlist"
//         })
//     }
//     const playlist=await prisma.playlistVideo.createMany({
//         data:req.body.videoIds.map((videoId:string)=>({
//                 playlistId,
//                 videoId
//             }))
//     })

//     res.status(200).json(playlist);
// })

// app.get("/api/playlists",auth,async(req,res)=>{
//     const userId=req.userId;
//     if(!userId) {res.status(401).json({message:"Unauthorized"});return;}
//     const playlists=await prisma.playlist.findMany({
//         where:{
//             userId:userId
//         },
//         select:{
//             video:{
//                 include:{
//                     video:true
//             }}
//         }
//     })

//     res.status(200).json(playlists);
// })
// app.get("/api/playlist/:playlistId/videos",auth,async(req,res)=>{
//     const userId=req.userId;
//     const playlistId=req.params.playlistId as string;
//     if(!userId) {res.status(401).json({message:"Unauthorized"});return;}
//     const playlistsdata=await prisma.playlist.findUnique({
//         where:{
//                 id:playlistId
//         },select:{
//             video:true
//         }
//     })

//     res.status(200).json(playlistsdata);
// })
// //dashboardRoute
// app.get("/api/dashboard",auth,async(req,res)=>{
//     const userId=req.userId;
//     if(!userId) {res.status(401).json({message:"Unauthorized"});return};
//     const [totalViews,totalVideos,totalSubscribers,totalLikes,totalComments,topVideos]=await Promise.all([
       
//         prisma.uploads.aggregate({
//         where:{
//             userId:userId
//         },
//         _sum:{
//             views:true
//         }
//     }),

//     prisma.uploads.count({
//         where:{
//             userId:userId
//         }
//     }),

//     prisma.user.aggregate({
//         where:{
//             id:userId
//         },_sum:{
//             subscriberCount:true
//         }
//     }),

//   prisma.like.count({
//     where:{
//         userId
//     }
//   }),

//   prisma.comment.count({
//     where:{
//         video:{
//             userId
//         }
//     }
//   }),

//   prisma.uploads.findMany({
//     where:{
//         userId
//     },
//     orderBy:{
//         views:"desc"
//     },
//     take:5,
//     select:{
//         id:true,
//         views:true,
//         title:true
//     }
//   })


//     ])
//     res.status(200).json({
//         totalViews:totalViews._sum.views,
//         totalVideos:totalVideos,
//         subscribersCount:totalSubscribers._sum.subscriberCount,
//         totalLikes:totalLikes,
//         totalComments:totalComments,
//         topVideos:topVideos
//     })
// })


    

// app.listen(8000,()=>{
//     console.log("Server is running on Port 8000");
// })


