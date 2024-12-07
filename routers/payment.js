const express = require('express');
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');
const router = express.Router();
const User = require('../schema/users'); // Import the User model
const Agent = require('../schema/agents'); // Import the Agent model

// Environment variables
const PHONE_PE_HOST_URL = process.env.PHONE_PE_HOST_URL || 'https://api.phonepe.com/apis/hermes';
const MERCHANT_ID = process.env.MERCHANT_ID || 'M22ASHHJBIPRV';
const SALT_INDEX = process.env.SALT_INDEX || 1;
const SALT_KEY = process.env.SALT_KEY || '52f31ab0-0b15-46b9-bb64-b9aebcecc876';

const SERVER_URL = process.env.SERVER_URL || 'https://backend-green-tau.vercel.app';
const HOST_ADDRESS = process.env.HOST_ADDRESS || 'https://healthkard.in';

// const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3002';
// const HOST_ADDRESS = process.env.HOST_ADDRESS || 'http://localhost:3000';


// Payment initiation route
router.get('/', (req, res) => {
    const { number, amount, healthId, plan, agent, userName, type, userId } = req.query;
    if (!number || !amount || !healthId) {
        return res.status(400).send({ message: "number and amount are required" });
    }

    const payEndPoint = '/pg/v1/pay';
    let merchantTransactionId = uniqid();
    let merchantUserId = healthId;

    const callbackUrl = `${HOST_ADDRESS}/profile/${userId}`;
    const redirectUrl = `${SERVER_URL}/pay/redirect-url/${merchantTransactionId}/?merchantTransactionId=${merchantTransactionId}&&healthId=${healthId}&&plan=${plan}&&agent=${agent}&&userName=${userName}&&type=${type}&callbackUrl=${callbackUrl}`;
    const payload = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": merchantUserId,
        "amount": amount * 100,
        "redirectUrl": redirectUrl,
        "redirectMode": "GET",
        "mobileNumber": number,
        "callbackUrl": callbackUrl,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        },
    };

    let bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");
    const xVerify = sha256(base64EncodedPayload + payEndPoint + SALT_KEY) + "###" + SALT_INDEX;

    const options = {
        method: 'POST',
        url: `${PHONE_PE_HOST_URL}${payEndPoint}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
        },
        data: {
            request: base64EncodedPayload
        }
    };


    axios
        .request(options)
        .then(response => {
            const url = response.data.data.instrumentResponse.redirectInfo.url;
            res.json({ paymentUrl: url, merchantTransactionId, healthId });
        })
        .catch(error => {
            console.error("Error during payment initiation:", error);
            res.status(500).send({ message: "Error during payment initiation", error });
        });
});


// Payment status check route
router.get("/redirect-url/:merchantTransactionId", async (req, res) => {
    const { merchantTransactionId, healthId, plan, agent, userName, type, callbackUrl } = req.query;
    if (merchantTransactionId) {

        try {
            const xVerify = sha256(`/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY) + "###" + SALT_INDEX;
            const options = {
                method: 'get',
                url: `${PHONE_PE_HOST_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-MERCHANT-ID': MERCHANT_ID,
                    'X-VERIFY': xVerify
                }
            };

            const response = await axios.request(options);

            const paymentStatus = response.data.code === "PAYMENT_SUCCESS";
            const paymentRecord = {
                amount: response.data.data.amount / 100, // Assuming amount is in paise
                plan: plan, // You can adjust this based on your logic
                transactionId: merchantTransactionId,
                paymentStatus: paymentStatus,
                agent: agent,
            };

            // Find the user by merchantUserId (healthId) and update their payments
            // Check if payment with this transactionId already exists
            const existingPayment = await User.findOne({
                healthId: healthId,
                'payments.transactionId': merchantTransactionId
            });

            if (!existingPayment) {
                await User.findOneAndUpdate(
                    { healthId: healthId },
                    { $push: { payments: paymentRecord } }
                );
            } else {
                res.status(400).send({ message: 'Payment already exists' });
                return;
            }
            if (paymentStatus) {
                // First get the current user to check their expireDate
                const user = await User.findOne({ healthId: healthId });

                // Calculate days to add based on plan
                let daysToAdd = 28; // Default to monthly
                switch (plan) {
                    case 'Monthly':
                        daysToAdd = 28;
                        break;
                    case 'Quarterly':
                        daysToAdd = 84;
                        break;
                    case 'Half Yearly':
                        daysToAdd = 168;
                        break;
                    case 'Yearly':
                        daysToAdd = 336;
                        break;
                }

                // Calculate new expire date
                const now = new Date();
                let newExpireDate;

                if (!user.expireDate || user.expireDate < now) {
                    // If expired or no date, start from now
                    newExpireDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                } else {
                    // If not expired, add to existing date
                    newExpireDate = new Date(user.expireDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
                }

                // Update the user with new expire date
                await User.findOneAndUpdate(
                    { healthId: healthId },
                    {
                        $set: {
                            expireDate: newExpireDate
                        }
                    }
                );
                if (agent !== 'Self') {
                    await Agent.findOneAndUpdate(
                        { agentID: agent },
                        {
                            $push: {
                                usersAdded: {
                                    healthID: healthId,
                                    name: userName,
                                    amount: response.data.data.amount / 100,
                                    type: type,
                                    plan: plan,
                                }
                            }
                        }
                    );
                }
                res.status(200).redirect(callbackUrl);
            } else {
                res.status(400).redirect(callbackUrl);
            }
        } catch (error) {
            console.error("Error during payment status check:", error);
            res.status(500).send("Error during payment status check");
        }
    } else {
        res.status(400).send({ error: "Invalid merchantTransactionId" });
    }
});

module.exports = router;
