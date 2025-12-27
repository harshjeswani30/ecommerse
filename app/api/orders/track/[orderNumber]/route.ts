import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrderTimeline } from "@/lib/orderHelpers";
import { NotFoundError, handleError } from "@/lib/errors";

export async function GET(req: Request, context: any) {
  try {
    const orderNumber = context.params.orderNumber;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
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

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const address = await prisma.address.findUnique({
      where: { id: order.deliveryAddressId },
    });

    const timeline = getOrderTimeline(order);

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        discount: Number(order.discount),
        total: Number(order.total),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
      items: order.orderItems,
      deliveryAddress: address,
      timeline,
    });
  } catch (error) {
    return handleError(error);
  }
}
