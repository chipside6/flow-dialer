
// Type definitions for the edge function

export interface DeviceRegistrationRequest {
  userId: string;
  deviceName: string;
  ipAddress: string;
  numPorts: number;
}

export interface PortDefinition {
  port_number: number;
  sip_user: string;
  sip_pass: string;
  status: string;
  trunk_name: string;
  user_id: string;
  device_ip?: string;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  deviceName?: string;
  numPorts?: number;
  ports?: any[];
  error?: string;
  errorType?: string;
  missingFields?: string[];
}
