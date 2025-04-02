'use client';

import { Button } from '@/components/ui/button';
// import { Features } from '@/components/features';
import Link from 'next/link';
// import { Spotlight } from '@/components/Spotlight';
import BackgroundDots from '@/components/background-dots';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { Features } from '@/components/features';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <section className="relative px-4 text-center bg-gradient-to-r from-cyan-600/60 via-cyan-900/80 to-cyan-600/60 py-24">
          <BackgroundDots className="-z-10" />
          <h1 className="text-3xl md:text-4xl xl:text-5xl font-bold text-white mb-10 flex flex-col gap-1 xl:gap-2">
            <span>Secure Health Data Transaction </span>
            <span>with Decentralized Identity & Blockchain</span>
          </h1>
          <p className="text-lg md:text-xl text-white mb-8">
            Authenticate with DID and share your files securely using cutting-edge technology
          </p>
          <div className="space-y-4 md:space-y-0 md:space-x-4">
            {isAuthenticated ? (
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto py-6 px-12 font-bold rounded-xl shadow-2xl"
                asChild
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 w-full md:w-auto py-6 px-12 font-bold rounded-xl shadow-2xl"
                asChild
              >
                <Link href="/auth/signin">Authenticate with DID</Link>
              </Button>
            )}

            <Button
              size="lg"
              variant="outline"
              className="text-foreground hover:bg-gray-200 dark:hover:bg-background/80 w-full md:w-auto py-6 px-12 font-bold rounded-xl"
              asChild
            >
              <Link href="https://led-up-docs.vercel.app/" target="_blank" prefetch>
                Learn More
              </Link>
            </Button>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">DID Authentication</h2>
            <p className="max-w-2xl mx-auto text-muted-foreground">
              Secure your health data with Decentralized Identifiers (DIDs). Our platform uses challenge-response
              authentication to verify your identity without storing passwords.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-card rounded-lg p-6 shadow-md">
              <div className="text-primary text-4xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground">Connect your Ethereum wallet to begin the authentication process.</p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md">
              <div className="text-primary text-4xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Sign Challenge</h3>
              <p className="text-muted-foreground">
                Sign a secure challenge with your private key to prove ownership of your DID.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 shadow-md">
              <div className="text-primary text-4xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Access Secured Data</h3>
              <p className="text-muted-foreground">
                Once authenticated, securely access and share your health data using blockchain.
              </p>
            </div>
          </div>
        </section>

        <Features />
      </main>
    </div>
  );
}
