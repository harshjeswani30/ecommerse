import { NextResponse } from "next/server";
import { withAuth, AuthenticatedRequest } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { validateAddress } from "@/lib/validation";
import { handleError } from "@/lib/errors";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user.userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    return handleError(error);
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = validateAddress(body);

    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: req.user.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.userId,
        fullName: validatedData.fullName,
        phone: validatedData.phone,
        street: validatedData.street,
        city: validatedData.city,
        state: validatedData.state,
        pincode: validatedData.pincode,
        isDefault: validatedData.isDefault,
      },
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
});
