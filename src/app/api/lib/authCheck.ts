import { auth } from '@component/auth';
import { NextResponse } from 'next/server';

export async function checkAuth() {
    const session = await auth();  // Your session checking logic here

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return session;
}
