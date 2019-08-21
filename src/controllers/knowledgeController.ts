import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
import { jigsawGateway } from "../constants/api";
import { time } from "cron";
const jwt = require('jsonwebtoken');
var sortBy = require('sort-by');

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
                                cover: Knowledge[key].data.cover,                                
                                alias: Knowledge[key].alias,
                                publicKey: Knowledge[key].publicKey
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
                    .set(req.body, async (err) => {
                        if (!err) {

                            axios.post(`${jigsawGateway}/api/transactions/genesis`, { xdr: req.body.xdr })
                                .then((response) => {
                                    console.log(response.data)
                                    return res.status(200).json({ status: "success" });
                                })
                                .catch(err => {
                                    console.log(err.message)
                                    return res.status(201).json({ err: "knowledge genesis failed in Gateway" });
                                })
                        } else {
                            return res.status(201).json({ err: "knowledge genesis failed db on fire" });

                        }
                    })



            } catch (error) {
                console.log("all broken")
                return res.status(400).json({ err: "knowledge genesis failed" });

            }



        }
        public async AddContribution(req: Request, res: Response, next: NextFunction) {

            // console.log(req.body.hash)
            var hash = req.body.hash
            try {


                firebase.database().ref(`contribution/${req.body.kId}/${hash}`)
                    .set(req.body, async (err) => {
                        if (!err) {

                            axios.post(`${jigsawGateway}/api/transactions/contribute`, { xdr: req.body.xdr })
                                .then((response) => {
                                    console.log(response)
                                    return res.status(200).json({ status: "success" });
                                })
                                .catch(err => {
                                    console.log(err)
                                    return res.status(201).json({ err: "contribution failed in Gateway" });
                                })

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

                if (Contribution != null) {

                    if (!Contribution[req.params.id]) {
                        return res.status(201).json({ err: "No Knowledge in the system" });

                    } else {
                        var arr = [];
                        for (var key in Contribution[req.params.id]) {
                            (Contribution[req.params.id])[key].id = key

                            arr.push(
                                (Contribution[req.params.id])[key]
                            );

                        }

                        arr.sort(sortBy('timestamp'))
                        return res.status(200).json({ contributions: arr });
                    }


                } else {
                    return res.status(201).json({ err: "No Knowledge in the system" });

                }


            } catch (err) {
                return res.status(400).json({ err: "Knowledge retrieval failed" });
            }




        }

        public async AddVoteForContribution(req: Request, res: Response, next: NextFunction) {

            // console.log(req.body.hash)
            try {

                if (Contribution != null) {

                    console.log(Contribution[req.body.kId])
                    let Cont = null;

                    if (!Contribution[req.body.kId]) {
                        return res.status(201).json({ err: "No Knowledge in the system" });

                    } else {

                        Cont = Contribution[req.body.kId]
                        Cont[req.body.cId].votes++
                        firebase.database().ref(`contribution/${req.body.kId}/${req.body.cId}`)
                            .update(Cont[req.body.cId], async (err) => {
                                if (!err) {

                                    firebase.database().ref(`votes/${req.body.kId}/${req.body.cId}/${req.body.hash}`)
                                        .set(req.body, async (err1) => {
                                            if (!err1) {
                                                axios.post(`${jigsawGateway}/api/transactions/vote`, { xdr: req.body.xdr })
                                                    .then((response) => {
                                                        console.log(response)
                                                        return res.status(200).json({ status: "success" });
                                                    })
                                                    .catch(err2 => {
                                                        console.log(err2)
                                                        return res.status(201).json({ err: "contribution failed in Gateway" });
                                                    })
                                            } else {
                                                return res.status(201).json({ err: "vote failed, db on fire, vote collection" });

                                            }
                                        })



                                } else {
                                    return res.status(201).json({ err: "vote failed, db on fire" });

                                }
                            })
                    }


                } else {
                    return res.status(201).json({ err: "No Knowledge in the system" });

                }

            } catch (error) {
                console.log("all broken")
                return res.status(400).json({ err: "contribution failed" });

            }



        }


    }


}