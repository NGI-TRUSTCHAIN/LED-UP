'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Settings,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Calendar,
  Clock,
  FileText,
  Share2,
  Eye,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HealthRecord, ResourceType } from '../../types';
import { getResourceTypeName } from '../../utils/transformation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// Map resource types to icons and background colors
const resourceTypeConfig: Record<string, { icon: string; bg: string; gradient: string; accent: string }> = {
  Patient: {
    icon: '👤',
    bg: 'bg-blue-100 dark:bg-blue-900/20',
    gradient: 'from-blue-500 to-indigo-600',
    accent: 'border-blue-400 dark:border-blue-300/20',
  },
  Procedure: {
    icon: '🔬',
    bg: 'bg-purple-100 dark:bg-purple-900/20',
    gradient: 'from-purple-500 to-indigo-600',
    accent: 'border-purple-400 dark:border-purple-600',
  },
  Observation: {
    icon: '📊',
    bg: 'bg-green-100 dark:bg-green-900/20',
    gradient: 'from-green-500 to-emerald-600',
    accent: 'border-green-400 dark:border-green-600',
  },
  Medication: {
    icon: '💊',
    bg: 'bg-red-100 dark:bg-red-900/20',
    gradient: 'from-red-500 to-rose-600',
    accent: 'border-red-400 dark:border-red-600',
  },
  Condition: {
    icon: '🩺',
    bg: 'bg-yellow-100 dark:bg-yellow-900/20',
    gradient: 'from-yellow-500 to-amber-600',
    accent: 'border-yellow-400 dark:border-yellow-600',
  },
  AllergyIntolerance: {
    icon: '⚠️',
    bg: 'bg-orange-100 dark:bg-orange-900/20',
    gradient: 'from-orange-500 to-amber-600',
    accent: 'border-orange-400 dark:border-orange-600',
  },
  Immunization: {
    icon: '💉',
    bg: 'bg-teal-100 dark:bg-teal-900/20',
    gradient: 'from-teal-500 to-emerald-600',
    accent: 'border-teal-400 dark:border-teal-600',
  },
  DiagnosticReport: {
    icon: '📋',
    bg: 'bg-indigo-100 dark:bg-indigo-900/20',
    gradient: 'from-indigo-500 to-blue-600',
    accent: 'border-indigo-400 dark:border-indigo-600',
  },
  Encounter: {
    icon: '🏥',
    bg: 'bg-pink-100 dark:bg-pink-900/20',
    gradient: 'from-pink-500 to-rose-600',
    accent: 'border-pink-400 dark:border-pink-600',
  },
  CarePlan: {
    icon: '📝',
    bg: 'bg-cyan-100 dark:bg-cyan-900/20',
    gradient: 'from-cyan-500 to-blue-600',
    accent: 'border-cyan-400 dark:border-cyan-600',
  },
  MedicationRequest: {
    icon: '📑',
    bg: 'bg-amber-100 dark:bg-amber-900/20',
    gradient: 'from-amber-500 to-orange-600',
    accent: 'border-amber-400 dark:border-amber-600',
  },
  MedicationStatement: {
    icon: '💬',
    bg: 'bg-lime-100 dark:bg-lime-900/20',
    gradient: 'from-lime-500 to-green-600',
    accent: 'border-lime-400 dark:border-lime-600',
  },
  FamilyHistory: {
    icon: '👪',
    bg: 'bg-emerald-100 dark:bg-emerald-900/20',
    gradient: 'from-emerald-500 to-green-600',
    accent: 'border-emerald-400 dark:border-emerald-600',
  },
  SocialHistory: {
    icon: '🌐',
    bg: 'bg-sky-100 dark:bg-sky-900/20',
    gradient: 'from-sky-500 to-blue-600',
    accent: 'border-sky-400 dark:border-sky-600',
  },
  AdverseEvent: {
    icon: '🚨',
    bg: 'bg-rose-100 dark:bg-rose-900/20',
    gradient: 'from-rose-500 to-red-600',
    accent: 'border-rose-400 dark:border-rose-600',
  },
  Appointment: {
    icon: '📅',
    bg: 'bg-violet-100 dark:bg-violet-900/20',
    gradient: 'from-violet-500 to-purple-600',
    accent: 'border-violet-400 dark:border-violet-600',
  },
  Organization: {
    icon: '🏢',
    bg: 'bg-slate-100 dark:bg-slate-900/20',
    gradient: 'from-slate-500 to-gray-600',
    accent: 'border-slate-400 dark:border-slate-600',
  },
  Practitioner: {
    icon: '👨‍⚕️',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    gradient: 'from-gray-500 to-slate-600',
    accent: 'border-gray-400 dark:border-gray-600',
  },
  RelatedPerson: {
    icon: '👥',
    bg: 'bg-neutral-100 dark:bg-neutral-900/20',
    gradient: 'from-neutral-500 to-gray-600',
    accent: 'border-neutral-400 dark:border-neutral-600',
  },
  Location: {
    icon: '📍',
    bg: 'bg-stone-100 dark:bg-stone-900/20',
    gradient: 'from-stone-500 to-gray-600',
    accent: 'border-stone-400 dark:border-stone-600',
  },
  // Default for any other resource types
  default: {
    icon: '📄',
    bg: 'bg-gray-100 dark:bg-gray-900/20',
    gradient: 'from-gray-500 to-slate-600',
    accent: 'border-gray-400 dark:border-gray-600',
  },
};

