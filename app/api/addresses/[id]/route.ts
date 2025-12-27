import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { validateAddress } from "@/lib/validation";
import { NotFoundError, handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const addressId = context.params.id;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    if (address.userId !== req.user.userId) {
      throw new Error("Unauthorized to view this address");
    }

    return NextResponse.json(address);
  } catch (error) {
    return handleError(error);
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const addressId = context.params.id;

    const body = await req.json();
    const validatedData = validateAddress(body);

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    if (address.userId !== req.user.userId) {
      throw new Error("Unauthorized to update this address");
    }

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.userId,
          id: { not: addressId },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        street: validatedData.street,
        city: validatedData.city,
        state: validatedData.state,
        pincode: validatedData.pincode,
        isDefault: validatedData.isDefault,
      },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    return handleError(error);
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest, context: any) => {
  try {
    const addressId = context.params.id;

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    if (address.userId !== req.user.userId) {
      throw new Error("Unauthorized to delete this address");
    }

    const addressCount = await prisma.address.count({
      where: { userId: req.user.userId },
    });

    if (addressCount <= 1) {
      throw new Error("Cannot delete the only address");
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    return NextResponse.json({ message: "Address deleted successfully" });
  } catch (error) {
    return handleError(error);
  }
});
