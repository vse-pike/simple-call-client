import { useEffect, useState } from "react";
import type { RefObject } from "react";

export interface Envelope {
  type: string;
  from?: string;
  to?: string;
  roomId?: string;
  sdp?: unknown;
  candidate?: unknown;
  peers?: string[];
  name?: string;
  peerNames?: Record<string, string>;
}

export interface UseStartConnectionResult {
  myId: string | null;
  peers: string[];
  peerNames: Record<string, string>;
}

export function useStartConnection(
  wsRef: RefObject<WebSocket | null>,
  roomId: string,
  name: string,
  enabled: boolean
): UseStartConnectionResult {
  const [myId, setMyId] = useState<string | null>(null);
  const [peers, setPeers] = useState<string[]>([]);
  const [peerNames, setPeerNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!enabled) return;

    const params = new URLSearchParams({ room: roomId, name });
    const ws = new WebSocket(`ws://localhost:8080/ws?${params.toString()}`);
    wsRef.current = ws;

    ws.addEventListener("message", (event) => {
      let envelope: Envelope;
      try {
        envelope = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (envelope.type) {
        case "joined":
          setMyId(envelope.from ?? null);
          setPeers(envelope.peers ?? []);
          setPeerNames((prev) => ({ ...prev, ...(envelope.peerNames ?? {}) }));
          break;
        case "peer-joined":
          if (envelope.from) {
            setPeers((prev) => [...prev, envelope.from as string]);
            if (envelope.name) {
              const peerId = envelope.from;
              setPeerNames((prev) => ({ ...prev, [peerId]: envelope.name as string }));
            }
          }
          break;
        case "peer-left":
          if (envelope.from) {
            setPeers((prev) => prev.filter((id) => id !== envelope.from));
          }
          break;
      }
    });

    ws.addEventListener("close", () => {
      // Strict Mode в dev монтирует эффект дважды: без этой проверки
      // запоздалый close первого (тестового) сокета затирает wsRef,
      // указывающий уже на второй, настоящий сокет.
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    });

    return () => {
      ws.close();
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };
  }, [wsRef, roomId, name, enabled]);

  return { myId, peers, peerNames };
}
