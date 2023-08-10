"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs = __importStar(require("fs/promises"));
const webpush = __importStar(require("web-push"));
const cors = require('cors');
fs.readFile("./keys.json")
    .then((value) => {
    const data = JSON.parse(value.toString());
    webpush.setVapidDetails(data.subject, data.publicKey, data.privateKey);
})
    .catch((err) => {
    console.log(err);
});
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 8000;
app.use(cors());
app.use(express_1.default.json());
app.post('/register', (req, res) => {
    const data = req.body;
    fs.readFile("./subscription.json")
        .then((value) => {
        const jsonValue = JSON.parse(value.toString());
        const data = Array.isArray(jsonValue) ? jsonValue : [jsonValue];
        return data;
    })
        .then((subscriptions) => {
        fs.writeFile("./subscription.json", JSON.stringify([data, ...subscriptions]))
            .then(() => res.json({ msg: "Subscribed" }))
            .catch((err) => console.error(err));
    });
    webpush.sendNotification(data, JSON.stringify({
        title: "You are now subscribed to Hale's scam telegram group",
        msg: "Bullshit"
    }));
});
app.post('/notification', (req, res) => {
    const data = req.body;
    fs.readFile("./subscription.json")
        .then((value) => {
        const subscriptions = JSON.parse(value.toString());
        const payload = {
            title: data.title, msg: data.content
        };
        Promise.allSettled(subscriptions.map((subscription) => {
            return webpush.sendNotification(subscription, JSON.stringify(payload));
        }))
            .then(() => res.json({ msg: "Success" }))
            .catch((err) => {
            console.error(err);
            res.json({ msg: "Fail to send", err: err });
        });
    });
});
app.listen(port, "0.0.0.0", () => {
    console.log(`⚡️[server]: Server is running at http://0.0.0.0:${port}`);
});
