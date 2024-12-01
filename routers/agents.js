const express = require('express');
const router = express.Router();
const Agent = require('../schema/agents');
const { generateYearPrefixedNumber } = require('../helpers/basicFunctions');

// Get hospitals added by an agent
router.get('/:id/hospitals-added', async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) return res.status(404).json({ message: 'Agent not found' });
        res.json(agent.hospitalsAdded.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get users added by an agent
router.get('/:id/users-added', async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) return res.status(404).json({ message: 'Agent not found' });
        res.json(agent.usersAdded.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all agents with pagination
router.get('/', async (req, res) => {
    try {
        const agents = await Agent.find();
        res.json(agents.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single agent
router.get('/:id', async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) return res.status(404).json({ message: 'Agent not found' });
        res.json(agent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new agent
router.post('/', async (req, res) => {
    const agent = new Agent({ ...req.body, agentID: generateYearPrefixedNumber('HA') });
    try {
        const newAgent = await agent.save();
        res.status(201).json(newAgent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update an agent
router.patch('/:id', async (req, res) => {
    try {
        const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!agent) return res.status(404).json({ message: 'Agent not found' });
        res.json(agent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete an agent
router.delete('/:id', async (req, res) => {
    try {
        const agent = await Agent.findByIdAndDelete(req.params.id);
        if (!agent) return res.status(404).json({ message: 'Agent not found' });
        res.json({ message: 'Agent deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
