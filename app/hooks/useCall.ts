import { useRef } from "react";
import { usePeerConnection } from "./peerConnectionHooks";
import { useStartConnection } from "./useStartConnection";
import type { Peer } from "./useStartConnection";

export interface UseCallResult {
  myId: string | null;
  isHost: boolean;
  peers: Peer[];
  roomFull: boolean;
  remoteStream: MediaStream | null;
  remoteAudioMuted: boolean;
  remoteVideoMuted: boolean;
}

export function useCall(
  roomId: string,
  name: string,
  enabled: boolean,
  localStream: MediaStream | null,
  audioMuted: boolean,
  videoMuted: boolean
): UseCallResult {
  const wsRef = useRef<WebSocket | null>(null);

  const { myId, isHost, peers, roomFull } = useStartConnection(wsRef, roomId, name, enabled);
  const remotePeerId = peers[0]?.id ?? null;
  const { remoteStream, remoteAudioMuted, remoteVideoMuted } = usePeerConnection(
    wsRef,
    remotePeerId,
    myId,
    localStream,
    audioMuted,
    videoMuted
  );

  return { myId, isHost, peers, roomFull, remoteStream, remoteAudioMuted, remoteVideoMuted };
}
