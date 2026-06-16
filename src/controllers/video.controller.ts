//get all videos

import { Request, Response } from "express";
import { prisma } from "../db/db";
import z from "zod";
import { supabase } from "../lib/supabase";

const uploadSchema=z.object({
    videoUrl:z.url(),
    thubnail:z.url()
})


export const getallvideos=async(req:Request,res:Response)=>{
    const videos=await prisma.uploads.findMany({
        include:{ user :{select:{username:true,channelName:true,profilePicture:true}}}, //using include so only this will see on res not all things 
        orderBy:{createdAt:"desc"}
    })
    res.json(videos);
}

//route for search
export const searchVideos=async(req:Request,res:Response)=>{
    const { q }=req.query;
    const videos=await prisma.uploads.findMany({
        where:{
            title:{
                contains:`${q}`,
                mode:"insensitive"
            }
        }
    })

    res.json(videos);
}


//get specific video from id
export const getVideoById=async(req:Request,res:Response)=>{

    let isSubscribed=false;
    //finde video
    const video=await prisma.uploads.findUnique({
        where:{id:req.params.id as string},
        include:{
            user:{select:{id:true,channelName:true,profilePicture:true,subscriberCount:true,}},
            like:true
        }
    })

    if(!video) {res.status(404).json({error:"Video not found"}); return};

    //see subscribed or not
    if(req.userId && video){
        const existing=await prisma.subscription.findUnique({
            where:{
                subscriberId_channelOwnerId:{
                    subscriberId:req.userId,
                    channelOwnerId:video?.user.id
                }
            }
            
        })
        if(existing){
            isSubscribed=true
        }
        else{
            isSubscribed=false
        }
    }
    
    res.json({
        video,
        isSubscribed
    });
}

//upload
export const uploadVideo=async(req:Request,res:Response)=>{

    const userId=req.userId;
    if(!userId) {res.status(404).json({error:"Unauthorized"});return};
    
    const parsed=uploadSchema.safeParse(req.body);
    if(!parsed.success) {res.status(400).json({e:parsed.error.message}); return};

    const video=await prisma.uploads.create({
        data:{...parsed.data,userId}
    })
    res.status(200).json(video)
}

//presigned Url
export const getpresignedUrl= async (req:Request,res:Response) => {
    const filePath=`videos/${Date.now()}.mp4`;

        const { data, error } = await supabase.storage
            .from("youtube-clone")
            .createSignedUploadUrl(filePath);
 
        if (error) {
            return res.status(400).json(error);
        }

        const publicUrl=`${process.env.SUPABASE_URL}/storage/v1/object/public/youtube-clone/${filePath}`

        return res.json({
            signedUrl:data.signedUrl,
            pathName:data.path,
            publicUrl:publicUrl
        });
};

//delete Route
export const deleteVideo=async(req:Request,res:Response)=>{
    //get userId
    const userId=req.userId;
    if(!userId){ res.status(404).json("Unauthorized");return};
    
    //find video
    const video=await prisma.uploads.findUnique({where:{id:req.params.id as string}});
    if(!video){ res.status(404).json(" Video Not Found");return};

    //check this user is owner of video
    if(video.userId !== userId){ res.status(404).json("Forbidden");return};

    //delete video
    await prisma.uploads.delete({where:{id:req.params.id as string}});
    
    res.status(200).json({message:"Video Deleted"})
};

export const likeVideo= async(req:Request,res:Response)=>{
    //get user
    const userId=req.userId;
     if(!userId) {res.status(401).json({message:"Unauthorized"}); return}
     //get videoId
    const videoId=req.params.id as string;
    if(!videoId) {res.status(401).json({message:"error"}); return}

    //check there is no like before from same user
    const existingLike=await prisma.like.findUnique({
        where:{
            userId_videoId:{
                userId:userId,
                videoId:videoId
            }
        }
    })

    if(existingLike){
        return res.status(409).json({
            message:"Already Liked"
        });
    }

    await prisma.like.create({
       data:{ 
        userId:userId,
        videoId:videoId
    }
    })

    res.status(200).json({
            message:"Video liKED"
        })
    
}

export const watchVideo=async(req:Request,res:Response)=>{
    //get user
    const userId=req.userId;
    const videoId=req.params.id as string;
    if(!userId) {res.status(401).json({message:"Unauthorized"});return;}

    //check video is not already in history table
    const existing=await prisma.history.findUnique({
        where:{
            userId_videoId:{
                userId,
                videoId
            }
        }
    })

    //if exists update watched At
    if(existing){
        await prisma.history.update({
            where:{
                userId_videoId:{
                    userId,
                    videoId
                }
            },
            data:{
                watchedAt: new Date()
                }
        })
    }else{
       await prisma.$transaction([
         prisma.history.create({
            data:{
                userId,
                videoId
            }
        }),

         prisma.uploads.update({
            where:{
                id:videoId
            },data:{
                views:{
                    increment:1
                }
            }
        })
       ])
    }

res.status(200).json({
    message:"video added to watched table"
})
}