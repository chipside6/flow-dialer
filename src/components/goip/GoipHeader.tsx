
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Server, Smartphone } from 'lucide-react';

export const GoipHeader = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 goip-header bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-2xl font-bold">GoIP Setup</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400">Connect your GoIP devices to our Asterisk server</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Badge 
          variant="outline" 
          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 flex items-center px-3 py-1.5 rounded-full asterisk-status-badge"
        >
          <Server className="h-3.5 w-3.5 mr-1.5" />
          Asterisk Server: Connected
        </Badge>
      </div>
    </div>
  );
};
