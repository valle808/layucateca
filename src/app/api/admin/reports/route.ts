import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET - Fetch reports/analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Fetch data based on type
    const data: any = {};

    if (type === "users" || type === "all") {
      data.totalUsers = await prisma.user.count();
      data.usersThisMonth = await prisma.user.count({
        where: { createdAt: dateFilter.gte ? { gte: dateFilter.gte } : undefined },
      });
      data.adminUsers = await prisma.user.count({
        where: { role: "ADMIN" },
      });
    }

    if (type === "content" || type === "all") {
      data.totalPosts = await prisma.post.count();
      data.publishedPosts = await prisma.post.count({ where: { published: true } });
      data.draftPosts = await prisma.post.count({ where: { published: false } });
      data.totalPortfolioItems = await prisma.portfolioItem.count();
      data.publishedPortfolio = await prisma.portfolioItem.count({ where: { published: true } });
      data.totalComments = await prisma.comment.count();
      data.totalReports = await prisma.report.count();
    }

    if (type === "performance" || type === "all") {
      const postViews = await prisma.post.aggregate({
        _sum: { views: true },
        _avg: { views: true },
      });
      data.totalPostViews = postViews._sum?.views || 0;
      data.avgPostViews = Math.round(postViews._avg?.views || 0);
      data.topPost = await prisma.post.findFirst({
        orderBy: { views: "desc" },
        select: { title: true, views: true },
      });
    }

    if (type === "system" || type === "all") {
      // System metrics (simulated - in production, collect real metrics)
      data.systemHealth = {
        status: "healthy",
        uptime: Math.floor(process.uptime() / 3600),
        cpuUsage: Math.random() * 50,
        memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
      };
    }

    // Recent snapshots
    const snapshots = await prisma.reportSnapshot.findMany({
      orderBy: { timestamp: "desc" },
      take: 30,
      where: dateFilter.gte
        ? { timestamp: { gte: dateFilter.gte, ...(dateFilter.lte && { lte: dateFilter.lte }) } }
        : undefined,
    });

    return NextResponse.json({ data, snapshots });
  } catch (error: any) {
    console.error("Reports GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a snapshot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.post.count();
    const publishedPosts = await prisma.post.count({ where: { published: true } });
    const totalReports = await prisma.report.count();
    const totalComments = await prisma.comment.count();

    const snapshot = await prisma.reportSnapshot.create({
      data: {
        type: type || "manual",
        totalUsers,
        activeUsers: Math.max(1, Math.floor(totalUsers * 0.3)),
        totalPosts,
        publishedPosts,
        totalReports,
        totalComments,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
        uptime: Math.floor(process.uptime() / 3600),
      },
    });

    return NextResponse.json({ snapshot }, { status: 201 });
  } catch (error: any) {
    console.error("Reports POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
