import { NextResponse } from 'next/server'
import { verifyToken, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { AuthenticationError, ValidationError } from '@/lib/errors'
import type { JWTPayload } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required')
    }

    let payload: JWTPayload
    try {
      payload = verifyToken(refreshToken)
    } catch {
      throw new AuthenticationError('Invalid or expired refresh token')
    }

    const newAccessToken = generateAccessToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })

    const newRefreshToken = generateRefreshToken({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    })

    return NextResponse.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      message: 'Token refreshed successfully',
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
