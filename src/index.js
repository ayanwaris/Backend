import connetDB from "./db/index.js";
import dotenv from 'dotenv'
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

const serverPORT = process.env.PORT || 8000;

connetDB()
    .then(() => {
        app.listen(serverPORT, ()=>{
            console.log(`App is listening on PORT ${serverPORT}`)
        })

        app.on("error", (error)=>{
            console.log("Server ERROR:", error);
            throw error;
        })
    })
    .catch((error) => {
        console.log('Mongo DB DataBase Connection Failed !!!', error)
    });

