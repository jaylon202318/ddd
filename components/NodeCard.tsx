// components/NodeCard.tsx
import React from 'react';
import { ClashNode, NodeDetail } from '../types';

interface NodeCardProps {
  node: ClashNode;
}

/**
 * NodeCard component displays details of a single Clash proxy node.
 * It intelligently renders common properties and handles their display.
 */
const NodeCard: React.FC<NodeCardProps> = ({ node }) => {
  // Define the order and labels for primary details
  const primaryDetails: NodeDetail[] = [
    { label: 'Name', value: node.name },
    { label: 'Type', value: node.type },
    { label: 'Server', value: node.server },
    { label: 'Port', value: node.port },
  ];

  // Dynamically add other common properties if they exist on the node
  const optionalDetails: NodeDetail[] = [
    ...(node.cipher ? [{ label: 'Cipher', value: node.cipher }] : []),
    ...(node.uuid ? [{ label: 'UUID', value: node.uuid }] : []),
    ...(node.network ? [{ label: 'Network', value: node.network }] : []),
    ...(node['ws-path'] ? [{ label: 'WS Path', value: node['ws-path'] }] : []),
    ...(node.tls !== undefined ? [{ label: 'TLS', value: node.tls ? 'Yes' : 'No' }] : []),
    ...(node['udp-relay'] !== undefined ? [{ label: 'UDP Relay', value: node['udp-relay'] ? 'Yes' : 'No' }] : []),
    ...(node.password ? [{ label: 'Password', value: node.password }] : []),
    ...(node.alterId !== undefined ? [{ label: 'Alter ID', value: node.alterId }] : []),
    // Add more properties here as needed
  ];

  const allDetails = [...primaryDetails, ...optionalDetails];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-xl font-semibold text-blue-700 mb-2 truncate" title={node.name}>
        {node.name}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-700">
        {allDetails.map((detail, index) => (
          <div key={index} className="flex flex-wrap items-baseline">
            <span className="font-medium text-gray-600 mr-1">{detail.label}:</span>
            <span className="break-all">{detail.value.toString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NodeCard;