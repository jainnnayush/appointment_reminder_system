import prisma from "../../prisma/db";
import { Appointment } from "@prisma/client";
import { sendEmail} from "./emailService";
import { Queue,Worker, Job } from "bullmq";
import redisClient from "@/config/redis";

const notificationQueue = new Queue('notifications',{ connection :redisClient});

console.log("redis connection done onto queueing notif");

const queueNotification = (appointment:Appointment) => {
    console.log("function called");
    console.log("Appointment details:", appointment);

    const appointmentTime=new Date(appointment.appointment_time);
    const reminderTime=appointmentTime.getTime()- 2*60*60*1000;

    notificationQueue.add('sendReminder',{appointment},{
        delay:0,//reminderTime-Date.now(),
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

// Optionally, listen for any errors emitted by the worker
worker.on('error', (error: Error) => {
    console.error('Worker Error:', error);
});

export default queueNotification;