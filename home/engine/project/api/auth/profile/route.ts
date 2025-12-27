import { NextResponse } from 'next/server'
import { getUserFromToken, extractTokenFromHeader } from '@/lib/auth'
import { AuthenticationError, ValidationError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import type { AuthenticatedRequest } from '@/lib/middleware'

export async function PUT(request: AuthenticatedRequest) {
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

    const body = await request.json()
    const { name, phone, profilePicture } = body

    if (name !== undefined && name.length < 2) {
      throw new ValidationError('Name must be at least 2 characters', 'name')
    }

    if (phone !== undefined && phone.length > 20) {
      throw new ValidationError('Phone number is too long', 'phone')
    }

    const updateData: Record<string, any> = {}

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone || null
    if (profilePicture !== undefined) updateData.profilePicture = profilePicture

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
      },
      message: 'Profile updated successfully',
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
