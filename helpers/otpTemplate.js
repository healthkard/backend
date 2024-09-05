function otpTemplate(userName, otpCode) {

  return (
    `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Healthkard OTP Verification</title>
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

      .otp {
        font-size: 1.5em;
        color: #303486;
        margin: 20px 0;
        text-align: center;
      }

      .anchor {
        text-decoration: none;
        font-weight: bold;
        color: #303486;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="header">
        <h1>Healthkard</h1>
      </div>
      <div class="content">
        <h2>Your OTP for Verification</h2>
        <p>Dear ${userName},</p>
        <p>
          Thank you for choosing Healthkard. Your One-Time Password (OTP) for
          verification is:
        </p>
        <div class="otp">
          <strong>${otpCode || '1234'}</strong>
        </div>
        <p>
          Please enter this OTP in the app to complete your verification
          process. By entering the OTP, you agree to our<a
            class="anchor"
            href="https://firebasestorage.googleapis.com/v0/b/healthkard.appspot.com/o/Healthkard%20Hospital%20TCs.pdf?alt=media&token=2f6dda0a-9081-4e4f-8db4-26b878cc1dda"
            >Terms and Conditions</a
          >
          .
        </p>

        <h2>About Healthkard</h2>
        <p>
          Healthkard has a clear objective: to provide hassle-free access to
          physical doctor consultations. Our main agenda is to create a single
          card called Healthkard, that allows people to visit multiple doctors
          associated with us and multiple times for just INR 99.
        </p>
        <p>
          The user will receive a unique Healthkard ID, which securely
          identifies personal details, preventing any misuse of the card. We are
          committed to making healthcare affordable and accessible to all by
          setting a fixed price of INR 99 for physical doctor consultations.
          This way, we remove financial barriers and ensure that everyone can
          receive the care they need.
        </p>
        <p>
          Healthkard also encourages regular check-ups and preventive care. Our
          goal is to revolutionize the way people approach healthcare by
          providing a convenient and cost-effective solution. We want to empower
          individuals to prioritize their health and seek timely medical advice.
          So, if you need to visit a doctor in our country, we’re here to
          provide you with Healthkard.
        </p>

        <p>
          Thank you for trusting us with your health. We look forward to serving
          you!
        </p>
      </div>
      <div class="footer">
        <p>&copy; 2024 Healthkard. All Rights Reserved.</p>
      </div>
    </div>
  </body>
</html>

`)
}
module.exports = { otpTemplate };