import nodemailer from 'nodemailer';

const EMAIL_HOST = process.env.EMAIL_HOST || 'host';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER || 'user';
const EMAIL_PASS = process.env.EMAIL_PASS || 'pass';

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: false,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
},
{from: `Email helper <${EMAIL_USER}>`});

export default transporter;