import dotenv from 'dotenv'
import connectDb from './db/indexdb.js'

dotenv.config({
    path: './.env'
})

connectDb()
