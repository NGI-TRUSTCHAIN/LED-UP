'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EyeIcon } from 'lucide-react';

const ViewModal = ({ data }: { data: object }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  return (
    <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} className="gap-2 bg-transparent">
          <EyeIcon className="w-4 h-4" />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[1024px] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Data Content</DialogTitle>
        </DialogHeader>
        <div className="max-w-full px-2 py-2 overflow-hidden">
          <pre className="w-full overflow-auto bg-blue-950 text-white rounded py-3 px-3">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewModal;
