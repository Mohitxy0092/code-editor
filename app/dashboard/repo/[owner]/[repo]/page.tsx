"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RepoPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(({ owner: o, repo: r }) => {
      setOwner(o);
      setRepo(r);
      importRepository(o, r);
    });
  }, [params]);

  const importRepository = async (owner: string, repo: string) => {
    try {
      const response = await fetch("/api/github/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner,
          repo,
          projectName: repo,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to import repository");
      }

      const data = await response.json();

      if (data.playgroundId) {
        // Redirect to the playground
        router.push(`/playground/${data.playgroundId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <h1 className="text-3xl font-bold text-red-500">Import Failed</h1>
        <p className="text-lg text-muted-foreground">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-[#e93f3f] text-white rounded hover:bg-[#d03636]"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold text-[#e93f3f]">
        Importing Repository
      </h1>
      <p className="text-lg text-muted-foreground">
        {owner}/{repo}
      </p>
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-[#e93f3f] rounded-full animate-bounce"></div>
        <div
          className="w-3 h-3 bg-[#e93f3f] rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-3 h-3 bg-[#e93f3f] rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
      <p className="text-sm text-muted-foreground mt-4">
        Setting up your repository...
      </p>
    </div>
  );
}
