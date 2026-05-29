"use client";

import { useEffect } from "react";

export const dynamic = "force-dynamic";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
          <h2 className="mb-4 text-4xl font-bold text-red-600">
            Something went wrong!
          </h2>
          <p className="mb-8 text-lg text-slate-300">
            A critical error occurred in the application.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-full bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
