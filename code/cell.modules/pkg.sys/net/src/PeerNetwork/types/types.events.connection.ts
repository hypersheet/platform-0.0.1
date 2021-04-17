import { t } from './common';

/**
 * Network CONNECTION
 */
export type PeerConnectionEvent =
  | PeerConnectReqEvent
  | PeerConnectResEvent
  | PeerConnectionClosedEvent
  | PeerDisconnectReqEvent
  | PeerDisconnectResEvent;

/**
 * Fired to initiate a data connection.
 */
export type PeerConnectReqEvent = {
  type: 'sys.net/peer/connection/connect:req';
  payload: PeerNetworkConnectReq;
};
export type PeerNetworkConnectReq = PeerNetworkConnectDataReq | PeerNetworkConnectMediaReq;

type ConnectBase = {
  self: t.PeerId;
  tx?: string;
  remote: t.PeerId;
  direction: t.PeerConnectDirection;
  metadata?: t.JsonMap;
};

export type PeerNetworkConnectDataReq = ConnectBase & {
  kind: t.PeerConnectionKindData;
  isReliable?: boolean;
};
export type PeerNetworkConnectMediaReq = ConnectBase & {
  kind: t.PeerConnectionKindMedia;
  constraints?: t.PeerMediaConstraints;
  timeout?: number;
};

/**
 * Fired when a peer completes it's connection.
 */
export type PeerConnectResEvent = {
  type: 'sys.net/peer/connection/connect:res';
  payload: PeerNetworkConnectRes;
};
export type PeerNetworkConnectRes = {
  self: t.PeerId;
  tx: string;
  remote: t.PeerId;
  existing: boolean;
  kind: t.PeerConnectionKind;
  direction: t.PeerConnectDirection;
  connection?: t.PeerConnectionStatus;
  error?: t.PeerError;
};

/**
 * Fired to close a connection.
 */
export type PeerDisconnectReqEvent = {
  type: 'sys.net/peer/connection/disconnect:req';
  payload: PeerNetworkDisconnectReq;
};
export type PeerNetworkDisconnectReq = {
  self: t.PeerId;
  remote: t.PeerId;
  connection: t.PeerConnectionId;
  tx?: string;
};

/**
 * Fires when a "disconnect" request completes.
 * NB:
 *    The generic "connection:closed" request will also
 *    fire upon completing.
 */
export type PeerDisconnectResEvent = {
  type: 'sys.net/peer/connection/disconnect:res';
  payload: PeerNetworkDisconnectRes;
};
export type PeerNetworkDisconnectRes = {
  self: t.PeerId;
  tx: string;
  connection?: t.PeerConnectionId;
  error?: t.PeerError;
};

/**
 * Fired when a connection closes.
 */
export type PeerConnectionClosedEvent = {
  type: 'sys.net/peer/connection/closed';
  payload: PeerNetworkConnectionClosed;
};
export type PeerNetworkConnectionClosed = {
  self: t.PeerId;
  connection: t.PeerConnectionStatus;
};
