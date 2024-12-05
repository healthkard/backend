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

// Payment initiation route
router.get('/', (req, res) => {
    const { number, amount, healthId, plan, agent, userName, type } = req.query;
    if (!number || !amount || !healthId) {
        return res.status(400).send({ message: "number and amount are required" });
    }

    const payEndPoint = '/pg/v1/pay';
    let merchantTransactionId = uniqid();
    let merchantUserId = healthId;

    const payload = {
        "merchantId": MERCHANT_ID,
        "merchantTransactionId": merchantTransactionId,
        "merchantUserId": merchantUserId,
        "amount": amount * 100,
        "redirectUrl": `${SERVER_URL}/pay/redirect-url/${merchantTransactionId}/?merchantTransactionId=${merchantTransactionId}&&healthId=${healthId}&&plan=${plan}&&agent=${agent}&&userName=${userName}&&type=${type}`,
        "redirectMode": "GET",
        "number": number,
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
    const { merchantTransactionId, healthId, plan, agent, userName, type } = req.query;
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
            await User.findOneAndUpdate(
                { healthId: healthId },
                { $push: { payments: paymentRecord } }
            );
            if (paymentStatus) {
                await User.findOneAndUpdate(
                    { healthId: healthId },
                    {
                        $set: {
                            expireDate: {
                                $cond: {
                                    if: { $lt: ["$expireDate", new Date()] },
                                    then: {
                                        $add: [
                                            new Date(),
                                            {
                                                $multiply: [
                                                    {
                                                        $switch: {
                                                            branches: [
                                                                { case: { $eq: ["Monthly", plan] }, then: 28 },
                                                                { case: { $eq: ["Quarterly", plan] }, then: 84 },
                                                                { case: { $eq: ["Half Yearly", plan] }, then: 168 },
                                                                { case: { $eq: ["Yearly", plan] }, then: 336 }
                                                            ],
                                                            default: 28
                                                        }
                                                    },
                                                    24 * 60 * 60 * 1000
                                                ]
                                            }
                                        ]
                                    },
                                    else: {
                                        $add: [
                                            "$expireDate",
                                            {
                                                $multiply: [
                                                    {
                                                        $switch: {
                                                            branches: [
                                                                { case: { $eq: ["Monthly", plan] }, then: 28 },
                                                                { case: { $eq: ["Quarterly", plan] }, then: 84 },
                                                                { case: { $eq: ["Half Yearly", plan] }, then: 168 },
                                                                { case: { $eq: ["Yearly", plan] }, then: 336 }
                                                            ],
                                                            default: 28
                                                        }
                                                    },
                                                    24 * 60 * 60 * 1000
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
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
                res.status(200).sendFile('Success.html', { root: './helpers/Payment' });
            } else {
                res.status(400).sendFile('Failure.html', { root: './helpers/Payment' });
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
