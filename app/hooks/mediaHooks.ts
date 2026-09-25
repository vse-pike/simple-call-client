import { useState, useEffect } from "react";

export function useLocalMedia(constraints: MediaStreamConstraints, onError: () => void) {
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    let activeStream: MediaStream | null;

    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = s;

        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(activeStream);
      } catch {
        if (!cancelled) {
          onError();
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      activeStream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function setVideoEnabled(enabled: boolean) {
    stream?.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  function setAudioEnabled(enabled: boolean) {
    stream?.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }

  return { stream, setVideoEnabled, setAudioEnabled };
}
