import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { validateUpdateOrderStatus } from "@/lib/validation";
import { restoreStock } from "@/lib/orderHelpers";
import { OrderStatus, UserRole } from "@prisma/client";
import { NotFoundError, handleError } from "@/lib/errors";

export const PUT = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const orderId = context.params.id;

    if (req.user.role !== UserRole.OWNER) {
      throw new Error("Only owners can update order status");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const body = await req.json();
    const validatedData = validateUpdateOrderStatus(body);

    if (validatedData.status === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
      await restoreStock(orderId);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: validatedData.status as OrderStatus,
      },
      include: {
        orderItems: {
          include: { product: { include: { category: true } } },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return handleError(error);
  }
});
