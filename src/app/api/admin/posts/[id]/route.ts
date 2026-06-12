import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH /api/admin/posts/[id] - Update post fields
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    const post = await prisma.post.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('PATCH /api/admin/posts/[id]:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// GET /api/admin/posts/[id] - Get single post
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error('GET /api/admin/posts/[id]:', error);
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
}
