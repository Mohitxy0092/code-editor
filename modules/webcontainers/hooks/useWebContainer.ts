import { useState, useEffect, useCallback, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface UseWebContainerProps {
  templateData: TemplateFolder;
}

interface UseWebContaierReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destory: () => void;
}

let sharedWebContainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export const useWebContainer = ({
  templateData,
}: UseWebContainerProps): UseWebContaierReturn => {
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    async function initializeWebContainer() {
      try {
        // Reuse existing instance if available
        if (sharedWebContainerInstance) {
          if (mountedRef.current) {
            setInstance(sharedWebContainerInstance);
            setIsLoading(false);
          }
          return;
        }

        // Wait for existing boot promise if already booting
        if (bootPromise) {
          const webcontainerInstance = await bootPromise;
          if (mountedRef.current) {
            setInstance(webcontainerInstance);
            setIsLoading(false);
          }
          return;
        }

        // Boot new instance
        bootPromise = WebContainer.boot();
        const webcontainerInstance = await bootPromise;

        if (!mountedRef.current) return;

        sharedWebContainerInstance = webcontainerInstance;
        setInstance(webcontainerInstance);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer:", error);
        bootPromise = null;
        if (mountedRef.current) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize WebContainer"
          );
          setIsLoading(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }

      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");

        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true });
        }

        await instance.fs.writeFile(path, content);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, err);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [instance]
  );

  const destory = useCallback(() => {
    if (instance) {
      instance.teardown();
      sharedWebContainerInstance = null;
      bootPromise = null;
      setInstance(null);
      setServerUrl(null);
    }
  }, [instance]);

  return { serverUrl, isLoading, error, instance, writeFileSync, destory };
};
