
import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface DateRange {
  startDate: string;
  endDate: string;
  label: string;
}

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  loading?: boolean;
}

const presets = [
  {
    label: 'Últimos 7 dias',
    value: 7,
  },
  {
    label: 'Últimos 30 dias',
    value: 30,
  },
  {
    label: 'Últimos 90 dias',
    value: 90,
  },
];

const DateRangeFilter = ({ selectedRange, onRangeChange, loading }: DateRangeFilterProps) => {
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handlePresetSelect = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const range: DateRange = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      label: `Últimos ${days} dias`
    };
    
    onRangeChange(range);
    setShowCustom(false);
  };

  const handleCustomApply = () => {
    if (customStartDate && customEndDate) {
      const range: DateRange = {
        startDate: customStartDate,
        endDate: customEndDate,
        label: `${customStartDate} - ${customEndDate}`
      };
      onRangeChange(range);
      setShowCustom(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading} className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">{selectedRange.label}</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.value}
              onClick={() => handlePresetSelect(preset.value)}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => setShowCustom(true)}>
            Período personalizado
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showCustom && (
        <Popover open={showCustom} onOpenChange={setShowCustom}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm">
              Personalizar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Data inicial</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Data final</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
              <Button onClick={handleCustomApply} className="w-full">
                Aplicar
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default DateRangeFilter;
