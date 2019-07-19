import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
import { jigsawGateway } from "../constants/api";
import { time } from "cron";
const jwt = require('jsonwebtoken');

//global cache for knowledge
var Knowledge: any = null

//subcription to firebase for knowledge updates
firebase.database().ref(`knowledge`)
    .on('value', onKnowledge)

//updating knowledge cache
function onKnowledge(snapshot: any) {
    console.log("Knowledge Cached")
    Knowledge = snapshot.val()
}


//global cache for knowledge
var Contribution: any = null

//subcription to firebase for knowledge updates
firebase.database().ref(`contribution`)
    .on('value', onContribution)

//updating knowledge cache
function onContribution(snapshot: any) {
    console.log("Contribution Cached")
    Contribution = snapshot.val()
}
export namespace knowledgeController {
    export class KnowledgeData {
        public async FindKnowledge(req: Request, res: Response, next: NextFunction) {


            try {

//old data juice
                // const snapshot = await firebase.database().ref(`knowledge`)
                //     .once('value');

                // if (snapshot.val() != null) {
                //     const lol = (snapshot.val());
                //     var arr = [];
                //     for (var key in lol) {
                //         lol[key].id = key

                //         arr.push(
                //             {
                //                 id: key,
                //                 title: lol[key].data.title,
                //                 cover: lol[key].data.cover
                //             }
                //         );
                //     }

                if (Knowledge != null) {
                    var arr = [];
                    for (var key in Knowledge) {
                        Knowledge[key].id = key

                        arr.push(
                            {
                                id: key,
                                title: Knowledge[key].data.title,
                                cover: Knowledge[key].data.cover
                            }
                        );
                    }

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

//old data juice
                // const snapshot = await firebase.database().ref(`knowledge/${req.params.id}`)
                //     .once('value');

                // if (snapshot.val() != null) {
                //     const lol = (snapshot.val());


                //     return res.status(200).json({ knowledge: lol.data });

                //     // return res.status(200).json({ knowledge: obj[req.params.id] });
                // } else {
                //     return res.status(201).json({ err: "No Knowledge in the system" });

                // }


                if (Knowledge != null) {
                    // console.log(Knowledge[req.params.id]);
                    return res.status(200).json({ knowledge: Knowledge[req.params.id].data });

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
        public async AddContribution(req: Request, res: Response, next: NextFunction) {

            // console.log(req)
            try {
                firebase.database().ref(`contribution/${req.body.hash}`)
                    .set(req.body, (err) => {
                        if (!err) {

                            return res.status(200).json({ status: "success" });
                        } else {
                            return res.status(201).json({ err: "contribution failed db on fire" });

                        }
                    })
            } catch (error) {
                console.log("all broken")
                return res.status(400).json({ err: "contribution failed" });

            }



        }
        public async GetContribution(req: Request, res: Response, next: NextFunction) {


            try {


                // const snapshot = await firebase.database().ref(`knowledge/${req.params.id}`)
                //     .once('value');

                // if (snapshot.val() != null) {
                //     const lol = (snapshot.val());


                //     return res.status(200).json({ knowledge: lol.data });

                //     // return res.status(200).json({ knowledge: obj[req.params.id] });
                // } else {
                //     return res.status(201).json({ err: "No Knowledge in the system" });

                // }

                if (Contribution!= null) {

                    return res.status(200).json({ contribution: Contribution[req.params.id] });

                } else {
                    return res.status(201).json({ err: "No Knowledge in the system" });

                }


            } catch (err) {
                return res.status(400).json({ err: "Knowledge retrieval failed" });
            }




        }



    }


}