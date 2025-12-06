'use client';
import React from 'react';
import Link from 'next/link';

export default function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-pink-100 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-9xl font-extrabold text-red-600">500</h1>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Internal Server Error
          </h2>
          <p className="mt-2 text-gray-600">
            Something went wrong on our end. We&apos;re working to fix it.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Go to Home
          </Link>
          
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Try Again
          </button>
        </div>

        <div className="mt-8">
          <p className="text-sm text-gray-500">
            If this problem persists, please{' '}
            <a
              href="mailto:support@alumni-system.com"
              className="text-red-600 hover:text-red-500 font-medium"
            >
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
