
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

userRouter.post("/loginWithSecret", (req: Request, res: Response, next: NextFunction) => {

    const controller = new userController.UserData;
    controller.GetUserBySecret(req, res, next);
});


userRouter.post("/decrypt", (req: Request, res: Response, next: NextFunction) => {

    const controller = new userController.UserData;
    controller.DecryptSecret(req, res, next);
});

userRouter.post("/pushToken", (req: Request, res: Response, next: NextFunction) => {

    const controller = new userController.UserData;
    controller.UpdateUserPushToken(req, res, next);
});

userRouter.post("/sendMessage", (req: Request, res: Response, next: NextFunction) => {

    const controller = new userController.UserData;
    controller.SendTransferMessage(req, res, next);
});

userRouter.get("/getAllPublicKeys", (req: Request, res: Response, next: NextFunction) => {

    const controller = new userController.UserData;
    controller.GetAllPublicKeys(req, res, next);
});
export { userRouter };





