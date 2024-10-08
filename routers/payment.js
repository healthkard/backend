const express = require('express');
const axios = require('axios');
const sha256 = require('sha256');
const uniqid = require('uniqid');
const router = express.Router();

// Environment variables
const PHONE_PE_HOST_URL = process.env.PHONE_PE_HOST_URL || 'https://api.phonepe.com/apis/hermes';
const MERCHANT_ID = process.env.MERCHANT_ID || 'M22ASHHJBIPRV';
const SALT_INDEX = process.env.SALT_INDEX || 1;
const SALT_KEY = process.env.SALT_KEY || '52f31ab0-0b15-46b9-bb64-b9aebcecc876';
const SERVER_URL = process.env.SERVER_URL || 'https://localhost:3002';

// Payment initiation route
router.get('/', (req, res) => {
    const { number, amount } = req.query;
    console.log({ number, amount, params: req.query })
    if (!number || !amount) {
        return res.status(400).send({ message: "number and amount are required" });
    }

    const payEndPoint = '/pg/v1/pay';
    let merchantTransactionId = uniqid();
    let merchantUserId = "MUID123";

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

    console.log("Payload before encoding:", payload);

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

    console.log("Request options:", options);

    axios
        .request(options)
        .then(response => {
            const url = response.data.data.instrumentResponse.redirectInfo.url;
            console.log("Redirect URL:", url);
            res.redirect(url);
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

            if (response.data.code === "PAYMENT_SUCCESS") {
                res.status(200).send("Payment successful");
            } else {
                console.log("Payment failed:", response.data);
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
