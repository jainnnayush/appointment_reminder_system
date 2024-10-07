import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    pool: true,
    service: 'hotmail',
    host: 'smtp.office365.com', 
    port: 587, 
    secure: false, 
    auth: {
        user: process.env.USER, 
        pass: process.env.PASSWORD, 
    },
    maxConnections: 1,
});

export const sendEmail = async(to :string, subject:string,body:string)=>{
    try {
        await transporter.sendMail({
            from:process.env.USER,
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
