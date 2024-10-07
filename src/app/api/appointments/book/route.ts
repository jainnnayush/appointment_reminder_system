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

        console.log("Creating appointment...");
        const appointment = await prisma.appointment.create({
            data: {
              appointment_time: appointmentDate,
              patientId:user.id,
              doctorId: doctorId,
            },
        });
        console.log("About to call queueNotification...");
        queueNotification(appointment);
        console.log("notification added to queue");
        return NextResponse.json(appointment,{status:201});

    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}