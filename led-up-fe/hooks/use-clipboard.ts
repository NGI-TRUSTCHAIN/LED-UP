'use client';

import { useCallback, useState } from 'react';

/**
 * A hook for copying text to the clipboard
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Reset after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopied(false);
      return false;
    }
  }, []);

  return { copied, copy };
}
