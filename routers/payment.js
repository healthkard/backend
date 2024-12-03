const express = require('express');
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');
const router = express.Router();
const User = require('../schema/users'); // Import the User model

// Environment variables
const PHONE_PE_HOST_URL = process.env.PHONE_PE_HOST_URL || 'https://api.phonepe.com/apis/hermes';
const MERCHANT_ID = process.env.MERCHANT_ID || 'M22ASHHJBIPRV';
const SALT_INDEX = process.env.SALT_INDEX || 1;
const SALT_KEY = process.env.SALT_KEY || '52f31ab0-0b15-46b9-bb64-b9aebcecc876';
const SERVER_URL = process.env.SERVER_URL || 'https://localhost:3002';

// Payment initiation route
router.get('/', (req, res) => {
    const { number, amount, healthId } = req.query;
    if (!number || !amount) {
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
        "redirectUrl": `${SERVER_URL}/redirect-url/${merchantTransactionId}`,
        "redirectMode": "GET",
        "number": number,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
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
            res.json({ paymentUrl: url, merchantTransactionId });
        })
        .catch(error => {
            console.error("Error during payment initiation:", error);
            res.status(500).send({ message: "Error during payment initiation", error });
        });
});


// Payment status check route
router.get("/redirect-url/:merchantTransactionId", async (req, res) => {
    const { merchantTransactionId } = req.params;

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
                plan: '1 month', // You can adjust this based on your logic
                transactionId: merchantTransactionId,
                paymentStatus: paymentStatus
            };

            // Find the user by merchantUserId (healthId) and update their payments
            await User.findOneAndUpdate(
                { healthId: response.data.data.merchantUserId },
                { $push: { payments: paymentRecord } }
            );

            if (paymentStatus) {
                res.status(200).send("Payment successful");
            } else {
                res.status(400).send("Payment failed");
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
