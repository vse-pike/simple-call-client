import { useRef } from "react";
import { usePeerConnection } from "./peerConnectionHooks";
import { useStartConnection } from "./useStartConnection";

export interface UseCallResult {
  myId: string | null;
  peers: string[];
  peerNames: Record<string, string>;
  remoteStream: MediaStream | null;
}

export function useCall(
  roomId: string,
  name: string,
  enabled: boolean,
  localStream: MediaStream | null
): UseCallResult {
  const wsRef = useRef<WebSocket | null>(null);

  const { myId, peers, peerNames } = useStartConnection(wsRef, roomId, name, enabled);
  const remotePeerId = peers[0] ?? null;
  const { remoteStream } = usePeerConnection(wsRef, remotePeerId, myId, localStream);

  return { myId, peers, peerNames, remoteStream };
}
