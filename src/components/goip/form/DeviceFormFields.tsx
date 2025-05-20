
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { DeviceFormValues } from './deviceFormSchema';

interface DeviceFormFieldsProps {
  form: UseFormReturn<DeviceFormValues>;
}

export const DeviceFormFields = ({ form }: DeviceFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="deviceName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Device Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Office-GoIP1" {...field} />
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
        name="numPorts"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Ports</FormLabel>
            <Select 
              onValueChange={(value) => field.onChange(parseInt(value))}
              value={field.value.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select number of ports" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">1 Port</SelectItem>
                <SelectItem value="2">2 Ports</SelectItem>
                <SelectItem value="4">4 Ports</SelectItem>
                <SelectItem value="8">8 Ports</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
