export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Predis
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Social Predictions & Betting
        </p>
        <p className="text-gray-500 dark:text-gray-400">
          Create predictions about real-life events and bet virtual coins with friends
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </a>
          <a
            href="/docs"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Learn More
          </a>
        </div>
        <div className="pt-8 text-sm text-gray-400">
          🚀 Currently in development
        </div>
      </div>
    </main>
  );
}
