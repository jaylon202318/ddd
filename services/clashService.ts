// services/clashService.ts
import { ClashNode } from '../types';

/**
 * Fetches the raw text content from a given URL.
 * @param url The URL to fetch the Clash configuration from.
 * @returns A promise that resolves with the raw text content.
 * @throws An error if the URL is invalid or the network request fails.
 */
export const fetchClashConfig = async (url: string): Promise<string> => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error('Invalid URL. Must start with http:// or https://');
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
  }
  return response.text();
};

/**
 * Parses a Clash configuration content string (assumed to be YAML-like)
 * and extracts individual proxy nodes.
 *
 * NOTE: This is a simplified, regex-based parser designed for common single-line
 * YAML object structures (e.g., `- {key: value, key2: value2}`). It is NOT a
 * full-fledged YAML parser and may not correctly handle all YAML complexities,
 * such as multi-line definitions, comments within property lines, or nested structures.
 * For robust production applications, a dedicated YAML parsing library (e.g., `js-yaml`)
 * should be used.
 *
 * @param configContent The raw string content of the Clash configuration.
 * @returns An array of ClashNode objects.
 */
export const parseClashNodes = (configContent: string): ClashNode[] => {
  const nodes: ClashNode[] = [];
  const lines = configContent.split('\n');
  let inProxiesSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Detect the start of the 'proxies:' section
    if (trimmedLine.startsWith('proxies:')) {
      inProxiesSection = true;
      continue;
    }

    if (inProxiesSection) {
      // Very basic heuristic to detect the end of the 'proxies' section:
      // If a line is not a comment, not empty, and doesn't start with '-',
      // and contains a colon, it might indicate a new top-level YAML section (e.g., 'proxy-groups:').
      if (!trimmedLine.startsWith('-') && trimmedLine !== '' && !trimmedLine.startsWith('#')) {
          if (trimmedLine.includes(':') && !trimmedLine.startsWith(' ')) {
              inProxiesSection = false;
              continue;
          }
      }

      // Attempt to parse single-line proxy definitions in the format: - {key: value, key2: value2}
      const nodeMatch = trimmedLine.match(/^- \{\s*([^}]+)\s*\}$/);

      if (nodeMatch && nodeMatch[1]) {
        const propertiesString = nodeMatch[1]; // e.g., 'name: "MyProxy", type: vmess, server: example.com, port: 443'
        const props: { [key: string]: string | number | boolean } = {};

        // Split by comma, being careful not to split inside quoted strings.
        // This regex splits by a comma followed by optional whitespace,
        // only if that comma is not inside a pair of single or double quotes.
        const pairs = propertiesString.split(/,\s*(?=(?:[^"']*(?:"[^"']*")[^"']*|[^"']*(?:'[^']*')[^"']*)*[^"']*$)/);

        for (const pair of pairs) {
          const parts = pair.split(':', 2); // Split only on the first colon to handle values that might contain colons
          if (parts.length === 2) {
            const key = parts[0].trim();
            let value: string | number | boolean = parts[1].trim();

            // Remove quotes if present (single or double)
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.substring(1, value.length - 1);
            }

            // Type conversion for common types
            if (key === 'port' && !isNaN(Number(value))) {
              value = Number(value);
            } else if (value === 'true') {
              value = true;
            } else if (value === 'false') {
              value = false;
            }
            props[key] = value;
          }
        }
        // Ensure minimum required fields for a ClashNode are present
        if (props.name && props.type && props.server && props.port !== undefined) {
            nodes.push(props as ClashNode);
        } else {
            console.warn('Skipping incomplete node (missing name, type, server, or port):', props, trimmedLine);
        }
      }
    }
  }
  return nodes;
};