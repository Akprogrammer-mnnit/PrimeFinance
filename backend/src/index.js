
import dotenv from "dotenv"
import {app} from './app.js'
import {server} from './utils/socket.io.js'
import connectDB from './db/index.js'
dotenv.config({path: './.env'})
connectDB()
.then(()=> {
    server.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running on port ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MongoDb connection error: " + error);
 
})

