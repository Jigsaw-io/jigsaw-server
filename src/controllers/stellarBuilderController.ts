import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
import { jigsawGateway } from "../constants/api";
import { time } from "cron";
const jwt = require('jsonwebtoken');

export namespace knowledgeController {
    export class KnowledgeData {
        public async FindKnowledge(req: Request, res: Response, next: NextFunction) {


            try {

                    return res.status(200).json({ knowledge: [] });
                

            } catch (err) {
                return res.status(400).json({ err: "Knowledge retrieval failed" });
            }




        }
  


    }


}