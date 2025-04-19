
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface ConfigActions {
  copied: boolean;
  handleCopy: (text: string) => void;
  handleDownload: (text: string, filename: string) => void;
}

export function useConfigActions(): ConfigActions {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Configuration has been copied to your clipboard"
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded configuration",
      description: `${filename} has been downloaded`
    });
  };

  return {
    copied,
    handleCopy,
    handleDownload
  };
}
