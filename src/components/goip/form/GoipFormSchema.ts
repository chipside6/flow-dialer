
import { z } from 'zod';

export const goipFormSchema = z.object({
  deviceName: z.string().min(3, 'Device name must be at least 3 characters'),
  ipAddress: z.string().regex(/^[\d.]+$/, 'Must be a valid IP address'),
  sipPorts: z.string().regex(/^\d+(-\d+)?$/, 'Must be a port number or range (e.g. 5060-5063)'),
  numPorts: z.number().min(1).max(8),
  callerId: z.string().optional(),
});

export type GoipFormValues = z.infer<typeof goipFormSchema>;

export const goipFormDefaultValues: GoipFormValues = {
  deviceName: '',
  ipAddress: '',
  sipPorts: '5060-5068',
  numPorts: 1,
  callerId: ''
};
