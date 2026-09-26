"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EntryScreen } from "./components/EntryScreen";
import { randomRoomId } from "./mock-data";

export function HomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasLeft = searchParams.get("left") === "1";
  const isFull = searchParams.get("full") === "1";

  function handleCreate(name: string) {
    const roomId = randomRoomId();
    router.push(`/room/${roomId}?name=${encodeURIComponent(name)}`);
  }

  const notice = isFull
    ? "В комнате уже 2 участника — больше пока нельзя"
    : hasLeft
      ? "Вы покинули встречу"
      : undefined;

  return (
    <EntryScreen submitLabel="Создать" onSubmit={handleCreate} notice={notice} />
  );
}
