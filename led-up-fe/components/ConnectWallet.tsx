'use client';
import { useAccount } from 'wagmi';

import { Account } from './account';
import { Connect } from './connect';

export function ConnectWallet() {
  const { isConnected } = useAccount();
  return <div className="container">{isConnected ? <Account /> : <Connect />}</div>;
}
