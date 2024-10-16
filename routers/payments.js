const express = require('express');
const router = express.Router();
const User = require('../schema/users');

router.get('/', async (req, res) => {
    try {
        const allPayments = await User.aggregate([
            { $unwind: '$payments' },
            { $sort: { 'payments.issueDate': -1 } },
            {
                $project: {
                    _id: 0,
                    userId: '$_id',
                    userName: '$name',
                    amount: '$payments.amount',
                    plan: '$payments.plan',
                    transactionId: '$payments.transactionId',
                    issueDate: '$payments.issueDate',
                    paymentStatus: '$payments.paymentStatus',
                    agent: '$payments.agent'
                }
            }
        ]);

        res.json(allPayments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
