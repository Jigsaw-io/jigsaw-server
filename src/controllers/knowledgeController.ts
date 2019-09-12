import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair, Transaction, Asset, Account } from "stellar-sdk";
import StellarSdk from "stellar-sdk";
import { jigsawGateway } from "../constants/api";
import { time } from "cron";
import * as dotenv from "dotenv";
import { userController } from "./userController";
dotenv.config();

var sequenceNo = "";
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

        public async GetKnowledgeList(req: Request, res: Response, next: NextFunction) {


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


        public async DistributeAssets(req: Request, res: Response, next: NextFunction) {
            try {
                //check for a knowledge the contributors including the creator
                // console.log(req.params.id)


                // arr.sort(sortBy('timestamp'))

                // var canReward = false;
                const knowledgeSnapshot = await firebase.database().ref(`knowledge/${req.params.id}`)
                    .once('value');

                const contributionSnapshot: any = await firebase.database().ref(`contribution/${req.params.id}`)
                    .once('value');

                let value = 0;
                let creator;
                let contributors: any = []
                let voters: any = []
                if (knowledgeSnapshot != null) {
                    value = value + 5;
                    creator = {
                        timestamp: (knowledgeSnapshot.val()).timestamp,
                        publicKey: (knowledgeSnapshot.val()).publicKey,
                        reward: 5
                    }

                    if (contributionSnapshot != null) {

                        for (var key in contributionSnapshot.val()) {

                            contributors.push({
                                timestamp: ((contributionSnapshot.val())[key]).timestamp,
                                publicKey: ((contributionSnapshot.val())[key]).publicKey,
                                reward: 2
                            })
                            value = value + 2;

                            const votesSnapshot: any = await firebase.database().ref(`votes/${req.params.id}/${key}`)
                                .once('value');

                            if (votesSnapshot != null) {
                                for (var key in votesSnapshot.val()) {
                                    voters.push({
                                        timestamp: ((votesSnapshot.val())[key]).timestamp,
                                        publicKey: ((votesSnapshot.val())[key]).publicKey,
                                        reward: 1
                                    })

                                    value = value + 1;
                                }
                            }
                        }
                    }
                    // canReward=true;
                }

                // console.log(voters.length)



                const cryptoAwaiter = await this.CryptoEvaluatorV1(value, creator, contributors, voters)
                if (!cryptoAwaiter.status) {


                    return res.status(400).json({ err: "Rewarding failed" })

                }



                //for each contribution check the votes
                //if a contribution has high votes for the hghest 50% of contributions give the initial 5 voters maximum benefit
                //also give teh contributor maximum benefit

                cryptoAwaiter.data.forEach(async (element: any) => {
                    const rewardAwaiter = await this.Reward(element.publicKey, element.reward)
                    if (rewardAwaiter == null) {

                        return
                        // return res.status(400).json({ err: "Rewarding failed" })

                    }

                    const controller = new userController.UserData;
                    controller.SendRewardMessage(element.publicKey).then((res) => {

                        if (res == null) {
                            return
                        }
                    })


                    // const messagBody = {
                    //     amount:element.reward,
                    //     emailHash:
                    // }
                    // this.RecordMessage(req.body.emailHash, req.body).then((res) => {
                    //     if (res == null) {
                    //         return res.status(202).json({ status: "Error recording message:" });

                    //     }
                    // })

                });


                return res.status(200).json({ rewards: cryptoAwaiter.data });


                // check for a knowledge the contributors including the creator

            } catch (err) {
                return res.status(400).json({ err: "Knowledge retrieval failed" });
            }
        }


        public async CryptoEvaluatorV1(pool: number, creator: any, contributors: any, voters: any) {
            try {
                var rewardList: any = []
                rewardList.push(creator)
                contributors.forEach((element: any) => {
                    rewardList.push(element);
                });

                voters.forEach((element: any) => {
                    rewardList.push(element);
                });

                rewardList.sort(sortBy('timestamp'))

                var result = { status: true, data: rewardList };
                return result
            } catch (error) {
                console.log("all broken")
                var result = { status: false, data: null };
                return result
            }
        }


        public async Reward(DestinationPublicKey: any, Amount: any) {
            try {

                var JIGXKDistributorPublicKey = process.env.JIGXKDISTRIBUTORPUB;
                var JIGXKDistributorSecretKey = process.env.JIGXKDISTRIBUTORSEC;

                console.log("passed 1")
                var JIGXKIssuerPublicKey = "GCSQ475DWPDJAZABG5OHJDZ7OTP2SZQAYP5RHXPRLCCXKWPF3KN2PFAL";
                var keypair = Keypair.fromSecret(JIGXKDistributorSecretKey)

                console.log("passed 2")

                var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');



                let transaction;
                if (sequenceNo != "") {
                    transaction = new StellarSdk.TransactionBuilder(new Account(JIGXKDistributorPublicKey, sequenceNo))
                        .addOperation(StellarSdk.Operation.payment({
                            destination: DestinationPublicKey,
                            asset: new Asset("JIGXK", JIGXKIssuerPublicKey),
                            amount: Amount.toString()
                        }))
                        .build();
                } else {
                    const sourceAccount = await server.loadAccount(JIGXKDistributorPublicKey);
                    if (sourceAccount === null) {
                        return null
                    }

                    transaction = new StellarSdk.TransactionBuilder(sourceAccount)
                        .addOperation(StellarSdk.Operation.payment({
                            destination: DestinationPublicKey,
                            asset: new Asset("JIGXK", JIGXKIssuerPublicKey),
                            amount: Amount.toString()
                        }))
                        .build();
                }
                console.log("passed 3")

                sequenceNo = transaction.sequence.toString()

                // Sign the transaction to prove you are actually the person sending it.
                transaction.sign(keypair);

                const xdr = transaction.toEnvelope().toXDR('base64')
                console.log("\n" + xdr)
                // And finally, send it off to Stellar!
                const transactionResponse = await server.submitTransaction(transaction);
                if (transactionResponse === null) {
                    return null
                }

                console.log("passed 4")


                return true
            } catch (error) {
                console.log("all broken")
                return null
            }
        }



    }




}