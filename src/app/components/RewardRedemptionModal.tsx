import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/app/components/ui/dialog';
import { Button } from '@/app/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';

interface RewardRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rewardName: string;
  pointsSpent: number;
  newBalance: number;
}

export function RewardRedemptionModal({ isOpen, onClose, rewardName, pointsSpent, newBalance }: RewardRedemptionModalProps) {
  const navigate = useNavigate();

  const handleGoToDashboard = () => {
    onClose();
    navigate('/');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-2xl overflow-hidden p-0 bg-white">
        <AnimatePresence>
          {isOpen && (
            <div className="flex flex-col items-center text-center p-6 pt-10 pb-8">
              {/* Success Icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm"
              >
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </motion.div>

              {/* Title & Description */}
              <DialogHeader className="mb-6 space-y-2 w-full flex flex-col items-center">
                <DialogTitle className="text-2xl font-bold text-slate-900 text-center">Reward Successfully Claimed</DialogTitle>
                <DialogDescription className="text-slate-500 text-center text-base">
                  You've successfully redeemed <br/>
                  <span className="font-semibold text-slate-800">"{rewardName}"</span>
                </DialogDescription>
              </DialogHeader>

              {/* Points Summary */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full bg-slate-50 rounded-xl p-5 border border-slate-100 mb-8"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-slate-500 text-sm font-medium">Points Deducted</span>
                  <span className="font-bold text-red-500">-{pointsSpent.toLocaleString()}</span>
                </div>
                <div className="w-full h-px bg-slate-200 mb-3"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">New Balance</span>
                  <span className="font-bold text-slate-900 text-lg">{newBalance.toLocaleString()} pts</span>
                </div>
              </motion.div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3">
                <Button 
                  onClick={handleGoToDashboard} 
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-blue-200 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onClose} 
                  className="w-full h-11 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}