'use client';

import { Phone, Mail, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

interface TimelineItemProps {
  date: string;
  label: string;
  title: string;
  content: string;
  action?: string;
}

function VerticalTimeline01({ items }: { items: TimelineItemProps[] }) {
  return (
    <div className={`${caveat.variable} -my-6`}>
      {items.map((item, index) => (
        <div key={index} className="relative pl-8 sm:pl-32 py-6 group">
          <div className="flex flex-col sm:flex-row items-start mb-1 group-last:before:hidden before:absolute before:left-2 sm:before:left-0 before:h-full before:px-px before:bg-slate-300 sm:before:ml-[6.5rem] before:self-start before:-translate-x-1/2 before:translate-y-3 after:absolute after:left-2 sm:after:left-0 after:w-2 after:h-2 after:bg-indigo-600 after:border-4 after:box-content after:border-slate-50 after:rounded-full sm:after:ml-[6.5rem] after:-translate-x-1/2 after:translate-y-1.5">
            <time className="sm:absolute left-0 translate-y-0.5 inline-flex items-center justify-center text-xs font-semibold uppercase w-20 h-6 mb-3 sm:mb-0 text-emerald-600 bg-emerald-100 rounded-full">
              {item.date}
            </time>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{item.title}</div>
          </div>
          <div className="text-slate-500">{item.content}</div>
          {item.action && (
            <Button variant="link" className="text-blue-600 mt-2 p-0">
              {item.action}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}

function ResourceModal({ isOpen, onClose, tracker }: any) {
  if (!tracker) return null;

  const timelineItems: TimelineItemProps[] = [
    {
      date: 'Mar 16',
      label: 'Routine',
      title: 'Routine follow up',
      content:
        'Routine follow up about medicine and physio (PHM Bot). Patient skipped multiple medications in the last one week.',
      action: 'View Chat',
    },
    {
      date: 'Mar 12',
      label: 'Visit',
      title: 'Patient visited for knee pain',
      content:
        'Patient visited for knee pain and was prescribed the following medication by Bernard Kester, MD:\n• Ibuprofen 5 mg daily twice for 5 days\n• Naproxen 25 mg daily twice for 5 days',
      action: 'Visit History',
    },
    {
      date: 'Mar 11',
      label: 'Complaint',
      title: 'Patient complained of pain',
      content: 'Patient complained of increase in pain. An appointment was created with Bernard Kester, MD.',
      action: 'Visit Chat',
    },
    {
      date: 'Mar 04',
      label: 'Follow-up',
      title: 'Post surgery follow up',
      content: 'Melissa Alexander called the patient for post surgery follow up. Patient reported everything normal.',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:min-w-[1024px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>PW</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl font-bold">Peter Williamson, 57Y, M</DialogTitle>
                <p className="text-sm text-gray-500">Jul 23, 1967 | PID0023456</p>
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Discharged on Nov 15, 2021</span>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Currently at home
            </span>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button className="flex-1">
              <Phone className="w-4 h-4 mr-2" />
              Call
            </Button>
            <Button className="flex-1" variant="outline">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button className="flex-1" variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
        <Tabs defaultValue="timeline" className="mt-6">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="metrics">Engagement Metrics</TabsTrigger>
            <TabsTrigger value="notes">Current Notes</TabsTrigger>
            <TabsTrigger value="history">Visit History</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-4">
            <VerticalTimeline01 items={timelineItems} />
          </TabsContent>
          <TabsContent value="metrics">Engagement Metrics content</TabsContent>
          <TabsContent value="notes">Current Notes content</TabsContent>
          <TabsContent value="history">Visit History content</TabsContent>
          <TabsContent value="documents">Documents content</TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ResourceModal;
