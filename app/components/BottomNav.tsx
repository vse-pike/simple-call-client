import { Button } from "./Button";
import { CallIcon } from "./icons/CallIcon";
import { MicrophoneOffIcon } from "./icons/MicrophoneOffIcon";
import { MicrophoneOnIcon } from "./icons/MicrophoneOnIcon";
import { ShareIcon } from "./icons/ShareIcon";
import { VideoOffIcon } from "./icons/VideoOffIcon";
import { VideoOnIcon } from "./icons/VideoOnIcon";

export interface BottomNavProps {
  micOn: boolean;
  cameraOn: boolean;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onShare: () => void;
  onEndCall: () => void;
  className?: string;
}

const ICON = "h-[26px] w-[26px]";

export function BottomNav({
  micOn,
  cameraOn,
  onToggleMic,
  onToggleCamera,
  onShare,
  onEndCall,
  className = "",
}: BottomNavProps) {
  return (
    <div
      className={[
        "flex w-full items-center justify-center gap-16 bg-surface pt-4 pb-6",
        "sm:w-[360px] sm:rounded-2xl sm:py-4",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <Button
          appearance="secondarySystem"
          iconOnly
          onClick={onToggleCamera}
          aria-label={cameraOn ? "Выключить камеру" : "Включить камеру"}
          aria-pressed={cameraOn}
          icon={
            cameraOn ? (
              <VideoOnIcon className={ICON} />
            ) : (
              <VideoOffIcon className={ICON} />
            )
          }
        />
        <Button
          appearance="secondarySystem"
          iconOnly
          onClick={onToggleMic}
          aria-label={micOn ? "Выключить микрофон" : "Включить микрофон"}
          aria-pressed={micOn}
          icon={
            micOn ? (
              <MicrophoneOnIcon className={ICON} />
            ) : (
              <MicrophoneOffIcon className={ICON} />
            )
          }
        />
        <Button
          appearance="secondarySystem"
          iconOnly
          onClick={onShare}
          aria-label="Скопировать ссылку на встречу"
          icon={<ShareIcon className={ICON} />}
        />
      </div>

      <Button
        appearance="critical"
        iconOnly
        onClick={onEndCall}
        aria-label="Покинуть встречу"
        icon={<CallIcon className={ICON} />}
      />
    </div>
  );
}
