import {NextRequest, NextResponse} from 'next/server';
import {env} from "../../../../env";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  const {adminMail, adminPassword} = await request.json();
  console.log('Received login attempt for', adminMail);
    if (adminMail !== env.adminMail) {
        return NextResponse.json({message: 'Invalid email or password'}, {status: 401});
    }

    const decodedHash = Buffer.from(env.adminPassword, 'base64').toString();
    console.log('Comparing password with hash:', { 
        receivedPassword: adminPassword,
        decodedHash: decodedHash,
        hashLength: decodedHash?.length 
    });
    const isPasswordValid = await bcrypt.compare(adminPassword, decodedHash);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
        return NextResponse.json({message: 'Invalid email or password'}, {status: 401});
    }
    console.log('Admin logged in successfully');

    const token = jwt.sign({ sub: adminMail, role: 'admin' }, env.adminJwtSecret, { expiresIn: '1d' });

    const res = NextResponse.json({message: 'Login successful'}, {status: 200});
    res.cookies.set({
        name: 'admin-token',
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 6 //6 hours
    });
    return res;
}