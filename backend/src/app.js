import express from "express";
import cors from "cors";
import  cookieParser from 'cookie-parser';
import {app} from './utils/socket.io.js'
const allowedOrigins = [
    "https://prime-finance-hbmv.vercel.app",
    "https://prime-finance-hbmv-hz92asgbd-ayans-projects-991331f8.vercel.app",
    "https://prime-finance-hbmv-7rkt8pncd-ayans-projects-991331f8.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));
app.options('*', cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://prime-finance-hbmv-hz92asgbd-ayans-projects-991331f8.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});
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

