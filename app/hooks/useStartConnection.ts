import { useEffect, useState } from "react";
import type { RefObject } from "react";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "ws://localhost:8080";

export interface Peer {
  id: string;
  name: string;
  isHost?: boolean;
}

export interface Envelope {
  type: string;
  from?: string;
  to?: string;
  roomId?: string;
  sdp?: unknown;
  candidate?: unknown;
  peers?: Peer[];
  name?: string;
  isHost?: boolean;
}

export interface UseStartConnectionResult {
  myId: string | null;
  isHost: boolean;
  peers: Peer[];
}

export function useStartConnection(
  wsRef: RefObject<WebSocket | null>,
  roomId: string,
  name: string,
  enabled: boolean
): UseStartConnectionResult {
  const [myId, setMyId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [peers, setPeers] = useState<Peer[]>([]);

  useEffect(() => {
    if (!enabled) return;

    const params = new URLSearchParams({ room: roomId, name });
    const ws = new WebSocket(`${SERVER_URL}/ws?${params.toString()}`);
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
          setIsHost(Boolean(envelope.isHost));
          setPeers(envelope.peers ?? []);
          break;
        case "peer-joined":
          // Хостом может быть только тот, кто создал комнату (зашёл первым) —
          // а раз мы уже получили "joined" раньше него, значит комната
          // существовала до его прихода. Поэтому у новых пиров isHost всегда
          // false, сервер его для peer-joined даже не присылает.
          if (envelope.from) {
            const peerId = envelope.from;
            setPeers((prev) => [...prev, { id: peerId, name: envelope.name ?? peerId }]);
          }
          break;
        case "peer-left":
          if (envelope.from) {
            setPeers((prev) => prev.filter((peer) => peer.id !== envelope.from));
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

  return { myId, isHost, peers };
}
