
import React from "react";
import SystemCheckItem, { SystemCheck } from "./SystemCheckItem";

interface ChecksListProps {
  checks: SystemCheck[];
}

const ChecksList = ({ checks }: ChecksListProps) => {
  return (
    <div className="space-y-4">
      {checks.map((check) => (
        <SystemCheckItem key={check.name} check={check} />
      ))}
    </div>
  );
};

export default ChecksList;
