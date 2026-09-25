"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BottomNav } from "../../components/BottomNav";
import { Card } from "../../components/Card";
import { EntryScreen } from "../../components/EntryScreen";
import { Notification } from "../../components/Notification";
import { useLocalMedia } from "@/app/hooks/mediaHooks";
import { useCall } from "@/app/hooks/useCall";

export interface RoomScreenProps {
  roomId: string;
}

export function RoomScreen({ roomId }: RoomScreenProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const myName = searchParams.get("name")?.trim() ?? "";
  const hostName = searchParams.get("from")?.trim() || undefined;

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mediaStream = useLocalMedia({
    audio: true,
    video: true,
  }, () => showNotice("Не удалось получить доступ к камере или микрофону"));

  const stream = mediaStream.stream;
  const call = useCall(roomId, myName, Boolean(myName), stream);
  const remotePeerId = call.peers[0] ?? null;

  function showNotice(message: string) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(null), 2500);
  }

  function handleJoin(name: string) {
    router.replace(`/room/${roomId}?name=${encodeURIComponent(name)}`);
  }

  async function handleShare() {
    const url = new URL(`/room/${roomId}`, window.location.origin);
    if (myName) url.searchParams.set("from", myName);

    try {
      await navigator.clipboard.writeText(url.toString());
      showNotice("Ссылка скопирована");
    } catch {
      showNotice("Не удалось скопировать ссылку");
    }
  }

  function handleToggleCamera() {
    setCameraOn((on) => {
      const next = !on;
      mediaStream.setVideoEnabled(next);
      return next;
    });
  }

  function handleToggleMicro() {
    setMicOn((on) => {
      const next = !on;
      mediaStream.setAudioEnabled(next);
      return next;
    });
  }

  function handleEndCall() {
    router.push("/?left=1");
  }

  useEffect(() => {
    return () => {
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    };
  }, []);

  if (!myName) {
    return (
      <EntryScreen
        hostName={hostName}
        submitLabel="Войти"
        onSubmit={handleJoin}
      />
    );
  }

  const channelParticipants = [
    {
      id: "me",
      name: myName,
      isHost: !hostName,
      audioMuted: !micOn,
      videoMuted: !cameraOn,
      stream,
      isSelf: true,
    },
    ...(remotePeerId
      ? [
          {
            id: remotePeerId,
            name: call.peerNames[remotePeerId] ?? remotePeerId,
            isHost: false,
            audioMuted: false,
            videoMuted: !call.remoteStream,
            stream: call.remoteStream,
            isSelf: false,
          },
        ]
      : []),
  ];

  const isSolo = channelParticipants.length === 1;
  const tileClassName = isSolo
    ? "w-full sm:w-[min(70vw,960px)]"
    : "sm:min-w-[280px] sm:max-w-[480px] sm:flex-1";

  return (
    <main className="relative flex h-dvh flex-col">
      {notice && (
        <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center px-5">
          <Notification message={notice} />
        </div>
      )}

      <div className="scrollbar-accent flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-20 pb-5">
        <div className="m-auto flex w-full max-w-[320px] flex-wrap justify-center gap-3 sm:max-w-[1200px] sm:gap-5">
          {channelParticipants.map((participant) => (
            <Card
              key={participant.id}
              name={participant.name}
              audioMuted={participant.audioMuted}
              videoMuted={participant.videoMuted}
              isHost={participant.isHost}
              isSelf={participant.isSelf}
              stream={participant.stream}
              className={tileClassName}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-center sm:pb-6">
        <BottomNav
          micOn={micOn}
          cameraOn={cameraOn}
          onToggleMic={handleToggleMicro}
          onToggleCamera={handleToggleCamera}
          onShare={handleShare}
          onEndCall={handleEndCall}
        />
      </div>
    </main>
  );
}
