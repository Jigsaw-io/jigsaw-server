var jwt = require('jsonwebtoken');
import { Router, Request, Response, NextFunction } from "express";


export function auth(req: Request, res: Response, next: NextFunction) {

    if (req.headers.authorization) {
        const lol = req.headers.authorization;
        const token: string[] = lol.split(" ");
        jwt.verify(token[1], process.env.SECRET, (err: any, decodedToken: string) => {
            if (err || !decodedToken) {
                return res.status(403).json({ err: "Authentication failed" });
            } else {
                next();
            }
        });
    } else {
        return res.status(400).json({ err: "The Authorization token is not found" });
    }

}
