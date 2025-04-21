
import { useState } from 'react';
import { CampaignData, WizardStep } from '../types';
import { User } from '@/contexts/auth/types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useCampaignForm = (
  onComplete: (campaign: CampaignData) => void,
  user: User | null
) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<WizardStep>('basics');
  const [campaign, setCampaign] = useState<CampaignData>({
    title: '',
    description: '',
    contactListId: '',
    greetingFileId: '',
    transfer_number_id: '', // Now using transfer_number_id
    status: 'pending',
    schedule: {
      startDate: new Date().toISOString().split('T')[0],
      maxConcurrentCalls: 1
    },
    user_id: user?.id || '',
    port_ids: [],
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

  const handleSelectChange = (name: string, value: string | number | string[]) => {
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
      // Validate transfer_number_id
      if (!campaign.transfer_number_id) {
        toast({
          title: "Transfer number required",
          description: "Please select a transfer number for this campaign.",
          variant: "destructive",
        });
        setStep('transfer-number');
        return;
      }

      const updatedCampaign: CampaignData = {
        ...campaign,
        id: campaign.id || uuidv4(),
        status: 'pending' as const,
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
