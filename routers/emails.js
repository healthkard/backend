const express = require('express');
const { socialMediaLinksAgentTemplate } = require('../helpers/emailTemplate');
const { sendMail, sendSupportMail } = require('../helpers/mailer');
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

router.post('/send-support-mail', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        if (!name || !email || !message) {
            return res.status(400).send({ message: 'Name, email, and message are required' })
        }
        await sendSupportMail('healthkard99@gmail.com', 'Support Mail', `${name} (${email}) sent a message: ${message}`)
        res.send({ message: 'Successfully send the message', status: 200 })
    } catch (error) {
        console.log(error)
        res.send({ message: 'Internal server error', status: 500 })
    }
})

module.exports = router