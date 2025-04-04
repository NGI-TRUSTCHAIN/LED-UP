'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, ChevronRight, Eye, LockOpen, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { Address } from 'viem';

// Map access level to icons and background colors
const accessLevelConfig: Record<number, { icon: string; bg: string; gradient: string; accent: string; label: string }> =
  {
    1: {
      icon: '🔎',
      bg: 'bg-blue-100 dark:bg-blue-900/20',
      gradient: 'from-blue-500 to-indigo-600',
      accent: 'border-blue-400 dark:border-blue-300/20',
      label: 'View Only',
    },
    2: {
      icon: '🔍',
      bg: 'bg-green-100 dark:bg-green-900/20',
      gradient: 'from-green-500 to-emerald-600',
      accent: 'border-green-400 dark:border-green-600',
      label: 'View & Search',
    },
    3: {
      icon: '📊',
      bg: 'bg-purple-100 dark:bg-purple-900/20',
      gradient: 'from-purple-500 to-indigo-600',
      accent: 'border-purple-400 dark:border-purple-600',
      label: 'Analytics',
    },
    4: {
      icon: '📝',
      bg: 'bg-amber-100 dark:bg-amber-900/20',
      gradient: 'from-amber-500 to-orange-600',
      accent: 'border-amber-400 dark:border-amber-600',
      label: 'Edit',
    },
    5: {
      icon: '🔄',
      bg: 'bg-red-100 dark:bg-red-900/20',
      gradient: 'from-red-500 to-rose-600',
      accent: 'border-red-400 dark:border-red-600',
      label: 'Full Access',
    },
    // Default for any other access level
    0: {
      icon: '🔒',
      bg: 'bg-gray-100 dark:bg-gray-900/20',
      gradient: 'from-gray-500 to-slate-600',
      accent: 'border-gray-400 dark:border-gray-600',
      label: 'Unknown',
    },
  };

interface SharedRecord {
  recordId: string;
  consumer: Address;
  consumerDid: string;
  expiration: bigint;
  accessLevel: number;
  isRevoked: boolean;
  isExpired: boolean;
  revokedBy?: Address;
  grantedAt: Date;
  revokedAt?: Date;
  ipfsData?: any;
}

interface SharedRecordCardProps {
  record: SharedRecord;
  onClick?: () => void;
  onAccessData?: (record: SharedRecord) => void;
  onRevokeAccess?: (record: SharedRecord) => void;
}

export function SharedRecordCard({ record, onClick, onAccessData, onRevokeAccess }: SharedRecordCardProps) {
  const { recordId, accessLevel, expiration, isRevoked, isExpired, grantedAt } = record;
  const [isHovered, setIsHovered] = useState(false);

  // Get the configuration for this access level, or use default if not found
  const config = accessLevelConfig[accessLevel] || accessLevelConfig[0];

  // Format the record ID for display (truncate if too long)
  const displayId =
    recordId.length > 20 ? `${recordId.substring(0, 8)}...${recordId.substring(recordId.length - 8)}` : recordId;

  // Format the expiration date for display
  const formatExpiration = () => {
    if (isExpired) return 'Expired';
    if (isRevoked) return 'Revoked';

    const expirationDate = new Date(Number(expiration) * 1000);
    const now = new Date();

    // If expiration is within 7 days, show relative time
    if (expirationDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return `Expires ${formatDistanceToNow(expirationDate, { addSuffix: true })}`;
    }

    return `Expires on ${format(expirationDate, 'MMM d, yyyy')}`;
  };

  // Get access status badge
  const getAccessStatusBadge = () => {
    if (isRevoked) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Revoked
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Access to this record has been revoked</TooltipContent>
        </Tooltip>
      );
    }

    if (isExpired) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Expired
            </Badge>
          </TooltipTrigger>
          <TooltipContent>Access to this record has expired</TooltipContent>
        </Tooltip>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1">
            <LockOpen className="h-3 w-3" /> Active
          </Badge>
        </TooltipTrigger>
        <TooltipContent>You have active access to this record</TooltipContent>
      </Tooltip>
    );
  };

  // Handle button clicks with stopPropagation to prevent card click
  const handleAccessDataClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccessData?.(record);
  };

  const handleRevokeAccessClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRevokeAccess?.(record);
  };

  const handleViewDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5 }}
    >
      <Card
        className={`overflow-hidden border-l-4 ${
          config.accent
        } transition-shadow duration-300 cursor-pointer h-full flex flex-col ${
          isHovered ? 'shadow-md dark:shadow-muted/10' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        <div
          className={`p-5 relative border-b flex justify-between items-start`}
          style={{
            background: `linear-gradient(135deg, ${config.bg}, ${config.bg})`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="text-2xl flex-shrink-0">{config.icon}</div>
            <div>
              <h3 className="font-semibold truncate max-w-[180px]">{displayId}</h3>
              <p className="text-xs text-muted-foreground">Access Level: {config.label}</p>
            </div>
          </div>

          {getAccessStatusBadge()}
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="mb-4 flex-1">
            <p className="text-sm text-muted-foreground mb-1">{formatExpiration()}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2 gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {`Shared on ${format(grantedAt, 'MMM d, yyyy')}`}
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-xs font-mono text-muted-foreground">Level {accessLevel}</span>

            <div className="flex items-center justify-end space-x-2 mt-2">
              {!isRevoked && !isExpired && (
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleAccessDataClick}
                        title="Access Data"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Access</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Access Data</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleRevokeAccessClick}
                        title="Revoke Access"
                      >
                        <Lock className="h-4 w-4" />
                        <span className="sr-only">Revoke</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Revoke Access</TooltipContent>
                  </Tooltip>
                </div>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={handleViewDetailsClick}
                    title="View Details"
                  >
                    More
                    <ChevronRight className="h-4 w-4 ml-1" />
                    <span className="sr-only">View Details</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Details</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
