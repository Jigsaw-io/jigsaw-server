import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
import { jigsawGateway } from "../constants/api";
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

            console.log(req)
            try {
                const snapshot = await firebase.database().ref(`users/${req.body.emailHash}`)
                    .once('value');

                if (snapshot.val() != null) {
                    return res.status(203).json({ err: "account already exists" });
                } else {
                    const response = await axios.post(`${jigsawGateway}/api/transactions/userICOJIGXU`, req.body);
                    if (response != null) {
                        if (response.status = 200) {
                            firebase.database().ref(`users/${req.body.emailHash}`)
                                .set(req.body, (err) => {
                                    if (!err) {
                                        let tokenBody = req.body
                                        tokenBody.exp = Math.floor(new Date().getTime() / 1000.0) + 6000
                                        var token = jwt.sign(tokenBody, process.env.SECRET);
                                        return res.status(200).json({ token: token });
                                    } else {
                                        return res.status(400).json({ err: "registration failed due to user record addition failure" });

                                    }
                                })
                        } else {
                            console.log("ICO broken")

                            return res.status(400).json({ err: "registration failed due to ICO distribution failure" });

                        }
                    }
                }
            } catch (error) {
                console.log("all broken")
                return res.status(400).json({ err: "registration failed" });

            }



        }
        public async GetUser(req: Request, res: Response, next: NextFunction) {

            try {
                const snapshot = await firebase.database().ref(`users/${req.body.emailHash}`)
                    .once('value');

                if (snapshot.val() != null) {
                    try {
                        const secret = decyrptSecret(snapshot.val().encryptedSecret, req.body.password);
                        if (snapshot.val().publicKey
                            == Keypair.fromSecret(secret).publicKey()) {

                            let tokenBody = snapshot.val()
                            tokenBody.exp = Math.floor(new Date().getTime() / 1000.0) + 6000
                            var token = jwt.sign(tokenBody, process.env.SECRET);
                            return res.status(200).json({ token: token });

                        } else {
                            console.log("password broken")
                            return res.status(201).json({ err: "Login Failed Password is Incorrect" });

                        }
                    } catch (err) {
                        console.log("password broken")
                        return res.status(201).json({ err: "Login Failed Password is Incorrect" });
                    }

                } else {
                    console.log("Account broken")

                    return res.status(203).json({ err: "Account Doesn't Exist" });
                }

            } catch (error) {
                console.log("all broken")

                return res.status(400).json({ err: "Login Failed" });
            }
        }
    }
}