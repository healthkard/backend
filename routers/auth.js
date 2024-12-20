// hospitalRoutes.js
const express = require('express');
const { sendMail } = require('../helpers/mailer');
const { otpTemplate } = require('../helpers/otpTemplate');
const { getOTP } = require('../helpers/otpGenerator');
const { sendOtp } = require('../helpers/mobileVerification');
const MobileUser = require('../schema/mobileUser');
const Agent = require('../schema/agents');
const router = express.Router();

// Login a user
router.post('/new-user', async (req, res) => {
    try {
        const { name, email, password, number } = req.body;
        const users = await MobileUser.find({ number });
        if (users.length) {
            res.status(200).send({ message: 'User already exist', status: 200 });
        } else {
            const newUser = new MobileUser({ name, email, password, number });
            await newUser.save();
            res.status(200).send({ message: 'User created successfully', status: 200 });
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({ message: 'Something went wrong', status: 400 });
    }
});
// Login a user
router.post('/user-login', async (req, res) => {
    try {
        const { number, password } = req.body;
        const user = await MobileUser.findOne({ number });
        if (user) {
            if (password === user.password) {
                res.status(200).send({ message: 'Login successful', healthId: user.healthId, id: user._id, name: user.name, email: user.email, status: 200 });
            } else {
                res.status(201).send({ message: 'Password incorrect', status: 201 });
            }
        } else {
            res.send({ message: 'User not found', status: 404 });
        }
    } catch (error) {
        res.status(500).send({ message: 'Something wents wrong', status: 500 });
    }
});

// Agent login
router.post('/agent-login', async (req, res) => {

    try {
        const { email, password } = req.body;
        // Find the agent by email
        const agent = await Agent.findOne({ email });
        if (!agent) {
            return res.status(404).send({ message: 'Agent not found' });
        }

        if (agent.password !== password) {
            return res.status(400).send({ message: 'Invalid password' });
        }
        // If everything is valid, send the response
        res.status(200).send({
            message: 'Login successful',
            agentId: agent.agentID,
            id: agent._id,
            name: agent.name
        });
    } catch (error) {
        console.error('Agent login error:', error);
        res.status(500).send({ message: 'Something went wrong during login' });
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
        console.log(error);
        res.status(500).send({ message: 'Unable to send email', error })
    }
});


// Route to send OTP to phone number
router.post('/send-mobile-otp', async (req, res) => {
    try {
        const mobileNumber = req.body.mobileNumber || '+919347235528';  // Get the mobile number from query parameters
        console.log(mobileNumber);
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


// Check if email exists
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ message: 'Email is required' });
        }

        const user = await MobileUser.findOne({ email });
        if (user) {
            res.status(200).send({ exists: true, message: 'Email already exists' });
        } else {
            res.status(200).send({ exists: false, message: 'Email is available' });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).send({ message: 'Something went wrong while checking email' });
    }
});

// Check if number exists
router.post('/check-number', async (req, res) => {
    try {
        const { number } = req.body;
        if (!number) {
            return res.status(400).send({ message: 'Phone number is required' });
        }

        const user = await MobileUser.findOne({ number });
        if (user) {
            res.status(200).send({ exists: true, message: 'Phone number already exists' });
        } else {
            res.status(200).send({ exists: false, message: 'Phone number is available' });
        }
    } catch (error) {
        console.error('Error checking phone number:', error);
        res.status(500).send({ message: 'Something went wrong while checking phone number' });
    }
});

// Send password to email
router.post('/send-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the email exists
        const user = await MobileUser.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: 'User not found with this email' });
        }

        // Send email with the temporary password
        const emailHtml = `<p>Your permanent password is: <strong>${user.password}</strong></p>
                           <p>Please change your password after logging in.</p>`;
        await sendMail(email, 'Your Permanent Password for Healthkard', 'Permanent Password', emailHtml);

        res.status(200).send({ message: 'Password sent to your email', status: 200 });
    } catch (error) {
        console.error('Error sending password:', error);
        res.status(500).send({ message: 'Failed to send password', error: error.message });
    }
});

// Admin login
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === 'healthkard99@gmail.com' && password === 'Healthkard@99') {
            const token = Math.random().toString(36).substring(2, 12);
            res.status(200).send({ message: 'Login successful', token: token, status: 200 });
        } else {
            res.status(400).send({ message: 'Invalid credentials', status: 400 });
        }
    } catch (error) {
        console.error('Error sending password:', error);
        res.status(500).send({ message: 'Failed to send password', error: error.message });
    }
});

module.exports = router;