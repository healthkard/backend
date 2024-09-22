const Agent = require("../schema/agents");
const plans = require('../data/plans');

const addUserToAgent = async (healthID, payment, type = 'renew', name) => {
    if (payment.agent) {
        const agent = await Agent.findOne({ agentID: payment.agent });
        if (agent) {
            agent.usersAdded.push({
                healthID: healthID,
                name: name,
                type: type,
                plan: payment.plan,
                amount: plans.find(plan => plan.id === payment.plan)?.amount || 0
            });
            await agent.save();
        }
    }
}

const addHospitalToAgent = async (hospitalID, name, agentID) => {
    const agent = await Agent.findOne({ agentID: agentID });
    if (agent) {
        agent.hospitalsAdded.push({
            hospitalID: hospitalID,
            name: name
        });
        await agent.save();
    }
}

module.exports = { addUserToAgent, addHospitalToAgent };