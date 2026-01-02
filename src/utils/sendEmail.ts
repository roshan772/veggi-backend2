import nodemailer from "nodemailer";

export const sendEmail = async (options:{
    email: string;
    subject: string;
    message: string;
}) => {
    const transporter = nodemailer.createTransport({
      //configure mail server
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    }); 
    const mailOptions = {
        from: `"Veggi Support" <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    }
    await transporter.sendMail(mailOptions);
}