interface HealthRecordCardProps {
  record: HealthRecord;
  ipfsData?: any;
  ipfsMetadata?: any;
  onClick?: () => void;
  onShare?: (record: HealthRecord) => void;
  onReveal?: (record: HealthRecord) => void;
}

export function HealthRecordCard({
  record,
  ipfsData,
  ipfsMetadata,
  onClick,
  onShare,
  onReveal,
}: HealthRecordCardProps) {
  const { resourceType, cid, isVerified, recordId } = record;
  const [isHovered, setIsHovered] = useState(false);

  // Get resource type name as string
  const resourceTypeName = getResourceTypeName(resourceType);

  // Get the configuration for this resource type, or use default if not found
  const config = resourceTypeConfig[resourceTypeName] || resourceTypeConfig.default;

  // Format the record ID for display (truncate if too long)
  const displayId =
    recordId.length > 20 ? `${recordId.substring(0, 8)}...${recordId.substring(recordId.length - 8)}` : recordId;

  // Format the CID for display
  const displayCid = cid.startsWith('ipfs://') ? cid.replace('ipfs://', '') : cid;

  const truncatedCid =
    displayCid.length > 20
      ? `${displayCid.substring(0, 8)}...${displayCid.substring(displayCid.length - 8)}`
      : displayCid;

  // Extract name or identifier from IPFS data if available
  const getDisplayName = () => {
    if (!ipfsData) return resourceTypeName;

    // Handle different resource types
    if (resourceTypeName === 'Patient' && ipfsData.name) {
      return `${ipfsData.name[0]?.given?.join(' ') || ''} ${ipfsData.name[0]?.family || ''}`.trim() || resourceTypeName;
    }

    if (
      (resourceTypeName === 'Observation' || resourceTypeName === 'Condition' || resourceTypeName === 'Procedure') &&
      ipfsData.code?.text
    ) {
      return ipfsData.code.text;
    }

    if (ipfsData.description) {
      return ipfsData.description;
    }

    if (ipfsData.title) {
      return ipfsData.title;
    }

    return resourceTypeName;
  };

  // Format the date for display
  const getFormattedDate = () => {
    const timestamp = record.updatedAt || (record as any).createdAt;
    if (!timestamp) return 'Unknown date';

    const date = new Date(timestamp * 1000);
    return format(date, 'MMM d, yyyy');
  };

  // Get a summary of data for the card
  const getDataSummary = () => {
    if (!ipfsData) return 'Click to view details';

    if (resourceTypeName === 'Patient') {
      const gender = ipfsData.gender ? `Gender: ${ipfsData.gender}` : '';
      const birthDate = ipfsData.birthDate ? `DOB: ${ipfsData.birthDate}` : '';
      return [gender, birthDate].filter(Boolean).join(' • ') || 'Patient demographics';
    }

    if (resourceTypeName === 'Observation' && ipfsData.valueQuantity) {
      return `${ipfsData.valueQuantity.value} ${ipfsData.valueQuantity.unit || ''}`;
    }

    if (resourceTypeName === 'Condition' && ipfsData.clinicalStatus) {
      return `Status: ${ipfsData.clinicalStatus.text || ipfsData.clinicalStatus.coding?.[0]?.display || 'Unknown'}`;
    }

    if (resourceTypeName === 'Procedure' && ipfsData.status) {
      return `Status: ${ipfsData.status}`;
    }

    return 'Click to view details';
  };

  // Handle button clicks with stopPropagation to prevent card click
  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.(record);
  };

  const handleRevealClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onReveal?.(record);
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
            background: isHovered
              ? `linear-gradient(135deg, ${config.bg}, ${config.bg})`
              : `linear-gradient(135deg, ${config.bg}, ${config.bg})`,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="text-2xl flex-shrink-0">{config.icon}</div>
            <div>
              <h3 className="font-semibold truncate max-w-[180px]">{getDisplayName()}</h3>
              <p className="text-xs text-muted-foreground">{resourceTypeName}</p>
            </div>
          </div>

          {isVerified ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Verified
                </Badge>
              </TooltipTrigger>
              <TooltipContent>This record has been verified by a trusted source</TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-destructive/20 text-destructive dark:bg-destructive/50 dark:text-destructive flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" /> Pending
                </Badge>
              </TooltipTrigger>
              <TooltipContent>This record is awaiting verification</TooltipContent>
            </Tooltip>
          )}
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          <div className="mb-4 flex-1">
            <p className="text-sm text-muted-foreground mb-1">{getDataSummary()}</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2 gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {getFormattedDate()}
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-auto">
            <span className="text-xs font-mono text-muted-foreground truncate max-w-[100px]" title={cid}>
              {truncatedCid}
            </span>

            <div className="flex space-x-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleShareClick} title="Share Record">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share</span>
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={handleRevealClick}
                title="Decrypt Data"
              >
                <Eye className="h-4 w-4" />
                <span className="sr-only">Decrypt</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={handleViewDetailsClick} title="View Details">
                More
                <ChevronRight className="h-4 w-4 ml-1" />
                <span className="sr-only">View Details</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
