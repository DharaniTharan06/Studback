import './utils/dotenv.js'
import connectDb from './db/indexdb.js'
import { app } from './app.js'

connectDb()
.then(()=>{
    app.on("error",(err)=>{
        console.log("A error has occured!!",err)
        throw err
    })
    app.listen(process.env.PORT_CONNECT || 5000,()=>{
        console.log(`Server is running on Port ${process.env.PORT_CONNECT?process.env.PORT_CONNECT:5000}`)
    })
})
.catch((err)=>{
    console.log("MongoDb connection error!!",err)
})
