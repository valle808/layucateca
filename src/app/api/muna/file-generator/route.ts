import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

async function buildFile(filename: string, content: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const lower = filename.toLowerCase();

    if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
        const rtfContent = content.replace(/\n/g, '\\par\n');
        const rtf = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\f0\\fs24 ' + rtfContent + '}';
        return { buffer: Buffer.from(rtf, 'utf-8'), mimeType: 'application/msword' };
    }

    const mimeMap: Record<string, string> = {
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.html': 'text/html',
        '.md': 'text/markdown',
        '.xlsx': 'text/csv',
        '.txt': 'text/plain',
        '.js': 'text/plain',
        '.ts': 'text/plain',
        '.sh': 'text/plain',
    };
    const ext = Object.keys(mimeMap).find(e => lower.endsWith(e));
    return { buffer: Buffer.from(content, 'utf-8'), mimeType: ext ? mimeMap[ext] : 'text/plain' };
}

export async function GET(req: NextRequest) {
    const filename = req.nextUrl.searchParams.get('filename') || 'file.txt';
    const b64 = req.nextUrl.searchParams.get('b64');
    const rawContent = req.nextUrl.searchParams.get('content');

    let content = '';
    if (b64) {
        content = Buffer.from(decodeURIComponent(b64), 'base64').toString('utf-8');
    } else if (rawContent) {
        content = decodeURIComponent(rawContent);
    }

    try {
        const { buffer, mimeType } = await buildFile(filename, content);
        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store',
            },
        });
    } catch (err: any) {
        console.error('[file-generator GET] Error:', err.message);
        return new NextResponse('File generation failed: ' + err.message, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        let filename = '';
        let content: string | undefined = undefined;

        const contentType = req.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            const body = await req.json();
            filename = body.filename;
            content = body.content;
        } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            filename = formData.get('filename') as string;
            content = formData.get('content') as string;
        }

        if (!filename || content === undefined) {
            return new NextResponse('Missing params', { status: 400 });
        }
        const { buffer, mimeType } = await buildFile(filename, content);
        return new NextResponse(new Uint8Array(buffer), {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (err: any) {
        console.error('[file-generator POST] Error:', err.message);
        return new NextResponse('File generation failed: ' + err.message, { status: 500 });
    }
}
