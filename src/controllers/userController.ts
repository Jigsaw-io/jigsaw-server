import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";
import { admin } from "../firebase/admin";

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
                if (User != null) {
                    if (!User[req.body.emailHash]) {
                        doesntExist = true;
                    }
                } else {
                    doesntExist = true;

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
                        if (response.status == 200) {
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
                return res.status(400).json({ err: " all broken registration failed" });

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

        public async UpdateUserPushToken(req: Request, res: Response, next: NextFunction) {

            try {
                firebase.database().ref(`users/${req.body.emailHash}`)
                    .update({ pushToken: req.body.pushToken }, (err) => {
                        if (!err) {
                            return res.status(200).json({ status: "success" });
                        } else {
                            return res.status(201).json({ err: "failed in db" });

                        }
                    })

            } catch (err) {
                return res.status(400).json({ err: "failed" });
            }


        }


        public async RecordMessage(emailHash: any, messageBody: any): Promise<any> {

            try {
                var message = [];
                message.push(messageBody);

                const messageSnapshot = await firebase.database().ref(`messages/${emailHash}`)
                    .once('value');

                if (messageSnapshot != null) {
                    for (var key in messageSnapshot.val()) {
                        message.push((messageSnapshot.val())[key])
                    }


                }
                firebase.database().ref(`messages/${emailHash}`)
                    .set(message, (err) => {
                        if (!err) {
                            // return res.status(200).json({ status: "success" });
                            return true
                        } else {
                            // return res.status(201).json({ err: "failed in db" });
                            return null
                        }
                    })


            } catch (err) {
                // return res.status(400).json({ err: "failed" });
                return null

            }


        }


        public async GetMessagesByEmail(req: Request, res: Response, next: NextFunction) {

            try {

                var arr = []
                const messageSnapshot = await firebase.database().ref(`messages/${req.body.emailHash}`)
                    .once('value');

                if (messageSnapshot == null) {
                    return res.status(203).json({ err: "No messages" });

                }

                for (var key in messageSnapshot.val()) {
                    (messageSnapshot.val())[key].emailHash = key
                    arr.push((messageSnapshot.val())[key])
                }



                return res.status(200).json({ messages: arr });


            } catch (err) {
                return res.status(400).json({ err: "failed" });
            }


        }
        public async SendTransferMessage(req: Request, res: Response, next: NextFunction) {

            try {

                const recordAwait = await this.RecordMessage(req.body.emailHash, req.body)
                if (recordAwait == null) {
                    return res.status(202).json({ status: "Error recording message:" });
                }

                let doesntExist = false;
                if (User != null) {
                    if (!User[req.body.emailHash]) {
                        doesntExist = true;
                    }
                } else {
                    doesntExist = true;
                }

                if (doesntExist) {
                    // if(!(!User[req.body.emailHash])){
                    return res.status(203).json({ err: "user not found" });
                    // }
                } else {
                    const user = User[req.body.emailHash]
                    const message = {
                        data: {},
                        notification: {
                            tag: "lol",
                            body: "You received assets",
                            icon: "./favicon.ico",
                            // badge: "string",
                            color: "#7537C6",
                            sound: "just-like-magic.mp3",
                            title: "JIGSAW",
                            // bodyLocKey : "string",
                            // bodyLocArgs: "string",
                            clickAction: "https://jigsaw.cf/wallet/",
                            // titleLocKey: "string",
                            // titleLocArgs : "string",
                        }
                    }

                    admin.messaging().sendToDevice(user.pushToken, message,
                        {
                            priority: "high",
                            // dryRun: true,
                        })
                        .then((response: any) => {
                            // Response is a message ID string.
                            console.log('Successfully sent message:', response);
                            return res.status(200).json({ status: "success" });
                        })
                        .catch((error: any) => {
                            console.log('Error sending message:', error);
                            return res.status(201).json({ status: "Error sending message:" });
                        });
                }

            } catch (error) {
                console.log("all broken")
                return res.status(400).json({ err: "message Failed" });
            }
        }

        public async SendRewardMessage(publicKey: any): Promise<any> {

            try {

                const snapshot = await firebase.database().ref(`users`)
                    .orderByChild('publicKey').equalTo(publicKey).limitToFirst(1)
                    .once('value');

                if (snapshot == null) {
                    return null
                } else {
                    const lol = (snapshot.val());
                    var arr = [];
                    for (var key in lol) {
                        arr.push(lol[key]);
                    }
                    const user = arr[0];
                    const message = {
                        data: {},
                        notification: {
                            tag: "lol",
                            body: "You received assets",
                            icon: "./favicon.ico",
                            // badge: "string",
                            color: "#7537C6",
                            sound: "just-like-magic.mp3",
                            title: "JIGSAW",
                            // bodyLocKey : "string",
                            // bodyLocArgs: "string",
                            clickAction: "https://jigsaw.cf/wallet/",
                            // titleLocKey: "string",
                            // titleLocArgs : "string",
                        }
                    }

                    if (user.pushToken == null) {
                        console.log('Error sending message: token not found');

                        return null

                    }
                    admin.messaging().sendToDevice(user.pushToken, message,
                        {
                            priority: "high",
                            // dryRun: true,

                        })
                        .then((response: any) => {
                            // Response is a message ID string.
                            console.log('Successfully sent message:', response);
                            return true

                        })
                        .catch((error: any) => {
                            console.log('Error sending message:', error);
                            return null

                        });
                }


            } catch (error) {
                console.log("all broken")

                return null
            }

        }



    }


}