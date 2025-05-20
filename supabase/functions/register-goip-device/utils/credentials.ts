
import { PortDefinition } from "../types/index.ts";

// Generate SIP credentials for each port
export function generatePortCredentials(
  userId: string,
  deviceName: string,
  ipAddress: string,
  numPorts: number
): PortDefinition[] {
  const ports: PortDefinition[] = [];
  
  for (let port = 1; port <= numPorts; port++) {
    const username = `goip_${userId.substring(0, 8)}_port${port}`;
    
    // Generate a secure random password (12 characters)
    const randomBytes = new Uint8Array(8);
    crypto.getRandomValues(randomBytes);
    const password = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 12);
    
    ports.push({
      port_number: port,
      sip_user: username,
      sip_pass: password,
      status: 'active',
      trunk_name: deviceName,
      user_id: userId,
      device_ip: ipAddress
    });
  }
  
  return ports;
}
