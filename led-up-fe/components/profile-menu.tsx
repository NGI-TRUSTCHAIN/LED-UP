'use client';
import { CheckCheck, Copy, LogIn, LogOut } from 'lucide-react';
import React, { useState } from 'react';
// import ConnectButton from './wallet-connect';
import { Button } from './ui/button';
import { useAuth } from '@/features/auth/contexts/auth-provider';
import { Avatar, AvatarFallback } from './ui/avatar';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

// const ProfileMenu = ({ side = 'right' }: { side?: 'left' | 'right' | 'bottom' | 'top' }) => {
const ProfileMenu = () => {
  const { isAuthenticated, did, logout } = useAuth();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyDid = () => {
    navigator.clipboard.writeText(did);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  // Get first 6 and last 4 characters of DID for display
  const shortenedDid = did ? `${did.slice(0, 12)}...${did.slice(-4)}` : '';

  // Get the avatar fallback (first letter of the DID)
  const avatarFallback = did ? did.charAt(did.lastIndexOf(':') + 1).toUpperCase() : 'G';

  return (
    <div className="absolute bottom-5">
      {!isAuthenticated ? (
        <Tooltip>
          <TooltipTrigger asChild>
            {/* <ConnectButton /> */}
            <Button asChild>
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Login</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger
            asChild
            className="hover:bg-destructive/10 hover:text-destructive hover:border hover:border-b-4 hover:border-r-4 hover:border-destructive/50 hover:border-b-destructive rounded mx-1"
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="bg-primary/10 text-primary rounded-full">
                <Button className="relative h-10 w-10 rounded-full border border-primary/50">
                  <Avatar className="h-9 w-9 bg-primary/10 text-2xl">
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
                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="right">Profile</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default ProfileMenu;
