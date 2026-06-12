import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/posts - Fetch all posts
export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        state: true,
        category: true,
        published: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        language: true,
        readTimeMinutes: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('GET /api/admin/posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

// POST /api/admin/posts - Create a new post
export async function POST(req: NextRequest) {
  try {
    const { title, slug, content, imageUrl, category, language } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        imageUrl: imageUrl || null,
        category: category || 'Local',
        language: language || 'es',
        published: false,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/posts:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

// DELETE /api/admin/posts - Delete a post
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('DELETE /api/admin/posts:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
