import { Request, Response } from "express";
import { prisma } from "../db/db";
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";
import z from "zod";
import { generateTokenandsetCookie } from "../utils/generateTokenandSetCookie";

const signupSchema=z.object({
    username:z.string().min(3),
    password:z.string().min(3),
    gender:z.enum(["Male","Female","Other"]),
    channelName:z.string().min(1)
})

const signinSchema=z.object({
    username:z.string(),
    password:z.string()
})


//Auth
export const signup=async(req:Request,res:Response)=>{
    try {
        const parsed=signupSchema.safeParse(req.body);
        if(!parsed.success) {res.status(400).json({ error:parsed.error.message}); return}

        const {username,password,channelName,gender}=parsed.data;

        const existing=await prisma.user.findFirst({where:{username}});
        if(existing) {res.status(400).json({ error:"Username already taken"}); return};

        //hash password
        const hashedPassword=await bcrypt.hash(password,10);

        //create user
        const user=await prisma.user.create({
            data:{username,password:hashedPassword,channelName,gender}
        })

        generateTokenandsetCookie(res,user.id);

        res.status(201).json({
            success:true,
            message:"UserCreated Successfully",
            userid:user.id
        })
    } catch (error) {
        //handle Errors
        return res.status(500).json({
            success:false,
            //@ts-ignore
            message:error.message
        })
        
    }
}

export const signin= async(req:Request,res:Response)=>{

   try {
     const parsed=signinSchema.safeParse(req.body);
        if(!parsed.success) {res.status(400).json({error:parsed.error.message});return};

        const {username,password}=parsed.data;

        //check user is exist
        const user=await prisma.user.findFirst({where:{username}});
        if(!user){res.status(401).json({error:"Invalid Credentials"}); return}

        //compare password
        const valid= await bcrypt.compare(password,user.password);
        if(!valid) {res.status(400).json({error:"Invalid Credentials"}); return}

        //generate token and set cookie
        generateTokenandsetCookie(res,user.id);
        
        res.status(200).json({
            success:true,
            message:"User Signin Successfully",
            userid:user.id
        })
        
   } catch (error) {
    return res.status(500).json({
        success:false,
            //@ts-ignore
        message:error.message
    })
   }
}

//logout
export const logout=async(req:Request,res:Response)=>{
    
    res.clearCookie("token");
    res.status(200).json({
        success:true,
        message:"Logout Successfully"
    });
}



