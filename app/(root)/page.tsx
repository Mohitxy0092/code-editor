import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 pt-24 text-center">

      <div className="flex flex-col items-center gap-6">
        <Image
          src="/hero.svg"
          alt="Hero-Section"
          width={400}
          height={400}
          priority
          className="object-contain"
        />

        <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 tracking-tight leading-tight">
          Vibe Code With Intelligence
        </h1>
      </div>

      <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
        VibeCode Editor is a powerful and intelligent code editor that enhances
        your coding experience with advanced features and seamless integration.
        It helps you write, debug, and optimize your code efficiently.
      </p>

      <Link href="/dashboard" className="mt-8">
        <Button size="lg" className="flex items-center gap-2">
          Get Started
          <ArrowUpRight className="w-4 h-4" />
        </Button>
      </Link>

    </main>
  );
}