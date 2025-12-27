import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateTokens, sanitizeUser } from '@/lib/auth'
import { AuthenticationError, ValidationError } from '@/lib/errors'
import type { LoginInput } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body: LoginInput = await request.json()

    const { email, password } = body

    if (!email || !password) {
      throw new ValidationError('Email and password are required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email')
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      throw new AuthenticationError('Invalid email or password')
    }

    const tokens = generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      success: true,
      data: {
        user: sanitizeUser(user),
        ...tokens,
      },
      message: 'Login successful',
    })

    return response
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'

    return NextResponse.json(
      { error: error.name || 'Error', message, statusCode },
      { status: statusCode }
    )
  }
}
