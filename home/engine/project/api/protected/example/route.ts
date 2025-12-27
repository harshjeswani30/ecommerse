import { NextResponse } from 'next/server'
import { requireAuth, requireRole } from '@/lib/auth'
import { requireProductPermission, requireCategoryPermission } from '@/lib/rbac'
import type { AuthenticatedRequest } from '@/lib/middleware'

export async function GET(request: AuthenticatedRequest) {
  try {
    const user = request.user

    requireAuth(user)

    return NextResponse.json({
      success: true,
      data: {
        message: 'This is a protected route accessible to all authenticated users',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
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

export async function POST(request: AuthenticatedRequest) {
  try {
    const user = request.user

    requireAuth(user)

    const body = await request.json()
    const { action, categoryId } = body

    switch (action) {
      case 'add_product':
        requireProductPermission(user, 'add', categoryId)
        return NextResponse.json({
          success: true,
          data: { message: 'Product added successfully' },
        })

      case 'edit_product':
        requireProductPermission(user, 'edit', categoryId)
        return NextResponse.json({
          success: true,
          data: { message: 'Product updated successfully' },
        })

      case 'delete_product':
        requireProductPermission(user, 'delete', categoryId)
        return NextResponse.json({
          success: true,
          data: { message: 'Product deleted successfully' },
        })

      case 'manage_category':
        requireCategoryPermission(user, categoryId)
        return NextResponse.json({
          success: true,
          data: { message: 'Category managed successfully' },
        })

      default:
        return NextResponse.json(
          { error: 'ValidationError', message: 'Invalid action', statusCode: 400 },
          { status: 400 }
        )
    }
  } catch (error: any) {
    const statusCode = error.statusCode || 500
    const message = error.message || 'Internal server error'

    return NextResponse.json(
      { error: error.name || 'Error', message, statusCode },
      { status: statusCode }
    )
  }
}

export async function PUT(request: AuthenticatedRequest) {
  try {
    const user = request.user

    requireRole(user, ['OWNER', 'STAFF'])

    return NextResponse.json({
      success: true,
      data: {
        message: 'This route is only accessible to staff members',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.staffPermissions,
        },
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

export async function DELETE(request: AuthenticatedRequest) {
  try {
    const user = request.user

    requireRole(user, ['OWNER'])

    return NextResponse.json({
      success: true,
      data: {
        message: 'This route is only accessible to the owner',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
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
