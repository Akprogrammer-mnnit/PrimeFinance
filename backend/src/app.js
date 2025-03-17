import express from "express";
import cors from "cors";
import  cookieParser from 'cookie-parser';
import {app} from './utils/socket.io.js'
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like curl or mobile apps)
        if (!origin) return callback(null, true);
        // For demonstration, you might allow any origin here:
        return callback(null, origin);
        // Alternatively, restrict to a set of allowed origins:
        // const allowedOrigins = ['https://example.com', 'https://anotherdomain.com'];
        // if (allowedOrigins.includes(origin)) return callback(null, true);
        // else return callback(new Error('Not allowed by CORS'));
    },
    methods: 'GET,POST,PUT,DELETE',
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

