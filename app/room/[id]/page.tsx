import { Suspense } from "react";
import { RoomScreen } from "./RoomScreen";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense>
      <RoomScreen roomId={id} />
    </Suspense>
  );
}
