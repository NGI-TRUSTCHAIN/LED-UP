'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ViewModal = ({
  data,
  open,
  setOpen,
}: {
  data: object | null;
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
