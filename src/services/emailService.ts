import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const transporter = nodemailer.createTransport({
    host:process.env.MAIL_HOST,
    port:process.env.MAIL_PORT,
    secure:process.env.NODE_ENV !== 'development',
    auth:{
        user:process.env.MAIL_USER,
        pass:process.env.MAIL_PASSWORD
    },
} as SMTPTransport.Options);

export const sendEmail = async(to :string, subject:string,body:string)=>{
    try {
        await transporter.sendMail({
            from:process.env.MAIL_USER,
            to:to,
            subject: subject,
            html:body,
        });
        console.log(`Email sent succesfully to ${to}`);
    } catch (error) {
        console.log(error);
        console.error(`Failed to send email to ${to}`);
        throw new Error(`Failed to send email to ${to}`);
    }
};
