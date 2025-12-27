# RAJ FASHION - E-Commerce SaaS Platform

A full-stack e-commerce SaaS application built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

- Multi-role user system (Owner, Staff, Customer)
- Product management with categories and inventory
- Shopping cart and order management
- Coupon and discount system
- Staff permission management
- Multi-address support
- Order tracking and status management

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (to be implemented)

## Project Structure

```
raj-fashion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable React components
├── lib/                   # Utilities and helpers
│   └── prisma.ts         # Prisma client instance
├── prisma/               # Database schema and migrations
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── .env.local.example    # Environment variables template

```

## Database Schema

### Models

1. **User** - User accounts with roles (Owner, Staff, Customer)
2. **Category** - Product categories with subcategory support
3. **Product** - Products with variants (sizes, colors), pricing, and inventory
4. **Order** - Customer orders with status tracking
5. **OrderItem** - Individual items in an order
6. **Cart** - Shopping cart for customers
7. **CartItem** - Items in the shopping cart
8. **Coupon** - Discount coupons with usage tracking
9. **Address** - Customer delivery addresses
10. **StaffPermission** - Granular permissions for staff members

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd raj-fashion
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT authentication
- `NEXT_PUBLIC_API_URL`: Your API URL (http://localhost:3000 for development)

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Generate Prisma Client:
```bash
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations
- `npx prisma generate` - Generate Prisma Client

## Database Management

### View Database with Prisma Studio

```bash
npx prisma studio
```

### Create a New Migration

```bash
npx prisma migrate dev --name <migration-name>
```

### Reset Database

```bash
npx prisma migrate reset
```

## Environment Variables

Required environment variables (see `.env.local.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `NEXT_PUBLIC_API_URL` - Public API URL

## API Routes

API routes are located in the `app/api` directory and follow Next.js App Router conventions.

### Planned Endpoints

- `/api/auth` - Authentication (login, register, logout)
- `/api/products` - Product CRUD operations
- `/api/categories` - Category management
- `/api/cart` - Shopping cart operations
- `/api/orders` - Order management
- `/api/users` - User management
- `/api/coupons` - Coupon management

## User Roles

### OWNER
- Full system access
- Can manage all products, categories, and staff
- Access to all administrative functions

### STAFF
- Limited access based on assigned permissions
- Can manage assigned product categories
- Permissions controlled via StaffPermission model

### CUSTOMER
- Can browse products
- Add items to cart
- Place and track orders
- Manage addresses

## Development Roadmap

- [ ] Implement authentication (JWT)
- [ ] Create API routes for all models
- [ ] Build admin dashboard
- [ ] Develop customer-facing pages
- [ ] Add image upload functionality
- [ ] Implement payment gateway integration
- [ ] Add email notifications
- [ ] Create order tracking system
- [ ] Build analytics dashboard
- [ ] Add search and filtering
- [ ] Implement product reviews

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[Add your license here]

## Support

For support, email support@rajfashion.com or create an issue in the repository.
