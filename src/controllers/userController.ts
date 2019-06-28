import { NextFunction, Request, Response } from "express";
import axios from 'axios';
import { AES, enc } from "crypto-js";
import sha256 from "sha256";
import { Keypair } from "stellar-sdk";
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
        public AddUser(req: Request, res: Response, next: NextFunction) {
        

        }
        public GetUser(req: Request, res: Response, next: NextFunction) {

        

        }
    }
}