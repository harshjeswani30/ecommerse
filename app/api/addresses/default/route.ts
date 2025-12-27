import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const address = await prisma.address.findFirst({
      where: {
        userId: req.user.userId,
        isDefault: true,
      },
    });

    if (!address) {
      const anyAddress = await prisma.address.findFirst({
        where: { userId: req.user.userId },
      });

      return NextResponse.json(anyAddress || null);
    }

    return NextResponse.json(address);
  } catch (error) {
    return handleError(error);
  }
});

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { addressId } = await req.json();

    if (!addressId) {
      throw new Error("addressId is required");
    }

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new Error("Address not found");
    }

    if (address.userId !== req.user.userId) {
      throw new Error("Unauthorized to set this address as default");
    }

    await prisma.$transaction([
      prisma.address.updateMany({
        where: {
          userId: req.user.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      prisma.address.update({
        where: { id: addressId },
        data: {
          isDefault: true,
        },
      }),
    ]);

    const updatedAddress = await prisma.address.findUnique({
      where: { id: addressId },
    });

    return NextResponse.json(updatedAddress);
  } catch (error) {
    return handleError(error);
  }
});
