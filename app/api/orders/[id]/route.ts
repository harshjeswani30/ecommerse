import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { NotFoundError, handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const orderId = context.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: { product: { include: { category: true } } },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.userId !== req.user.userId && req.user.role !== UserRole.OWNER) {
      throw new Error("Unauthorized to view this order");
    }

    return NextResponse.json(order);
  } catch (error) {
    return handleError(error);
  }
});
