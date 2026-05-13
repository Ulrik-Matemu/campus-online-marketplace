import nodemailer from 'nodemailer';

export const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  // Use Mailtrap (for testing) or Gmail (for production)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"Campus Ecommerce" <noreply@campus.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<b>${options.message}</b>`, // You can use HTML templates here
  };

  await transporter.sendMail(mailOptions);
};