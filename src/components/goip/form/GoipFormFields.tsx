
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { GoipFormValues } from './GoipFormSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface GoipFormFieldsProps {
  form: UseFormReturn<GoipFormValues>;
}

export const GoipFormFields: React.FC<GoipFormFieldsProps> = ({ form }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="deviceName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Device Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter device name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="ipAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>IP Address</FormLabel>
            <FormControl>
              <Input placeholder="e.g. 192.168.1.100" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sipPorts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SIP Port Range</FormLabel>
            <FormControl>
              <Input placeholder="e.g. 5060-5063" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="numPorts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Ports</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1} 
                max={8}
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="callerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Default Caller ID (Optional)</FormLabel>
            <FormControl>
              <Input placeholder="Enter default caller ID" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
