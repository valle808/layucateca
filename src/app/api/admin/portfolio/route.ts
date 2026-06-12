import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/portfolio - Fetch all portfolio items
export async function GET(req: NextRequest) {
  try {
    const items = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('GET /api/admin/portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio items' }, { status: 500 });
  }
}

// POST /api/admin/portfolio - Create a new portfolio item
export async function POST(req: NextRequest) {
  try {
    const { title, slug, description, imageUrl, liveUrl, price } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        slug,
        description,
        imageUrl: imageUrl || null,
        liveUrl: liveUrl || null,
        price: price ? parseFloat(price) : null,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('POST /api/admin/portfolio:', error);
    return NextResponse.json({ error: 'Failed to create portfolio item' }, { status: 500 });
  }
}

// PUT /api/admin/portfolio - Update a portfolio item
export async function PUT(req: NextRequest) {
  try {
    const { id, title, slug, description, imageUrl, liveUrl, price, published } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Portfolio item ID is required' }, { status: 400 });
    }

    const item = await prisma.portfolioItem.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(description && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(liveUrl !== undefined && { liveUrl }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(published !== undefined && { published }),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('PUT /api/admin/portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio item' }, { status: 500 });
  }
}

// DELETE /api/admin/portfolio - Delete a portfolio item
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Portfolio item ID is required' }, { status: 400 });
    }

    await prisma.portfolioItem.delete({ where: { id } });

    return NextResponse.json({ message: 'Portfolio item deleted' });
  } catch (error) {
    console.error('DELETE /api/admin/portfolio:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio item' }, { status: 500 });
  }
}
