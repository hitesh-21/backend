import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js';

dotenv.config({
    path: "./.env"
})

const port = process.env.PORT || 8100;
connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.log("Error while listening app");
            console.log(err)
            throw err;
        })
        app.listen(port, () => {
            console.log(`app is running at ${port}`)
        })
    })
    .catch((err) => {
        console.log("Mongo db connection failed !!" + err)
    })