// hospitalRoutes.js
const express = require('express');
const { sendMail } = require('../helpers/mailer');
const { otpTemplate } = require('../helpers/otpTemplate');
const { getOTP } = require('../helpers/otpGenerator');
const { sendOtp } = require('../helpers/mobileVerification');
const MobileUser = require('../schema/mobileUser');
const router = express.Router();

// Login a user
router.post('/new-user', async (req, res) => {
    try {
        const { name, email, password, number } = req.body;
        const users = await MobileUser.find({ number });
        if (users.length) {
            res.status(200).send({ message: 'user already exist' });
        }
        const newUser = new MobileUser({ name, email, password, number });
        await newUser.save();
        res.status(201).send(newUser);
    } catch (error) {
        console.log(error)
    }
});
// Login a user
router.post('/user-login', async (req, res) => {
    try {
        const { number, password } = req.body;
        const user = await MobileUser.findOne({ number });
        if (user) {
            if (password === user.password) {
                res.status(200).send({ message: 'Verified' });
            } else {
                res.status(400).send({ message: 'Password incorrect' });
            }
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Something wents wrong' });
    }
});


// Send otp to mail
router.post('/send-otp', async (req, res) => {
    try {
        const { email, userName } = req.body;
        const otpCode = getOTP();
        const emailHtml = otpTemplate(userName, otpCode);
        await sendMail(email, 'Your OTP for Healthkard Verification', 'OTP verification', emailHtml);
        res.status(200).send({ message: 'Successfully send the message', otpCode })
    } catch (error) {
        res.status(500).send({ message: 'Unable to send email', error })
    }
});


// Route to send OTP to phone number
router.get('/send-otp-mobile', async (req, res) => {
    try {
        const mobileNumber = req.query.mobileNumber || '+919347235528';  // Get the mobile number from query parameters

        if (!mobileNumber) {
            return res.status(400).send({ message: 'Mobile number is required' });
        }

        const otp = await sendOtp(mobileNumber);
        res.status(200).send({ message: 'OTP sent successfully', otp });  // In production, avoid sending the OTP back in the response
    } catch (error) {
        console.error('Failed to send OTP:', error);
        res.status(500).send({ message: 'Unable to send OTP', error });
    }
});


module.exports = router;