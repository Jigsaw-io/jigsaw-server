
import { knowledgeController } from "../controllers/knowledgeController";
import { Router, Request, Response, NextFunction } from "express";
import axios from 'axios';
import { auth } from '../middleware/auth';


const articleRouter: Router = Router();

articleRouter.post("/create",auth, (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.CreateKnowledge(req, res, next);

});



articleRouter.get("/find", (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.FindKnowledge(req, res, next);
});

articleRouter.get("/getList", (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.GetKnowledgeList(req, res, next);
});

articleRouter.get("/get/:id", (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.GetKnowledge(req, res, next);
});

articleRouter.post("/contribute", auth,(req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.AddContribution(req, res, next);
});

articleRouter.post("/vote", auth,(req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.AddVoteForContribution(req, res, next);
});
articleRouter.get("/getContributions/:id", (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.GetContribution(req, res, next);
});

articleRouter.get("/distributeAssets/:id", (req: Request, res: Response, next: NextFunction) => {

    const controller = new knowledgeController.KnowledgeData;
    controller.DistributeAssets(req, res, next);
});


export { articleRouter };





