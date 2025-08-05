export default function Test() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-green-600 mb-4">✅ App is working!</h1>
        <p className="text-gray-600">This is a test page to verify the application loads correctly.</p>
        <div className="mt-4">
          <a href="/login" className="text-blue-500 hover:underline mr-4">Go to Login</a>
          <a href="/dashboard" className="text-blue-500 hover:underline">Go to Dashboard</a>
        </div>
      </div>
    </div>
  )
}