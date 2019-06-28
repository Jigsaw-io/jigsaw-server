
import { userController } from "../controllers/userController";
import { Router, Request, Response, NextFunction } from "express";
import axios from 'axios';
import { auth } from '../middleware/auth';


const userRouter: Router = Router();

userRouter.post("/add", (req: Request, res: Response, next: NextFunction) => {

    const controller = new userController.UserData;
    controller.AddUser(req, res, next);

});

userRouter.post("/login", (req: Request, res: Response, next: NextFunction) => {

    const controller = new userController.UserData;
    controller.GetUser(req, res, next);
});


export { userRouter };





