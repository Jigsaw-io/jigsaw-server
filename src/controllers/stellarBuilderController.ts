import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair, Transaction } from "stellar-sdk";
import StellarSdk from "stellar-sdk";

import { jigsawGateway } from "../constants/api";
import { time } from "cron";
import * as dotenv from "dotenv";
dotenv.config();
StellarSdk.Network.useTestNetwork();
var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');


function signXDR(XDR: string) {
    return new Promise((resolve, reject) => {
        // console.log(process.env.JIGXUDISTRIBUTORSEC)
        var sourceKeypair = Keypair.fromSecret(process.env.JIGXUDISTRIBUTORSEC);
        const parsedTx = new Transaction(XDR)
        parsedTx.sign(sourceKeypair)
        // let x = parsedTx.toEnvelope().toXDR().toString('base64')

        resolve(parsedTx);

    }).catch(function (e) {
        console.log(e);
        // reject(e)

    });
}
export namespace StellarController {
    export class StellarData {
        public async SignConversion(req: Request, res: Response, next: NextFunction) {
            try {
                signXDR(req.body.xdr)
                    .then(async (signedXdr: Transaction) => {
                        // console.log(signedXdr.toEnvelope().toXDR().toString('base64'))
                        try {
                            const transactionResponse = await server.submitTransaction(signedXdr);
                            if (transactionResponse == null) {
                                console.log(transactionResponse)
                                return res.status(201).json({ err: "Conversion Failed submission" });
                            }
                            return res.status(200).json({ status: "success" });
                        } catch (e) {
                            console.log(e.response.data.extras.result_codes.operations.toString())
                            return res.status(202).json({ err: "Conversion Failed submitting: " + e.response.data.extras.result_codes.operations.toString() });
                        }


                    }).catch((er) => {
                        console.log(er.response.data.extras.result_codes.operations.toString())
                        return res.status(203).json({ err: "Conversion Failed signing: " + er.response.data.extras.result_codes.operations.toString() });

                    }
                    )
            } catch (err) {
                console.log(err.response.data.extras.result_codes.operations.toString())
                return res.status(204).json({ err: "Conversion Failed catch: " + err.response.data.extras.result_codes.operations.toString() });
            }
        }


        public async DistributeAssets(req: Request, res: Response, next: NextFunction) {
            try {
                //check for a knowledge the contributors including the creator


                //for each contribution check the votes
                //if a contribution has high votes for the hghest 50% of contributions give the initial 5 voters maximum benefit
                //also give teh contributor maximum benefit





            } catch (error) {

            }
        }



        public async AddReward(req: Request, res: Response, next: NextFunction) {
            try {


                firebase.database().ref(`rewards/${req.body.emailHash}`)
                    .set(req.body, async (err) => {
                        if (!err) {


                            return res.status(200).json({ status: "success" });

                        } else {
                            return res.status(201).json({ err: "knowledge genesis failed db on fire" });

                        }
                    })




            } catch (error) {

            }
        }
    }


}