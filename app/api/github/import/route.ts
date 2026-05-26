import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/modules/auth/actions";
import { TemplateFolder, TemplateItem } from "@/modules/playground/lib/path-to-json";

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  ".vscode",
  ".idea",
  "coverage",
  ".env",
  ".env.local",
]);

const IGNORE_FILES = new Set([
  ".gitignore",
  ".env",
  ".env.local",
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
]);

const MAX_FILE_SIZE = 100 * 1024; // 100KB
const MAX_DEPTH = 3;

async function fetchRepoContents(
  owner: string,
  repo: string,
  path: string = "",
  depth: number = 0
): Promise<TemplateItem[]> {
  if (depth > MAX_DEPTH) return [];

  const url = `https://api.github.com/repos/${owner}/${repo}/contents${path ? `/${path}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const contents = await response.json();
    const items: TemplateItem[] = [];

    for (const item of contents) {
      // Skip ignored directories
      if (item.type === "dir" && IGNORE_DIRS.has(item.name)) {
        continue;
      }

      // Skip ignored files
      if (item.type === "file" && IGNORE_FILES.has(item.name)) {
        continue;
      }

      if (item.type === "dir") {
        try {
          const subItems = await fetchRepoContents(owner, repo, item.path, depth + 1);
          if (subItems.length > 0) {
            items.push({
              folderName: item.name,
              items: subItems,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch ${item.path}:`, error);
        }
      } else if (item.type === "file") {
        try {
          // Check file size first
          if (item.size && item.size > MAX_FILE_SIZE) {
            continue;
          }

          const fileResponse = await fetch(item.download_url);

          if (fileResponse.ok) {
            const content = await fileResponse.text();
            const ext = item.name.split(".").pop() || "txt";

            items.push({
              filename: item.name,
              fileExtension: ext,
              content: content,
            });
          }
        } catch (error) {
          console.error(`Failed to fetch file ${item.name}:`, error);
        }
      }
    }

    return items;
  } catch (error) {
    console.error("Error fetching repo contents:", error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user?.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const { owner, repo, projectName } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }

    // Fetch repository from GitHub API
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!repoResponse.ok) {
      return NextResponse.json(
        { error: "Repository not found on GitHub" },
        { status: 404 }
      );
    }

    const repoData = await repoResponse.json();

    // Create playground without template
    const playground = await db.playground.create({
      data: {
        title: projectName || repo,
        description: `GitHub: ${owner}/${repo}`,
        userId: user.id,
      },
    });

    // Fetch repo contents with size and depth limits
    const contents = await fetchRepoContents(owner, repo);

    const templateFolder: TemplateFolder = {
      folderName: repo,
      items: contents,
    };

    // Create template file with repo structure
    await db.templateFile.create({
      data: {
        playgroundId: playground.id,
        content: JSON.stringify(templateFolder),
      },
    });

    return NextResponse.json({
      success: true,
      playgroundId: playground.id,
    });
  } catch (error) {
    console.error("Error importing repository:", error);
    return NextResponse.json(
      {
        error:
          "Failed to import repository: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 }
    );
  }
}

