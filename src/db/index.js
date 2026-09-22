import dns from "dns";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

dns.setServers(["8.8.8.8"]);
const connetDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DATABASE_URL}/${DB_NAME}`);

        console.log(
            `\n MONGO DB CONNECTED !! DB HOST: ${connectionInstance.connection.host}`
        )
        console.log(connectionInstance)
    } catch (error) {
        console.log("MongoDD Connection FAILED", error)
        process.exit(1)
    }
}

export default connetDB;