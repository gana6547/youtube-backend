import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"

export function auth(req:Request,res:Response,next:NextFunction){
    const auth=req.headers.authorization;
    if(!auth?.startsWith("Bearer ") || !auth) {(res.status(404).json({error:"Unauthorized"}));return};

    try {
        const payload=jwt.verify(auth.slice(7),process.env.JWT_SECRET!) as {userId:string};
        req.userId = payload.userId;
        next();
    } catch (e){
        return res.status(401).json({error:e});
    }
}