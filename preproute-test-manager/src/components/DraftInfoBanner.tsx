import { Info } from 'lucide-react';
import { MESSAGES } from '@/constants/messages';

export function DraftInfoBanner() {
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <div className="mb-2 flex items-center gap-2 font-semibold">
        <Info className="h-4 w-4 shrink-0" />
        {MESSAGES.test.draftInfoTitle}
      </div>
      <ul className="list-inside list-disc space-y-1 text-amber-900/90">
        <li>{MESSAGES.test.draftInfoWhat}</li>
        <li>{MESSAGES.test.draftInfoSave}</li>
        <li>{MESSAGES.test.draftInfoNext}</li>
        <li>{MESSAGES.test.draftInfoPublish}</li>
      </ul>
    </div>
  );
}
