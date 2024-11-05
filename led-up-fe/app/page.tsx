import { Button } from '@/components/ui/button';
import { Features } from '@/components/features';
import Link from 'next/link';
import { Spotlight } from '@/components/Spotlight';
import BackgroundDots from '@/components/background-dots';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="relative px-4 text-center bg-gradient-to-r from-cyan-600/60 via-cyan-900/80 to-cyan-600/60 py-24">
          {/* <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20 z-10" fill="white" /> */}
          <BackgroundDots className="-z-10" />
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-10 flex flex-col gap-1 xl:gap-2">
            <span>Secure Health Data Transaction </span>
            <span>with Blockchain & IPFS</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-8">
            Share your files securely using cutting-edge technology with LED-UP
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button
              size="lg"
              className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto py-6 px-12 font-bold rounded-xl shadow-2xl"
              asChild
            >
              <Link href="https://led-up-docs.vercel.app/" target="_blank" prefetch>
                Get Started
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-foreground hover:bg-gray-200 dark:hover:bg-background/80 w-full md:w-auto py-6 px-12 font-bold rounded-xl"
              asChild
            >
              <Link href="/files">View My Files</Link>
            </Button>
          </div>
        </section>

        <Features />
      </main>
    </div>
  );
}
