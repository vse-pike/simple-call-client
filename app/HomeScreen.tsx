"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EntryScreen } from "./components/EntryScreen";
import { randomRoomId } from "./mock-data";

export function HomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasLeft = searchParams.get("left") === "1";

  function handleCreate(name: string) {
    const roomId = randomRoomId();
    router.push(`/room/${roomId}?name=${encodeURIComponent(name)}`);
  }

  return (
    <EntryScreen
      submitLabel="Создать"
      onSubmit={handleCreate}
      notice={hasLeft ? "Вы покинули встречу" : undefined}
    />
  );
}
