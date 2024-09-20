const User = require('../../schema/users');
const { addUserToAgent } = require('../updateAgents');
const plans = require('../../data/plans');

const renewUser = async (healthId, payment, res) => {
    try {
        const user = await User.findOne({ healthId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.payments.push(payment);

        // Find the last payment with status true
        const lastValidPayment = [...user.payments].reverse().find(p => p.paymentStatus);

        if (lastValidPayment) {
            const plan = plans.find(p => p.id === lastValidPayment.plan);
            if (plan) {
                const durationInDays = plan.days;
                user.expireDate = new Date(new Date(user.expireDate).getTime() + durationInDays * 24 * 60 * 60 * 1000).toISOString();
            } else {
                return res.status(400).json({ message: 'Invalid plan' });
            }
        } else {
            // If there's no failed payment, update with the current date
            const currentPlan = plans.find(p => p.id === payment.plan);
            if (currentPlan) {
                const durationInDays = currentPlan.days;
                user.expireDate = new Date(new Date().getTime() + durationInDays * 24 * 60 * 60 * 1000).toISOString();
            } else {
                return res.status(400).json({ message: 'Invalid plan' });
            }
        }

        await user.save();
        await addUserToAgent(user.healthId, payment, 'renew', user.name);
        res.status(200).json(user);
    } catch (error) {
        console.log({ error });
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    renewUser
}