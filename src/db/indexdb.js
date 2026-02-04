import mongoose from "mongoose"
import { Db_name } from "../constants.js"

const connectDb = async () => {
    try {
        const connectionacc = await mongoose.connect(`${process.env.MONGODB_CONNECT}/${Db_name}`)
        console.log(`\n MongoDb connected on host ${connectionacc.connection.host}`)
    } catch (error) {
        console.log("Mongodb connection error: ",error)
        process.exit(1)
    }
}

export default connectDb