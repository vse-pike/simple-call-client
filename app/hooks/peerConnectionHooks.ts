import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Envelope } from "./useStartConnection";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export interface UsePeerConnectionResult {
  remoteStream: MediaStream | null;
}

function sendEnvelope(
  wsRef: RefObject<WebSocket | null>,
  myId: string | null,
  envelope: Omit<Envelope, "from" | "roomId">
) {
  const ws = wsRef.current;
  if (!ws || ws.readyState !== WebSocket.OPEN) return;
  const full: Envelope = { ...envelope, from: myId ?? undefined };
  ws.send(JSON.stringify(full));
}

export function usePeerConnection(
  wsRef: RefObject<WebSocket | null>,
  peerId: string | null,
  myId: string | null,
  localStream: MediaStream | null
): UsePeerConnectionResult {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (!peerId || !myId || !localStream) return;
    const remotePeerId = peerId;

    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.ontrack = (event) => setRemoteStream(event.streams[0]);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendEnvelope(wsRef, myId, { type: "ice", to: remotePeerId, candidate: event.candidate.toJSON() });
      }
    };

    async function makeOffer() {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendEnvelope(wsRef, myId, { type: "offer", to: remotePeerId, sdp: offer });
    }

    if (myId < remotePeerId) {
      makeOffer();
    }

    return () => {
      pc.close();
      pcRef.current = null;
    };
  }, [wsRef, peerId, myId, localStream]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || !myId) return;

    async function handleMessage(event: MessageEvent) {
      let envelope: Envelope;
      try {
        envelope = JSON.parse(event.data);
      } catch {
        return;
      }

      const pc = pcRef.current;
      if (!pc || !envelope.from) return;

      if (envelope.type === "offer") {
        await pc.setRemoteDescription(envelope.sdp as RTCSessionDescriptionInit);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sendEnvelope(wsRef, myId, { type: "answer", to: envelope.from, sdp: answer });
      }

      if (envelope.type === "answer") {
        await pc.setRemoteDescription(envelope.sdp as RTCSessionDescriptionInit);
      }

      if (envelope.type === "ice" && envelope.candidate) {
        await pc.addIceCandidate(envelope.candidate as RTCIceCandidateInit);
      }
    }

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [wsRef, myId]);

  return { remoteStream };
}
