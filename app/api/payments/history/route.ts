import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";
import { validatePaginationParams } from "@/lib/validation";
import { UserRole } from "@prisma/client";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const status = searchParams.get("status") as "COMPLETED" | "FAILED" | "PENDING" | undefined;
    const { page, limit } = validatePaginationParams(
      searchParams.get("page") || undefined,
      searchParams.get("limit") || undefined
    );

    // Build where clause
    let whereClause: any = {};

    if (req.user.role !== UserRole.OWNER) {
      whereClause.userId = req.user.userId;
    }

    if (status) {
      whereClause.paymentStatus = status;
    }

    // Get payment history
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        select: {
          id: true,
          orderNumber: true,
          paymentStatus: true,
          razorpayPaymentId: true,
          razorpayOrderId: true,
          total: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    // Format response
    const paymentHistory = orders.map((order) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: order.total,
      paymentStatus: order.paymentStatus,
      razorpayPaymentId: order.razorpayPaymentId,
      razorpayOrderId: order.razorpayOrderId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json({
      data: paymentHistory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
});
