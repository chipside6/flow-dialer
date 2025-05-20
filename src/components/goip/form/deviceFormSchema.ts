
import { z } from 'zod';

export const deviceFormSchema = z.object({
  deviceName: z.string().min(3, 'Device name must be at least 3 characters').max(50, 'Device name must be at most 50 characters'),
  ipAddress: z.string().regex(/^[\d.]+$/, 'Enter a valid IP address'),
  numPorts: z.coerce.number().min(1).max(8, 'Maximum 8 ports supported'),
});

export type DeviceFormValues = z.infer<typeof deviceFormSchema>;
