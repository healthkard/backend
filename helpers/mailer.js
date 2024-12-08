const nodemailer = require("nodemailer");
require('dotenv').config({ path: '../.env' });

const transporter = nodemailer.createTransport({

    host: "smtp.gmail.com",
    service: "gmail",
    debug: true,
    logger: true,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL || 'healthkard99@gmail.com',
        pass: process.env.PASS || 'hemp zfdk ejxf xnmu'
    },
    tls: {
        rejectUnauthorized: true
    },
});

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(to, subject, text, html) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"Healthkard" <healthkard99@gmail.com>', // sender address
        to: to || "shaikshoheb9k@gmail.com", // list of receivers
        subject: subject || "Hello ✔", // Subject line
        text: text || "Hello world?", // plain text body
        html: html || "<b>Hello worlddddd?</b>", // html body
        attachments: [
            {
                filename: 'Terms and conditions.pdf',
                path: 'https://firebasestorage.googleapis.com/v0/b/healthkard.appspot.com/o/Healthkard%20Hospital%20TCs.pdf?alt=media&token=2f6dda0a-9081-4e4f-8db4-26b878cc1dda'
            },
        ]
    });

    return info.messageId;
}

async function sendSupportMail(to, subject, text) {
    const info = await transporter.sendMail({
        from: '"Healthkard" <healthkard99@gmail.com>',
        to: to || "healthkard99@gmail.com",
        subject: subject || "Support Mail",
        text: text || "Support Mail",
    })
    return info.messageId;
}

module.exports = { sendMail, sendSupportMail };