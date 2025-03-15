
import dotenv from "dotenv"
import {app} from './app.js'
import {server} from './utils/socket.io.js'
import connectDB from './db/index.js'
dotenv.config({path: './.env'})
connectDB()
  .then(() => {
    const PORT = process.env.PORT || 8000; 
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
