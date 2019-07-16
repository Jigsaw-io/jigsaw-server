
import { knowledgeController } from "../controllers/knowledgeController";
import { Router, Request, Response, NextFunction } from "express";
import axios from 'axios';
import { auth } from '../middleware/auth';


const articleRouter: Router = Router();

articleRouter.post("/create",auth, (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.CreateKnowledge(req, res, next);

});

articleRouter.post("/add", auth,(req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.AddKnowledge(req, res, next);
});

articleRouter.get("/find", (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.FindKnowledge(req, res, next);
});


articleRouter.get("/get/:id", (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.GetKnowledge(req, res, next);
});
export { articleRouter };





