import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const sendMail = async ({ to, subject, html }) => {
  var transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: Number(process.env.MAILTRAP_PORT),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });

  await transport.sendMail({
    from :"helllo@musicapp.com",
    to,
    subject,
    html
  })
};
export default sendMail;
