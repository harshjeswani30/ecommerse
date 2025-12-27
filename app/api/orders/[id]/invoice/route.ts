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
          include: { product: true },
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
      throw new Error("Unauthorized to view this invoice");
    }

    const address = await prisma.address.findUnique({
      where: { id: order.deliveryAddressId },
    });

    const invoice = {
      orderNumber: order.orderNumber,
      invoiceDate: order.createdAt,
      orderDate: order.createdAt,
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
      },
      billingAddress: address,
      items: order.orderItems.map((item) => ({
        productId: item.productId,
        productName: item.product?.name || "Unknown Product",
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        pricePerUnit: Number(item.priceAtPurchase),
        total: Number(item.priceAtPurchase) * item.quantity,
      })),
      summary: {
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        taxRate: 18,
        discount: Number(order.discount),
        total: Number(order.total),
      },
      payment: {
        method: order.paymentMethod,
        status: order.paymentStatus,
      },
      status: order.status,
    };

    return NextResponse.json(invoice);
  } catch (error) {
    return handleError(error);
  }
});
