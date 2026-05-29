import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function authenticateAdmin() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value ?? '';
    
    if (!token) return false;
    
    try{
        jwt.verify(token, process.env.adminJwtSecret || '');
        return true;
    } catch {
        return false;
    }
}