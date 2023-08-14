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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const value = yield fs.readFile("./keys.json");
            const data = JSON.parse(value.toString());
            webpush.setVapidDetails(data.subject, data.publicKey, data.privateKey);
        }
        catch (err) {
            console.error(err);
        }
    });
}
initialize();
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 8000;
app.use(cors());
app.use(express_1.default.json());
app.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const value = yield fs.readFile("./subscription.json");
        const subscriptions = JSON.parse(value.toString());
        // Check for uniqueness
        const hashed = subscriptions.map((entry) => JSON.stringify(entry));
        if (hashed.includes(JSON.stringify(data))) {
            return res.json({ msg: "Already subscribed" });
        }
        yield fs.writeFile("./subscription.json", JSON.stringify([data, ...subscriptions]));
        res.json({ msg: "Subscribed" });
        // Notification after saving
        webpush.sendNotification(data, JSON.stringify({
            title: "You are now subscribed to Hale's scam telegram group",
            msg: "Bullshit"
        }));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error occurred" });
    }
}));
app.post('/notification', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        const value = yield fs.readFile("./subscription.json");
        const subscriptions = JSON.parse(value.toString());
        const payload = {
            title: data.title, msg: data.content
        };
        const results = yield Promise.allSettled(subscriptions.map((subscription) => {
            return webpush.sendNotification(subscription, JSON.stringify(payload));
        }));
        const failedNotifications = results.filter(result => result.status === 'rejected');
        if (failedNotifications.length > 0) {
            console.error('Failed to send some notifications', failedNotifications);
            res.json({ msg: "Fail to send some notifications" });
        }
        else {
            res.json({ msg: "Success" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error occurred" });
    }
}));
app.listen(port, "0.0.0.0", () => {
    console.log(`⚡️[server]: Server is running at http://0.0.0.0:${port}`);
});
