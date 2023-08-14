import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as webpush from 'web-push';

const cors = require('cors');

async function initialize() {
    try {
        const value = await fs.readFile("./keys.json");
        const data = JSON.parse(value.toString());
        webpush.setVapidDetails(data.subject, data.publicKey, data.privateKey);
    } catch (err) {
        console.error(err);
    }
}

initialize();

dotenv.config();

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.post('/register', async (req: Request, res: Response) => {
    const data = req.body;

    try {
        const value = await fs.readFile("./subscription.json");
        const subscriptions = JSON.parse(value.toString());
        
        // Check for uniqueness
        const hashed = subscriptions.map((entry: any) => JSON.stringify(entry));
        if (hashed.includes(JSON.stringify(data))) {
            return res.json({ msg: "Already subscribed" });
        }
        
        await fs.writeFile("./subscription.json", JSON.stringify([data, ...subscriptions]));
        res.json({ msg: "Subscribed" });

        // Notification after saving
        webpush.sendNotification(data, JSON.stringify({
            title: "You are now subscribed to Hale's scam telegram group",
            msg: "Bullshit"
        }));

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error occurred" });
    }
});

app.post('/notification', async (req: Request, res: Response) => {
    const data = req.body;

    try {
        const value = await fs.readFile("./subscription.json");
        const subscriptions = JSON.parse(value.toString());

        const payload = {
            title: data.title, msg: data.content
        };

        const results = await Promise.allSettled(subscriptions.map((subscription: any) => {
            return webpush.sendNotification(subscription, JSON.stringify(payload));
        }));

        const failedNotifications = results.filter(result => result.status === 'rejected');
        
        if (failedNotifications.length > 0) {
            console.error('Failed to send some notifications', failedNotifications);
            res.json({ msg: "Fail to send some notifications" });
        } else {
            res.json({ msg: "Success" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error occurred" });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`⚡️[server]: Server is running at http://0.0.0.0:${port}`);
});
