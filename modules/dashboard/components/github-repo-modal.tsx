"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDown, AlertCircle } from "lucide-react";
import { useState } from "react";

type GitHubRepoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { repoUrl: string; projectName: string }) => void;
};

export const GitHubRepoModal = ({
  isOpen,
  onClose,
  onSubmit,
}: GitHubRepoModalProps) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");

  const validateGithubUrl = (url: string): boolean => {
    const githubUrlPattern =
      /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+(\.git)?\/?$/;
    return githubUrlPattern.test(url);
  };

  const handleSubmit = () => {
    setError("");

    if (!repoUrl.trim()) {
      setError("Repository URL is required");
      return;
    }

    if (!validateGithubUrl(repoUrl)) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    if (!projectName.trim()) {
      setError("Project name is required");
      return;
    }

    onSubmit({
      repoUrl: repoUrl.trim(),
      projectName: projectName.trim(),
    });

    // Reset form
    setRepoUrl("");
    setProjectName("");
    setError("");
  };

  const handleClose = () => {
    setRepoUrl("");
    setProjectName("");
    setError("");
    onClose();
  };

  const extractRepoName = (url: string) => {
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (match) {
      return match[2].replace(/\.git$/, "");
    }
    return "";
  };

  const handleRepoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setRepoUrl(url);
    if (!projectName) {
      const extracted = extractRepoName(url);
      if (extracted) {
        setProjectName(extracted);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#e93f3f] flex items-center gap-2">
            <ArrowDown size={24} className="text-[#e93f3f]" />
            Import GitHub Repository
          </DialogTitle>
          <DialogDescription>
            Enter your GitHub repository URL to import it into the editor
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="repo-url">Repository URL</Label>
            <Input
              id="repo-url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={handleRepoUrlChange}
              className={error && repoUrl ? "border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              e.g., https://github.com/vercel/next.js
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Input
              id="project-name"
              placeholder="my-project"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={error && projectName ? "border-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              Display name for your project
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle
                size={16}
                className="text-red-600 mt-0.5 flex-shrink-0"
              />
              <span className="text-sm text-red-600 dark:text-red-400">
                {error}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            className="bg-[#E93F3F] hover:bg-[#d03636] text-white"
            onClick={handleSubmit}
          >
            Import Repository
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
