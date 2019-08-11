import { Router, Request, Response, NextFunction } from "express";
import { userRouter } from "./userAPI";
import { articleRouter } from "./articleAPI";

import { auth } from '../middleware/auth';
import firebase from "../firebase/fireConnection";
import { StellarRouter } from "./stellarBuilderAPI";

var jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");
const regLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000 // limit each IP to 100 requests per windowMs
});

// //  apply to all requests
// app.use(limiter);
const router: Router = Router();

router.use("/user", userRouter);
router.use("/article", regLimiter, articleRouter);
router.use("/stellar", regLimiter, StellarRouter);

router.post("/token", regLimiter, (req, res, next) => {

    if (req.headers.authorization) {
        const lol = req.headers.authorization;
        const token: string[] = lol.split(" ");

        jwt.verify(token[1], process.env.SECRET, async (err: any, decodedToken: any) => {
            if (err || !decodedToken) {
                return res.status(403).json({ err: "Authentication failed" });
            } else {
                const snapshot = await firebase.database().ref(`users/${decodedToken.emailHash}`).once('value');
                if (snapshot.val() != null) {
                    let tokenBody = snapshot.val()
                    tokenBody.exp = Math.floor(new Date().getTime() / 1000.0) + 6000
                    var token = jwt.sign(tokenBody, process.env.SECRET);
                    return res.status(200).json({ token: token });
                }
            }
        });
    } else {
        return res.status(400).json({ err: "The Authorization token is not found" });
    }

});


export { router };

