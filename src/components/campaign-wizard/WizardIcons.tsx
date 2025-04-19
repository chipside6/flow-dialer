
import React from "react";
import { FileText, Users, Music, Phone, ServerIcon, CheckCircle } from "lucide-react";

// Base icon component with consistent styling
type IconProps = {
  className?: string;
};

export const BasicsIcon: React.FC<IconProps> = ({ className }) => (
  <FileText className={className} />
);

export const ContactsIcon: React.FC<IconProps> = ({ className }) => (
  <Users className={className} />
);

export const AudioIcon: React.FC<IconProps> = ({ className }) => (
  <Music className={className} />
);

export const Server: React.FC<IconProps> = ({ className }) => (
  <ServerIcon className={className} />
);

export const TransfersIcon: React.FC<IconProps> = ({ className }) => (
  <Phone className={className} />
);

export const ReviewIcon: React.FC<IconProps> = ({ className }) => (
  <CheckCircle className={className} />
);
