'use client';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome to Solar Project Manager</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <ul className="space-y-2">
            <li>
              <a href="/test" className="text-primary hover:underline">
                Project Wizard Test
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
