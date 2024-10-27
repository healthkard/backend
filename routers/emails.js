const express = require('express');
const { socialMediaLinksAgentTemplate } = require('../helpers/emailTemplate');
const { sendMail } = require('../helpers/mailer');
const router = express.Router()

router.post('/send-social-media-links-agent', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).send({ message: 'Name and email are required' })
    }
    const emailHtml = socialMediaLinksAgentTemplate(name)
    await sendMail(email, 'Join Healthkard as an Agent', 'Join Healthkard as an Agent', emailHtml)
    res.status(200).send({ message: 'Successfully send the message' })
})

module.exports = router