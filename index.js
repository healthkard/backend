const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const usersRouter = require('./routers/users');
const hospitalRouter = require('./routers/hospitals');
const agentsRouter = require('./routers/agents');
const authRouter = require('./routers/auth');
const paymentRouter = require('./routers/payment');
const recordsRouter = require('./routers/records');
const mobileRouter = require('./routers/mobile');
const emailsRouter = require('./routers/emails');
const paymentsRouter = require('./routers/payments');
require('dotenv').config();

const allowedOrigins = [
    'http://healthkard.in',
    'http://www.healthkard.in',
    'https://healthkard.in',
    'https://www.healthkard.in'
];

// Middleware to set CORS headers dynamically
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// CORS options
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};
// middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database connected
mongoose.connect(process.env.MONGODB_URL).then(() => console.log('Database Connected')).catch(err => console.log(err));

// port
app.listen(process.env.PORT, () => { console.log('Server is running on port ' + process.env.PORT); });

// routes
app.get('/', (req, res) => { res.status(200).send('Server is running'); });
app.use('/users', usersRouter);
app.use('/hospitals', hospitalRouter);
app.use('/agents', agentsRouter);
app.use('/auth', authRouter);
app.use('/pay', paymentRouter);
app.use('/records', recordsRouter);
app.use('/payments', paymentsRouter);
app.use('/mobile', mobileRouter);
app.use('/emails', emailsRouter);