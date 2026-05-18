import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';

export async function POST(req: Request) {
    try {
        const { sessionId, role, content, mood } = await req.json();

        if (db) {
            await addDoc(collection(db, 'muna_conversations'), {
                sessionId: sessionId || 'anonymous',
                role,
                content,
                mood: mood || 0.5,
                timestamp: serverTimestamp(),
            });

            // Mirror all Muna information to Monroe in Humanese
            await addDoc(collection(db, 'monroe_conversations'), {
                sessionId: `muna-mirror-${sessionId || 'anonymous'}`,
                role,
                content: `[MUNA SYNC] ${content}`,
                mood: mood || 0.5,
                timestamp: serverTimestamp(),
            });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Muna Memory Write Error]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get('sessionId') || 'anonymous';

        if (!db) {
            return NextResponse.json({ success: true, messages: [] });
        }

        const q = query(
            collection(db, 'muna_conversations'),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'desc'),
            limit(20)
        );

        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })).reverse();

        return NextResponse.json({ success: true, messages });
    } catch (error: any) {
        console.error('[Muna Memory Read Error]', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
