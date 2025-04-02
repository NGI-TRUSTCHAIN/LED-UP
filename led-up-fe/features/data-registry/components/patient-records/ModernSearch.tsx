import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const ModernSearch = ({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
}: {
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}) => {
  /* 
  
  
         <div className="relative w-full max-w-[320px]">
          <SearchIcon className="absolute left-2 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-8 ring-0"
            type="search"
            placeholder={t('patients.filter.placeholder')}
            aria-label={t('patients.filter.aria-label')}
            value={(table.getColumn('firstName')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('firstName')?.setFilterValue(event.target.value)}
          />
        </div>*/
  return (
    <div className="flex items-center">
      {showSearch ? (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: '300px', opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="rounded-full relative h-10"
        >
          <Input
            type="text"
            placeholder="  Search records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-full px-10 h-full w-full border-2 focus-visible:ring-offset-0 border-none focus:border-2 focus:border-primary"
            autoFocus
          />

          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => {
              setSearchQuery('');
              setShowSearch(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      ) : (
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => setShowSearch(true)}>
          <Search className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ModernSearch;
