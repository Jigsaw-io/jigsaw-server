import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
import { jigsawGateway } from "../constants/api";
import { time } from "cron";
const jwt = require('jsonwebtoken');

//global cache for user
var User: any = null

//subcription to firebase for user updates
firebase.database().ref(`users`)
    .on('value', onUser)

//updating user cache
function onUser(snapshot: any) {
    console.log("User Cached")
    User = snapshot.val()
}


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

            try {
                let doesntExist = false;
                if (!User[req.body.emailHash]) {
                    doesntExist =true;
                }
                // const snapshot = await firebase.database().ref(`users/${req.body.emailHash}`)
                //     .once('value');
                if (!doesntExist) {
                    // if(!(!User[req.body.emailHash])){
                    return res.status(203).json({ err: "account already exists" });
                    // }
                } else {
                    const response = await axios.post(`${jigsawGateway}/api/transactions/userICOJIGXU`, req.body);
                    if (response != null) {
                        if (response.status = 200) {
                            firebase.database().ref(`users/${req.body.emailHash}`)
                                .set(req.body, (err) => {
                                    if (!err) {
                                        let tokenBody = req.body
                                        tokenBody.exp = Math.floor(new Date().getTime() / 1000.0) + 12000
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
                // const snapshot = await firebase.database().ref(`users/${req.body.emailHash}`)
                //     .once('value');

                if (User != null) {
                    try {
                        const secret = decyrptSecret(User[req.body.emailHash].encryptedSecret, req.body.password);
                        if (User[req.body.emailHash].publicKey
                            == Keypair.fromSecret(secret).publicKey()) {

                            let tokenBody = User[req.body.emailHash]
                            tokenBody.exp = Math.floor(new Date().getTime() / 1000.0) + 12000
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

        public async GetUserBySecret(req: Request, res: Response, next: NextFunction) {
            try {

                console.log(req.body)
                const keypair = Keypair.fromSecret(req.body.secretKey);
                console.log(keypair.publicKey())


                const snapshot = await firebase.database().ref(`users`)
                    .orderByChild('publicKey').equalTo(keypair.publicKey()).limitToFirst(1)
                    .once('value');

                if (snapshot.val() != null) {
                    try {
                        const lol = (snapshot.val());
                        var arr = [];
                        for (var key in lol) {
                            arr.push(lol[key]);
                        }

                        console.log(arr[0])
                        if (arr[0].publicKey
                            == keypair.publicKey()) {

                            let tokenBody = arr[0]
                            tokenBody.exp = Math.floor(new Date().getTime() / 1000.0) + 12000
                            var token = jwt.sign(tokenBody, process.env.SECRET);
                            return res.status(200).json({ token: token });

                        } else {
                            console.log("password broken")
                            return res.status(201).json({ err: "Login Failed SecretKey is not in the system" });

                        }
                    } catch (err) {
                        console.log("password broken")
                        return res.status(201).json({ err: "Login Failed SecretKey is not in the system" });
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

        public async GetAllPublicKeys(req: Request, res: Response, next: NextFunction) {

            try {
                // const snapshot = await firebase.database().ref(`users`)
                //     .once('value');

                if (User != null) {
                    const lol = User;
                    var arr = [];
                    for (var key in User) {
                        arr.push({ publicKey: lol[key].publicKey, alias: lol[key].alias, emailHash: lol[key].emailHash });
                    }

                    return res.status(200).json({ publicKeys: arr });
                } else {
                    return res.status(201).json({ err: "No publicKeys in the system" });

                }

            } catch (err) {
                return res.status(400).json({ err: "Key retrieval failed" });
            }


        }


        public async DecryptSecret(req: Request, res: Response, next: NextFunction) {

            try {
                const secret = decyrptSecret(req.body.encryptedSecret, req.body.password);

                if (secret != null) {
                    return res.status(200).json({ secret: secret });

                }

            } catch (err) {
                return res.status(201).json({ err: "Decryption Failed" });
            }


        }



    }


}