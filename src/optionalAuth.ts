import { NextFunction, Request,Response } from "express";
import jwt from "jsonwebtoken"

export function optionalAuth (req:Request,res:Response,next:NextFunction) {
    const auth=req.headers.authorization;

    if(!auth?.startsWith("Bearer ")){
        return next();
    }

    try {
        const payload=jwt.verify(auth.slice(7),process.env.JWT_SECRET!) as {userId:string};
        req.userId=payload.userId;
    } catch (error) {
        //ignoring invalid token
    }
    next();
}
