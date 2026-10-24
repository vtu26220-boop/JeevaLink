import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';

interface ExternalLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceName: string;
  resourcePurpose: string;
  targetUrl: string;
  isOfficialRegistry?: boolean;
}

export const ExternalLinkModal: React.FC<ExternalLinkModalProps> = ({
  isOpen,
  onClose,
  resourceName,
  resourcePurpose,
  targetUrl,
  isOfficialRegistry = true,
}) => {
  const handleProceed = () => {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="External Official Resource Redirect"
      subtitle="You are now leaving the JeevaLink platform"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg text-[#155EEF] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#101828] text-sm">{resourceName}</h4>
              {isOfficialRegistry && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#16A34A]">
                  Verified Official
                </span>
              )}
            </div>
            <p className="text-xs text-[#667085] mt-1">{resourcePurpose}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 text-xs text-amber-800 space-y-1.5">
          <p className="font-semibold text-amber-900">Important Advisory:</p>
          <p>
            Official organ pledges, legally binding donor cards, and official transplant waiting lists
            are maintained exclusively by designated government health authorities (such as NOTTO /
            SOTTO under the Ministry of Health, Govt. of India).
          </p>
          <p>
            JeevaLink does not collect legal consent documents or allocate organs.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#667085] hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-md shadow-blue-500/20 transition-all"
          >
            <span>Proceed to Official Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
