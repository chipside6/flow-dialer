
import { useState } from 'react';
import { CampaignData } from '../types';
import { User } from '@/contexts/auth/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

type Step = 'basics' | 'contacts' | 'audio' | 'transfers' | 'review';

export const useCampaignForm = (
  onComplete: (campaign: CampaignData) => void,
  user: User | null
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('basics');
  const [campaign, setCampaign] = useState<CampaignData>({
    title: '',
    description: '',
    contactListId: '',
    greetingFileId: '',
    transferNumber: '',
    status: 'pending', // Changed from 'draft' to 'pending'
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      maxConcurrentCalls: 1 // Added with the right property name
    },
    user_id: user?.id || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCampaign(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CampaignData] as object),
          [child]: value
        }
      }));
    } else {
      setCampaign(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (name: string, value: string | number) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setCampaign(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CampaignData] as object),
          [child]: value
        }
      }));
    } else {
      setCampaign(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleComplete = async () => {
    try {
      const updatedCampaign: CampaignData = {
        ...campaign,
        id: campaign.id || uuidv4(), // Generate ID if not present
        status: 'pending' as const, // Use const assertion to fix type
        createdAt: new Date().toISOString(),
        user_id: user?.id || '',
      };
      
      onComplete(updatedCampaign);
      
      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully.",
      });
      
      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: "Error",
        description: "There was an error creating your campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    campaign,
    setCampaign,
    step,
    setStep,
    handleInputChange,
    handleSelectChange,
    handleComplete
  };
};
