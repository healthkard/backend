function socialMediaLinksAgentTemplate(
    name,
    whatsappLink = 'https://api.whatsapp.com/send?phone=%2B917842722245&context=ARDAZgnczpVEoGe9jBIKxITESF1lCeZRSoXo7vg4ddm-SH-Vxkmqfgm5WMxZQdseN3GXsjAzskQt75cu8CzDX2SjH4sXcQubnTDu8GNHTXtb54PEgDKqID4lzoiYvpcs_CNnBYMynRZR6MyniApNf4xJ-g&source=FB_Page&app=facebook&entry_point=page_cta&sfnsn=wiwspwa',
    instagramLink = 'https://www.instagram.com/healthkard.in',
    facebookLink = 'https://www.facebook.com/people/Healthkard/61559960306571/?mibextid=ZbWKwL',
    linkedinLink = 'https://www.linkedin.com/company/healthkard/'
) {
    return `
    <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Confirm Your Healthkard Agent Details</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 90%;
            margin: auto;
            overflow: hidden;
        }

        .header {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 2rem;
            background-color: #303486;
            color: #fff;
            padding: 20px 0;
        }

        .logo {
            width: 100px;
            height: 80px;
        }

        .content {
            background-color: #fff;
            padding: 20px;
            margin: 20px 0;
        }

        .footer {
            background-color: #303486;
            color: #fff;
            text-align: center;
            padding: 10px 0;
            font-size: 0.9em;
        }

        .social-links {
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }

        .social-link {
            text-decoration: none;
            color: #303486;
            font-weight: bold;
            display: block;
            margin-bottom: 10px;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #303486;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h1>Healthkard</h1>
        </div>
        <div class="content">
            <h2>Confirm Your Healthkard Agent Details</h2>
            <p>Dear ${name},</p>
            <p>
                Thank you for joining the Healthkard community as one of our valued agents. To complete your registration, we need you to confirm your social media handles.
            </p>
            <p>
                Please review the following social media links associated with your profile:
            </p>
            <div class="social-links">
                <span class="social-link">WhatsApp: ${whatsappLink}</span>
                <span class="social-link">Instagram: ${instagramLink}</span>
                <span class="social-link">Facebook: ${facebookLink}</span>
                <span class="social-link">LinkedIn: ${linkedinLink}</span>
            </div>
            <p>
                Once confirmed, we'll finalize your profile in our system, and you'll receive further instructions on how to get started with Healthkard.
            </p>
            <p>
                If you have any questions or need assistance, please don't hesitate to reach out to our support team.
            </p>
            <p>
                We're excited to have you on board and look forward to working together to make healthcare more accessible!
            </p>
            <p>Best regards,<br />The Healthkard Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Healthkard. All Rights Reserved.</p>
        </div>
    </div>
</body>

</html>
    `
}

module.exports = { socialMediaLinksAgentTemplate }