export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-6xl font-bold text-gray-900">
          RAJ FASHION
        </h1>
        <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
          Full-Stack E-Commerce SaaS Platform
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Multi-Role System</h3>
            <p className="text-gray-600">Owner, Staff, and Customer roles with granular permissions</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Product Management</h3>
            <p className="text-gray-600">Comprehensive catalog with categories, variants, and inventory</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Order Tracking</h3>
            <p className="text-gray-600">Complete order lifecycle from cart to delivery</p>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-3xl font-semibold text-gray-800">Tech Stack</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="px-4 py-2 bg-black text-white rounded-full">Next.js 14</span>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-full">TypeScript</span>
            <span className="px-4 py-2 bg-teal-600 text-white rounded-full">Prisma</span>
            <span className="px-4 py-2 bg-blue-800 text-white rounded-full">PostgreSQL</span>
            <span className="px-4 py-2 bg-cyan-500 text-white rounded-full">Tailwind CSS</span>
          </div>
        </div>

        <div className="mt-12">
          <p className="text-lg text-gray-500">
            ✅ Project initialized successfully
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Check the README.md for setup instructions
          </p>
        </div>
      </div>
    </div>
  );
}
