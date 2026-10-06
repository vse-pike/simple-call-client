import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import type { Envelope } from "./useStartConnection";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

export interface UsePeerConnectionResult {
  remoteStream: MediaStream | null;
  remoteAudioMuted: boolean;
  remoteVideoMuted: boolean;
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

interface MediaState {
  audioMuted: boolean;
  videoMuted: boolean;
}

function sendMediaState(dc: RTCDataChannel | null, state: MediaState) {
  if (!dc || dc.readyState !== "open") return;
  dc.send(JSON.stringify(state));
}

export function usePeerConnection(
  wsRef: RefObject<WebSocket | null>,
  peerId: string | null,
  myId: string | null,
  localStream: MediaStream | null,
  audioMuted: boolean,
  videoMuted: boolean
): UsePeerConnectionResult {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteAudioMuted, setRemoteAudioMuted] = useState(false);
  const [remoteVideoMuted, setRemoteVideoMuted] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  // Сигнальные сообщения, прилетевшие до создания pc (эффект ниже ждёт
  // localStream, а getUserMedia может отдать стрим секунды спустя —
  // оффер и ICE-кандидаты успевают сгореть). Копим и доигрываем после
  // создания pc. Реф, а не стейт: очередь читают только эффекты,
  // ре-рендер при пополнении не нужен.
  const pendingRef = useRef<Envelope[]>([]);

  // Общая логика offer/answer/ice для живых сообщений и для дренажа
  // буфера. Читает только рефы и аргументы — замыкание не устаревает.
  // useCallback, чтобы эффекты могли держать её в deps без риска
  // пересоздания pc на каждом рендере: личность меняется только вместе
  // с myId, который и так перезапускает оба эффекта.
  const handleSignaling = useCallback(async (envelope: Envelope) => {
    if (!envelope.from) return;

    const pc = pcRef.current;
    if (!pc) return;

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
  }, [wsRef, myId]);

  // pc-эффект ниже создаётся один раз на пару (не зависит от audioMuted/
  // videoMuted — иначе каждый тоггл камеры пересоздавал бы соединение).
  // dc.onopen внутри него — асинхронный колбэк, который может выстрелить
  // сильно позже рендера, где он был объявлен, поэтому не может читать
  // audioMuted/videoMuted из замыкания напрямую — тянет их из этих рефов.
  const audioMutedRef = useRef(audioMuted);
  const videoMutedRef = useRef(videoMuted);
  useEffect(() => {
    audioMutedRef.current = audioMuted;
  }, [audioMuted]);
  useEffect(() => {
    videoMutedRef.current = videoMuted;
  }, [videoMuted]);

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

    function setupDataChannel(dc: RTCDataChannel) {
      dcRef.current = dc;
      dc.onopen = () => {
        sendMediaState(dc, { audioMuted: audioMutedRef.current, videoMuted: videoMutedRef.current });
      };
      dc.onmessage = (event) => {
        try {
          const state = JSON.parse(event.data) as Partial<MediaState>;
          if (typeof state.audioMuted === "boolean") setRemoteAudioMuted(state.audioMuted);
          if (typeof state.videoMuted === "boolean") setRemoteVideoMuted(state.videoMuted);
        } catch {
          // ignore
        }
      };
    }

    pc.ondatachannel = (event) => setupDataChannel(event.channel);

    async function makeOffer() {
      // Только offerer создаёт data channel явно — другая сторона получит
      // его через pc.ondatachannel при обработке этого offer.
      setupDataChannel(pc.createDataChannel("media-state"));
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendEnvelope(wsRef, myId, { type: "offer", to: remotePeerId, sdp: offer });
    }

    if (myId < remotePeerId) {
      makeOffer();
    }

    // Догоняем то, что накопилось до создания pc. Строго последовательно:
    // setRemoteDescription/addIceCandidate асинхронны, и кандидат без
    // установленного remote description кидает исключение. Битый/поздний
    // кандидат не должен остановить остальную очередь.
    async function drainPending() {
      const buffered = pendingRef.current;
      pendingRef.current = [];
      for (const envelope of buffered) {
        if (envelope.from !== remotePeerId) continue;
        try {
          await handleSignaling(envelope);
        } catch {
          // ignore
        }
      }
    }
    drainPending();

    return () => {
      pc.close();
      pcRef.current = null;
      dcRef.current = null;
      // Очередь принадлежала умершему соединению — иначе старый оффер
      // доигрался бы в pc следующего пира.
      pendingRef.current = [];
    };
  }, [wsRef, peerId, myId, localStream, handleSignaling]);

  // Переключение мика/камеры уже после того, как канал открыт — начальное
  // состояние при самом открытии канала шлёт dc.onopen выше.
  useEffect(() => {
    sendMediaState(dcRef.current, { audioMuted, videoMuted });
  }, [peerId, myId, audioMuted, videoMuted]);

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

      if (!envelope.from) return;

      const pc = pcRef.current;
      if (!pc) {
        pendingRef.current.push(envelope);
        return;
      }

      await handleSignaling(envelope);
    }

    ws.addEventListener("message", handleMessage);
    return () => ws.removeEventListener("message", handleMessage);
  }, [wsRef, myId, handleSignaling]);

  return { remoteStream, remoteAudioMuted, remoteVideoMuted };
}
