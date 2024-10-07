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
