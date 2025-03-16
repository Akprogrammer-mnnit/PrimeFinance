import express from "express";
import cors from "cors";
import  cookieParser from 'cookie-parser';
import {app} from './utils/socket.io.js'
app.use(cors({
    origin: "https://prime-finance-hbmv.vercel.app",
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());


import userRouter from './routes/user.routes.js'
import budgetRouter from './routes/budget.routes.js'
import debtRouter from './routes/debt.routes.js'
import messageRouter from './routes/message.routes.js'
import savingRouter from './routes/saving.routes.js'
import recurringPaymentRouter from './routes/recurringPayment.routes.js'
import dashboardRouter from './routes/dashboard.routes.js'
app.use('/api/v1/users',userRouter);
app.use('/api/v1/budget',budgetRouter)
app.use('/api/v1/debt',debtRouter)
app.use('/api/v1/chat',messageRouter)
app.use('/api/v1/savings',savingRouter)
app.use('/api/v1/recurringPayment',recurringPaymentRouter)
app.use('/api/v1/dashboard' , dashboardRouter)
export {app}

