import { BookOpenIcon, EyeIcon, LockIcon, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { decrypt } from '@/utils/decrypt';
import ViewModal from '@/app/patient-data/modal';
import { useState } from 'react';

const ResourceCard = ({
  icon,
  resourceName,
  signature,
  cidLink,
  cid,
  iconBg,
  progress,
  total,
  label,
  onClick,
}: any) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<object | null>(null);

  const getEncrypted = async () => {
    const res = await fetch(cidLink);
    const file = await res.json();
    setData(file);
    setOpen(true);
  };

  const getFile = async () => {
    const res = await fetch(cidLink);
    const file = await res.json();
    const decrypted = await decrypt(file);

    setOpen(true);
    setData(decrypted);
  };
  return (
    <Card className="cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-full ${iconBg} flex items-center justify-center text-2xl`}>{icon}</div>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
        <h3 className="font-semibold mb-1">{resourceName}</h3>
        <div className="text-sm font-bold mb-2 max-w-[90%] truncate font-mono">{signature}</div>
        {progress !== undefined && <Progress value={progress} className="h-2 mb-2" />}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <button
            type="button"
            aria-label="Open"
            onClick={() => {
              let data = { something: 'something' };
              onClick(data);
            }}
            className="flex items-center gap-2 border rounded-full py-0.5 px-2 bg-green-100 text-green-600 hover:bg-green-200 hover:border-green-600"
          >
            <BookOpenIcon className="w-4 h-4" /> Open
          </button>
          <button
            type="button"
            aria-label="View"
            onClick={getEncrypted}
            className="flex items-center gap-2 border rounded-full px-2 py-0.5 bg-primary/20 text-primary hover:bg-primary/10 hover:border-primary"
          >
            <LockIcon className="w-4 h-4" /> Encrypted
          </button>
          <button
            type="button"
            aria-label="View"
            onClick={getFile}
            className="flex items-center gap-2 border py-0.5 px-2 bg-red-100 text-red-600  hover:bg-red-200 hover:border-red-600 rounded-full"
          >
            <EyeIcon className="w-4 h-4" /> Reveal
          </button>

          <ViewModal data={data} open={open} setOpen={setOpen} />
          {total && <span>{total}</span>}
          {label && <span>{label}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
