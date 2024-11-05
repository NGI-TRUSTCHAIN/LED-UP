'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileUploadWithConsent } from '@/components/new-upload';
import { AnimatePresence } from 'framer-motion';

const UploadModal = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  return (
    <AnimatePresence>
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogTrigger asChild>
          <Button>Upload New File</Button>
        </DialogTrigger>
        <DialogContent className="w-[1024px]">
          <DialogHeader>
            <DialogTitle>Upload a New File</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mt-8">
              <TabsTrigger value="upload">Upload File</TabsTrigger>
              <TabsTrigger value="download">Download File</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="min-h-[400px] ">
              <Card>
                <CardContent className="space-y-2">
                  <FileUploadWithConsent />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="download" className="h-[400px]">
              <Card>
                <CardHeader>
                  <CardTitle>Download a File</CardTitle>
                  <CardDescription>Enter the file hash to download.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="fileHash">File Hash</Label>
                    <Input id="fileHash" placeholder="Enter file hash" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Download</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  );
};

export default UploadModal;
