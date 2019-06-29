import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
import { time } from "cron";
const jwt = require('jsonwebtoken');

function hashEmail(email: any) {
    return sha256(email);
}

function decyrptSecret(secret: any, signer: any) {
    try {
        const decrypted = AES.decrypt(secret, signer);
        const plaintext = decrypted.toString(enc.Utf8);
        return plaintext;
    } catch (error) {
        return null;
    }
}


function encyrptSecret(secret: any, signer: any) {
    try {
        const ciphertext = AES.encrypt(secret, signer);
        return ciphertext.toString();
    } catch (error) {
        return null;
    }
}

export namespace userController {
    export class UserData {
        public async AddUser(req: Request, res: Response, next: NextFunction) {
            console.log(req.body.emailHash)

            const snapshot = await firebase.database().ref(`users/${req.body.emailHash}`)
                .once('value');

            if (snapshot.val() != null) {
                return res.status(203).json({ err: "account already exists" });

            } else {

                const response = await axios.post("http://localhost:8000/transactions/userICO", req.body);
                if (response != null) {
                    if (response.status = 200) {
                        firebase.database().ref(`users/${req.body.emailHash}`)
                            .set(req.body, (err) => {
                                if (!err) {
                                    let tokenBody = req.body
                                    tokenBody.exp = new Date().getTime() + 6000
                                    var token = jwt.sign(tokenBody, process.env.SECRET);
                                    return res.status(200).json({ token: token });
                                } else {
                                    return res.status(400).json({ err: "registration failed" });

                                }

                            })
                    } else {
                        
                    }
                }


            }


        }
        public async GetUser(req: Request, res: Response, next: NextFunction) {


            const snapshot = await firebase.database().ref(`users/${req.body.emailHash}`)
                .once('value');

            if (snapshot.val() == null) {
                return res.status(203).json({ err: "Account Doesn't Exist" });

            } else if (snapshot.val().publicKey
                == Keypair.fromSecret(decyrptSecret(
                    snapshot.val().encyrptedSecret,
                    req.body.password)).publicKey) {

                let tokenBody = snapshot.val()
                tokenBody.exp = new Date().getTime() + 6000
                var token = jwt.sign(tokenBody, process.env.SECRET);
                return res.status(200).json({ token: token });


            } else {
                return res.status(400).json({ err: "Login Failed" });

            }

        }
    }
}