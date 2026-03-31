import { cn } from "@/lib/utils";
import { Footer } from "@/modules/home/footer";
import { Header } from "@/modules/home/header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "VibeCode - Editor ",
    default: "Code Editor For VibeCoders - VibeCode",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {/* ✅ GRID BACKGROUND */}
      <div
        className={cn(
          "fixed inset-0 -z-10",
          "[background-size:40px_40px]",
          "[background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />

      {/* ✅ RADIAL FADE OVERLAY */}
      <div className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black" />

      {/* ✅ MAIN CONTENT */}
      <main className="relative z-10 w-full">
        {children}
      </main>

      <Footer />
    </>
  );
}