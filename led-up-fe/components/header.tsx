import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import ConnectButton from './wallet-connect';

export function Header() {
  return (
    <header className="py-4 px-4 bg-gray-100 dark:bg-gray-800 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-2 p-1">
          <Image
            src="/logo.png"
            alt="LED-UP Logo"
            width={32}
            height={32}
            className="bg-gray-100/5 dark:bg-gray-100/40 rounded-xl"
          />
          <span className="text-xl font-bold logo">LED-UP</span>
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/" className="text-lg uppercase">
              Home
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/files" className="text-lg uppercase">
              Files
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/patient-data" className="text-lg uppercase">
              Patient Data
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/hash-check" className="text-lg uppercase">
              More
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link
              href="https://led-up-docs.vercel.app/"
              target="_blank"
              rel="noopener"
              prefetch
              className="text-lg uppercase"
            >
              Docs
            </Link>
          </Button>
          {/* <Button variant="ghost" asChild>
            <Link href="#features">Features</Link>
          </Button> */}
          {/* <Button variant="ghost" asChild>
            <Link href="#pricing">Pricing</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="#contact">Contact</Link>
          </Button> */}
          <ConnectButton />
          <ModeToggle />
        </nav>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-lg font-semibold uppercase">
                Home
              </Link>
              <Link href="/files" className="text-lg font-semibold">
                My Files
              </Link>
              <Link href="#features" className="text-lg font-semibold">
                Features
              </Link>
              <Link href="#pricing" className="text-lg font-semibold">
                Pricing
              </Link>
              <Link href="#contact" className="text-lg font-semibold">
                Contact
              </Link>
              <ModeToggle />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
