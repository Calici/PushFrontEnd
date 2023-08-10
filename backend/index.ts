import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as fs from 'fs/promises'
import * as webpush from 'web-push'

const cors = require('cors')

fs.readFile("./keys.json")
.then((value) => {
  const data = JSON.parse(value.toString())
  webpush.setVapidDetails(
    data.subject, data.publicKey, data.privateKey
  )
})
.catch((err) => {
  console.log(err)
})

dotenv.config();

const app = express();
const port = 8000

app.use(cors())
app.use(express.json())
app.post('/register', (req: Request, res: Response) => {
  const data = req.body
  fs.readFile("./subscription.json")
  .then((value) => {
    const jsonValue = JSON.parse(value.toString())
    const data = Array.isArray(jsonValue) ? jsonValue : [ jsonValue ]
    return data
  })
  .then((subscriptions) => {
    fs.writeFile("./subscription.json", JSON.stringify([data, ...subscriptions]))
    .then(() => res.json({msg : "Subscribed"}))
    .catch((err) => console.error(err))
  })
  webpush.sendNotification(
    data, 
    JSON.stringify({
      title : "You are now subscribed to Hale's scam telegram group",
      msg : "Bullshit"
    })
  )
});
app.post('/notification', (req : Request, res : Response) => {
  const data = req.body
  fs.readFile("./subscription.json")
  .then((value) => {
    const subscriptions = JSON.parse(value.toString())
    const payload = {
      title : data.title, msg : data.content
    }
    Promise.allSettled(
      subscriptions.map((subscription : any) => {
        return webpush.sendNotification(subscription, JSON.stringify(payload))
      })
    )
    .then(() => res.json({msg : "Success"}))
    .catch((err) => {
      console.error(err)
      res.json({msg : "Fail to send", err : err})
    })
  })
})

app.listen(port, "0.0.0.0", () => {
  console.log(`⚡️[server]: Server is running at http://0.0.0.0:${port}`);
});