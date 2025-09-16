
import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-gray-500">Sorry, this page could not be found.</p>
      <Link href="/" className="mt-4 text-blue-600 underline">Go Home</Link>
    </div>
  );
}
