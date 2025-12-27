import { NextResponse } from 'next/server'
import { getUserFromToken, extractTokenFromHeader, sanitizeUser } from '@/lib/auth'
import { AuthorizationError, AuthenticationError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import type { AuthenticatedRequest } from '@/lib/middleware'

export async function GET(request: AuthenticatedRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader || undefined)

    if (!token) {
      throw new AuthenticationError('No token provided')
    }

    const user = await getUserFromToken(token)

    if (!user) {
      throw new AuthenticationError('User not found')
    }

    if (user.role !== 'CUSTOMER') {
      throw new AuthorizationError('Access denied. Customer access required')
    }

    const customer = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        addresses: true,
        cart: {
          include: {
            items: true,
          },
        },
      },
    })

    if (!customer) {
      throw new AuthenticationError('Customer not found')
    }

    return NextResponse.json({
      success: true,
      data: {
        user: sanitizeUser(customer),
        addresses: customer.addresses,
        cartItemCount: customer.cart?.items.length || 0,
      },
    })
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'

    return NextResponse.json(
      { error: error.name || 'Error', message, statusCode },
      { status: statusCode }
    )
  }
}
