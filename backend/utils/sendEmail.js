const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const message = {
    from: `XT-Fashion Store <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html // Nếu bạn muốn gửi mail đẹp bằng HTML
  };

  await transporter.sendMail(message);
};

module.exports = sendEmail;