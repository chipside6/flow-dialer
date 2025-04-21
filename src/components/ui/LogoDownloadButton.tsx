
import React from "react";

export const LogoDownloadButton = ({
  filename = "flow-dialer-logo.png",
  logoSrc = "/lovable-uploads/54734c82-a75a-47da-b504-9be3ef0c1e1e.png",
  className = "",
}: {
  filename?: string;
  logoSrc?: string;
  className?: string;
}) => {
  const handleDownload = () => {
    // Create an invisible link and trigger download
    const link = document.createElement("a");
    link.href = logoSrc;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleDownload}
      className={
        "inline-block mt-2 px-3 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-colors " +
        className
      }
    >
      Download Logo
    </button>
  );
};

/**
 * Usage example:
 * 
 * import { Logo } from "@/components/ui/Logo";
 * import { LogoDownloadButton } from "@/components/ui/LogoDownloadButton";
 * 
 * export default function LogoWithDownload() {
 *   return (
 *     <div className="flex flex-col items-center gap-2">
 *       <Logo size="md" />
 *       <LogoDownloadButton />
 *     </div>
 *   );
 * }
 */
