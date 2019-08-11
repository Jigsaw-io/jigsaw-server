
import { StellarController } from "../controllers/stellarBuilderController";
import { Router, Request, Response, NextFunction } from "express";
import axios from 'axios';
import { auth } from '../middleware/auth';


const StellarRouter: Router = Router();

StellarRouter.post("/signDeal",auth, (req: Request, res: Response, next: NextFunction) => {

    const controller = new StellarController.StellarData;
    controller.SignConversion(req, res, next);

});

export { StellarRouter };





