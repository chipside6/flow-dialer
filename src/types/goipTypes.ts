
export type PortStatus = 
  | 'available'     // Ready for use
  | 'busy'          // Currently on a call
  | 'reserved'      // Reserved for a campaign but not active
  | 'unreachable'   // Cannot connect to the GoIP device
  | 'maintenance'   // Manually disabled
  | 'error'         // Error state with reason

export interface PortStatusError {
  code: string;
  message: string;
  timestamp: string;
}

export interface GoipPort {
  id: string;
  device_id: string;
  port_number: number;
  sip_username: string;
  sip_password: string;
  status: PortStatus;
  error?: PortStatusError;
  last_used?: string;
  current_campaign_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GoipDevice {
  id?: string;
  device_name: string;
  device_ip: string;
  num_ports: number;
  user_id: string;
  ports: GoipPort[];
  created_at?: string;
  updated_at?: string;
}
