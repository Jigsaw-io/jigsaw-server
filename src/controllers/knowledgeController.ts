import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
import { jigsawGateway } from "../constants/api";
import { time } from "cron";
const jwt = require('jsonwebtoken');


var obj: any = {
    123: {
        id: "123",
        title: "hello",
        draft: "jello"
    }, 1234: {
        id: "1234",
        title: "hello",
        draft: "jello"
    }, 12345: {
        id: "12345",
        title: "hello",
        draft: "jello"
    }, 123456: {
        id: "123456",
        title: "hello",
        draft: "jello"
    }, 1234567: {
        id: "1234567",
        title: "hello",
        draft: "jello"
    }, 12345678: {
        id: "12345678",
        title: "hello",
        draft: "jello"
    }, 123456789: {
        id: "123456789",
        title: "hello",
        draft: "jello"
    }

}
export namespace knowledgeController {
    export class KnowledgeData {
        public async FindKnowledge(req: Request, res: Response, next: NextFunction) {


            try {


                const snapshot = await firebase.database().ref(`knowledge`)
                    .once('value');

                if (snapshot.val() != null) {
                    const lol = (snapshot.val());
                var arr = [];
                for (var key in lol) {
                    lol[key].id = key

                    arr.push(
                        {
                            id: key,
                            title: lol[key].data.title,
                            cover:lol[key].data.cover
                        }
                    );
                }

                // var arr = [];
                // for (var key in obj) {
                //     obj[key].id = key

                //     arr.push(
                //         {
                //             id: key,
                //             title: obj[key].title,
                //             draft: obj[key].draft
                //         }
                //     );
                // }


                return res.status(200).json({ knowledge: arr });
                } else {
                return res.status(201).json({ err: "No Knowledge in the system" });

                }

            } catch (err) {
                return res.status(400).json({ err: "Knowledge retrieval failed" });
            }




        }


        public async GetKnowledge(req: Request, res: Response, next: NextFunction) {


            try {


                const snapshot = await firebase.database().ref(`knowledge/${req.params.id}`)
                    .once('value');

                if (snapshot.val() != null) {
                    const lol = (snapshot.val());


                return res.status(200).json({ knowledge: lol.data });

                // return res.status(200).json({ knowledge: obj[req.params.id] });
                } else {
                    return res.status(201).json({ err: "No Knowledge in the system" });

                }

            } catch (err) {
                return res.status(400).json({ err: "Knowledge retrieval failed" });
            }




        }

        public async CreateKnowledge(req: Request, res: Response, next: NextFunction) {

            // console.log(req)
            try {
                firebase.database().ref(`knowledge/${req.body.hash}`)
                    .set(req.body, (err) => {
                        if (!err) {

                            return res.status(200).json({ status: "success" });
                        } else {
                            return res.status(201).json({ err: "knowledge genesis failed db on fire" });

                        }
                    })

                // const response = await axios.post(`${jigsawGateway}/api/transactions/genesis`, { xdr: req.body.xdr });
                // if (response != null) {

                // } else {

                // }

            } catch (error) {
                console.log("all broken")
                return res.status(400).json({ err: "knowledge genesis failed" });

            }



        }
        public async AddKnowledge(req: Request, res: Response, next: NextFunction) {

            // console.log(req)
            try {
                const snapshot = await firebase.database().ref(`users/${req.body.emailHash}`)
                    .once('value');

                if (snapshot.val() != null) {
                    return res.status(203).json({ err: "account already exists" });
                } else {

                }
            } catch (error) {
                console.log("all broken")
                return res.status(400).json({ err: "registration failed" });

            }



        }



    }


}