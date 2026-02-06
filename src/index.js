import dotenv from 'dotenv'
import connectDb from './db/indexdb.js'

dotenv.config({
    path: './.env'
})

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
