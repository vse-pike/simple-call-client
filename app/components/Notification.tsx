import { CheckIcon } from "./icons/CheckIcon";

export interface NotificationProps {
  /** Текст уведомления («Ссылка скопирована», «Вы покинули встречу»). */
  message: string;
  className?: string;
}

/**
 * Тост из Figma ("компоненты и цвета" → notification).
 * Белая плашка, тёмный текст, акцентная иконка check справа.
 */
export function Notification({ message, className = "" }: NotificationProps) {
  return (
    <div
      role="status"
      className={[
        "inline-flex items-center gap-1.5 rounded-2xl bg-white px-4 py-3",
        className,
      ].join(" ")}
    >
      <span className="text-base leading-none text-background">{message}</span>
      <CheckIcon className="h-5 w-5 shrink-0 text-accent" />
    </div>
  );
}
