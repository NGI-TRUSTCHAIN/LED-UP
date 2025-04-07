'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { Menu, LogIn, LogOut } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import ConnectButton from './wallet-connect';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export function Header() {
  const { isAuthenticated, did, logout } = useAuth();
  const [isCopied, setIsCopied] = useState(false);
  const pathname = usePathname();

  if (pathname !== '/') {
    return <div />;
  }

  // Get first 6 and last 4 characters of DID for display
  const shortenedDid = did ? `${did.slice(0, 12)}...${did.slice(-4)}` : '';

  const handleCopyDid = () => {
    navigator.clipboard.writeText(did);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <header className="py-2 px-4 bg-gray-100 dark:bg-gray-800 border-b">
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
        <nav className="hidden md:flex space-x-4 items-center">
          {/* <Button variant="ghost" asChild>
            <Link href="/" className="text-lg uppercase">
              Home
            </Link>
          </Button> */}

          {isAuthenticated && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/dashboard" className="text-lg uppercase">
                  Dashboard
                </Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/patient-records" className="text-lg uppercase">
                  Patient Records
                </Link>
              </Button>
            </>
          )}

          <Button variant="ghost" asChild>
            <Link href="/hash-check" className="text-lg uppercase">
              More
            </Link>
          </Button>

          <Button variant="ghost" asChild>
            <Link href="/zokrates" className="text-lg uppercase">
              ZoKrates
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

          <ModeToggle />

          {!isAuthenticated ? (
            <>
              <ConnectButton />
              <Button asChild>
                <Link href="/auth/signin">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="bg-primary/10 text-primary rounded-full">
                <Button className="relative h-8 w-8 rounded-full border border-primary/50">
                  <Avatar className="h-7 w-7 bg-primary/10 text-2xl">
                    <AvatarFallback>{'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-44">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">Authenticated</p>
                    <p className="text-xs leading-none text-muted-foreground font-mono flex items-center justify-center">
                      {shortenedDid}
                      {!isCopied ? (
                        <Copy className="h-4 w-4 ml-2" onClick={handleCopyDid} />
                      ) : (
                        <CheckCheck className="h-4 w-4 text-green-500 ml-2" />
                      )}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/files">My Files</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/patient-data">Patient Data</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/compensation">Compensation</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/demo/ipfs">IPFS Demo</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col space-y-4 mt-6">
              <Link href="/" className="text-lg font-semibold uppercase">
                Home
              </Link>

              {isAuthenticated && (
                <>
                  <Link href="/dashboard" className="text-lg font-semibold">
                    Dashboard
                  </Link>
                  <Link href="/files" className="text-lg font-semibold">
                    My Files
                  </Link>
                  <Link href="/patient-data" className="text-lg font-semibold">
                    Patient Data
                  </Link>
                  <Link href="/compensation" className="text-lg font-semibold">
                    Compensation
                  </Link>
                </>
              )}

              <Link href="/hash-check" className="text-lg font-semibold">
                More
              </Link>

              <Link href="/zokrates" className="text-lg font-semibold">
                ZoKrates
              </Link>

              <Link href="https://led-up-docs.vercel.app/" className="text-lg font-semibold">
                Docs
              </Link>

              {!isAuthenticated ? (
                <Link href="/auth" className="text-lg font-semibold flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              ) : (
                <Button variant="ghost" onClick={logout} className="justify-start p-0">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span className="text-lg font-semibold">Log out</span>
                </Button>
              )}

              <div className="pt-4">
                <ModeToggle />
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
