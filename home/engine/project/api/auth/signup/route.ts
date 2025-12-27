import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateTokens, sanitizeUser } from '@/lib/auth'
import { ValidationError, ConflictError } from '@/lib/errors'
import type { SignupInput } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body: SignupInput = await request.json()

    const { email, password, name, phone } = body

    if (!email || !password || !name) {
      throw new ValidationError('Email, password, and name are required')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email')
    }

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters', 'password')
    }

    if (name.length < 2) {
      throw new ValidationError('Name must be at least 2 characters', 'name')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new ConflictError('Email already registered')
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        role: 'CUSTOMER',
      },
    })

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
      message: 'Registration successful',
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
