// types.ts

/**
 * Interface representing a single Clash proxy node.
 * Includes common properties found in Clash configuration files.
 * `[key: string]: any;` allows for additional, less common properties.
 */
export interface ClashNode {
  name: string;
  type: string;
  server: string;
  port: number | string;
  cipher?: string;
  uuid?: string;
  network?: string;
  'ws-path'?: string;
  tls?: boolean;
  'udp-relay'?: boolean;
  password?: string;
  'ws-headers'?: { [key: string]: string };
  'skip-cert-verify'?: boolean;
  alterId?: number;
  [key: string]: any; // Allows for additional, optional properties that might be present
}

/**
 * Interface for a displayable detail item, used in NodeCard.
 */
export interface NodeDetail {
  label: string;
  value: string | number | boolean;
}