<div align="center">
  <h1 align="center">Appointment Management System</h3>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🤸 [Quick Start](#quick-start)
4. 🕸️ [Snippets](#snippets)
5. 🔗 [Images](#Images)
6. 🔋 [ApiDocumentation](#ApiDocumentation)

## <a name="introduction">🤖 Introduction</a>

The Notification-Based Appointment Reminder System is a backend application designed to manage patient appointments and send automated email reminders to patients prior to their scheduled appointments. Built using Next.js with Prisma for database management and Redis with BullMQ for handling job queues, this system allows users to securely register and book appointments, while ensuring timely notifications through email reminders.

## <a name="tech-stack">⚙️ Tech Stack</a>

- Next.js
- Typescript
- PostgreSQL
- Redis
- BullMQ
- Nodemailer

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally on your machine.

**Prerequisites**

Make sure you have the following installed on your machine:

- [Next.js](https://nextjs.org/docs)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Redis](https://redis.io/try-free/)
- [Git](https://git-scm.com/downloads)

**Cloning the Repository**

```bash
git clone https://github.com/yourusername/appointment-reminder-system.git
cd appointment-reminder-system
```

**Installation**

Install the project dependencies using npm:

```bash
npm install
```

**Set Up Environment Variables**

Create a new file named `.env` in the root of your project and add the following content:

```env
# Database connection URL (PostgreSQL)
DATABASE_URL=your_postgresql_connection_url

# JWT Secret for token generation
JWT_SECRET=your_jwt_secret

# Redis configuration
REDIS_URL=redis://default:redis_password@redis_host:redis_port
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_PASSWORD=your_redis_password

# Mail server configuration (SMTP)
MAIL_HOST=your_smtp_host
MAIL_PORT=your_smtp_port
MAIL_USER=your_smtp_user
MAIL_PASSWORD=your_smtp_password
```

Replace the placeholder values with your actual credentials. You can obtain these credentials by signing up on these specific websites.
**Running the Project**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the project.

## <a name="snippets">🕸️ Snippets</a>

<details>
<summary><code>users.register.ts</code></summary>

```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../../prisma/db';

export const POST = async (req: Request) => {
  const { name, email, password, role } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ message: 'User already exists' }, { status: 400 });
  }
   
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });


  return NextResponse.json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  }, { status: 201 });
};

```

</details>

<details>
<summary><code>users.login.ts</code></summary>

```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../../../../prisma/db';

export const POST = async (req: Request) => {
  const { email, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '1d' });

  return NextResponse.json({ token }, { status: 200 });
};
```

</details>

<details>
<summary><code>Appointment.ts</code></summary>

```typescript
import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/db";
import { authenticateJWT } from "@/utils/authMiddleware";
import queueNotification  from "@/services/NotificationService";

export const POST = async(req:Request) => {
    try {
        const user = authenticateJWT(req);
        if(!user){
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }
        const {doctorId,appointment_time}= await req.json();
        if(!doctorId || !appointment_time){
            return NextResponse.json({message : 'Doctor Id and appointment time are required'}, {status : 400});
        }

        const appointmentDate= new Date(appointment_time);
        
        if(appointmentDate<=new Date()){
            return NextResponse.json({message : 'Appointment time must be in future'},{ status:400 });
        }

        const doctor = await prisma.user.findUnique({ where: { id: doctorId } });

        if (!doctor || doctor.role !== 'doctor') {
            return NextResponse.json({ message: 'Doctor not found or not valid' }, { status: 404 });
        }
        
        const conflictingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId: doctorId,
                appointment_time: appointmentDate,
            },
        });

        if (conflictingAppointment) {
            return NextResponse.json({ message: 'Doctor is not available at the requested time' }, { status: 409 });
        }

        const appointment = await prisma.appointment.create({
            data: {
              appointment_time: appointmentDate,
              patientId:user.id,
              doctorId: doctorId,
            },
        });
        console.log("About to call queueNotification");
        queueNotification(appointment);
        
        return NextResponse.json(appointment,{status:201});

    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
```

</details>

<details>
<summary><code>emailService.ts</code></summary>

```typescript
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
```

</details>

<details>
<summary><code>NotificationService.ts</code></summary>

```typescript
import prisma from "../../prisma/db";
import { Appointment } from "@prisma/client";
import { sendEmail} from "./emailService";
import { Queue,Worker, Job } from "bullmq";
import redisClient from "@/config/redis";

const notificationQueue = new Queue('notifications',{ connection :redisClient});


const queueNotification = (appointment:Appointment) => {
    console.log("Appointment details:", appointment);

    const appointmentTime=new Date(appointment.appointment_time);
    const reminderTime=appointmentTime.getTime()- 2*60*60*1000;

    notificationQueue.add('sendReminder',{appointment},{
        delay:reminderTime-Date.now(),
        attempts:3,
        backoff:10000,
    }).then(() =>{
        console.log("Notification succesfully added to the queue");
    }).catch((error)=>{
        console.error("Error adding notification to the queue", error);
    });
};
const worker = new Worker('notifications', async(job:Job) =>{
    if(job.name==='sendReminder'){
        const {appointment}=job.data;
        try {
            const patient = await prisma.user.findUnique({where:{id:appointment.patientId}});

            if(!patient){
                console.error(`Patient not found for appointment ID:${appointment.id}`);
                throw new Error('Patient not found');
            }

            await sendEmail(patient.email,'Appointment Reminder', `Your appointment is scheduled for ${appointment.appointment_time}`);
            console.log(`Reminder sent to ${patient.email} for appointment ID: ${appointment.id}`);
        } catch (error) {
            console.error(`Error sending reminder for appointment ID: ${appointment.id}`, error);
            throw error;
        }
    }

},{connection:redisClient});


worker.on('completed', (job: Job) => {
    console.log(`Job with ID ${job.id} completed successfully!`);
});
worker.on('active', (job: Job) => {
    console.log(`Job with ID ${job.id} is now being processed.`);
});
worker.on('paused', () => {
    console.log('Worker has been paused.');
});

worker.on('resumed', () => {
    console.log('Worker has been resumed.');
});

worker.on('drained', () => {
    console.log('All jobs have been processed.');
});

worker.on('error', (error: Error) => {
    console.error('Worker Error:', error);
});

export default queueNotification;
```

</details>

## <a name="Images">🔗 Images</a>

Mail Proof can be [here](https://drive.google.com/drive/folders/1MYtBm1dsM8saMb3EriJfrRJcLJ3yvrq_?usp=sharing)


#
## <a name="ApiDocumentation">🔋 ApiDocumentation</a>

Link can be found [here](https://documenter.getpostman.com/view/38825740/2sAXxP9Xm8)


#
