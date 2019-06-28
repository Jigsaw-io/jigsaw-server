import { Router, Request, Response, NextFunction } from "express";
import { userRouter } from "./userAPI";
import { auth } from '../middleware/auth';

var jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");
const regLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000 // limit each IP to 100 requests per windowMs
});
// //  apply to all requests
// app.use(limiter);
const router: Router = Router();

router.use("/user", regLimiter, userRouter);
router.use("/user", regLimiter, userRouter);
router.use("/user", regLimiter, userRouter);


router.post("/token", regLimiter, (req, res, next) => {

    if (req.headers.authorization) {
        const lol = req.headers.authorization;
        const token: string[] = lol.split(" ");

        jwt.verify(token[1], process.env.SECRET, (err: any, decodedToken: any) => {
            if (err || !decodedToken) {
                //   logger.info("Authentication failed");
                //console.log("3")

                return res.status(403).json({ err: "Authentication failed" });
            } else {

                            const tokenStuff = {
                                email: data.Item.email,
                                phoneNumber: data.Item.phoneNumber,
                                username: data.Item.username,
                                isRegistered: data.Item.isRegistered,
                                // publicKey: data.Item.publicKey,
                                isSelected: isSelected
                            };
                            var token = jwt.sign(tokenStuff, process.env.SECRET);
                            // //console.log(token)
                            res.send({ token: token });
                        
            }

        });
    } else {
        return res.status(400).json({ err: "The Authorization token is not found" });
    }

});
router.post("/tokenTest", regLimiter, (req, res, next) => {
    if (req.body) {
        if (req.body.appName && req.body.exp) {
            res.statusCode = 200;
            const tokenStuff = {
                appName: req.body.appName,
                exp: req.body.exp
            };
            var token = jwt.sign(tokenStuff, process.env.SECRET);
            // //console.log(token)
            res.send({ token: token });

        } else {
            res.statusCode = 400;
            res.send({ status: "appName and exp are not present" });
        }
    } else {
        res.statusCode = 400;
        res.send({ status: "Request body is not present" });
    }
});


export { router };

