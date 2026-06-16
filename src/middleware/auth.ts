import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { error } from "node:console";


export const auth=(req:Request,res:Response,next:NextFunction)=>{
    const token=req.cookies.token;

    if(!token) {(res.status(404).json({error:"Unauthorized- No token Provided"}));return};

    try {
        const payload=jwt.verify(token,process.env.JWT_SECRET!) as {userId:string};

        req.userId = payload.userId;

        next();

    } catch (e){
        console.log("Error in verifyTOken",e);
        return res.status(500).json({
            success:false,
            message:"server Error"
        });
    }
}



export const optionalAuth= (req:Request,res:Response,next:NextFunction) =>{
    const token=req.cookies.token;

    if(!token){
        return next();
    }

    try {
        const payload=jwt.verify(token,process.env.JWT_SECRET!) as {userId:string};

        req.userId=payload.userId;
        
    } catch (error) {
        //ignoring invalid token
    }
    next();
}
