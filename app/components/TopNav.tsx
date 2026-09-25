export interface TopNavProps {
  /** Название встречи (в макете — "Встреча с родителями"). */
  title: string;
  className?: string;
}

/**
 * Верхняя навигация из Figma-макета ("компоненты и цвета" → top nav).
 * В исходном компоненте сверху ещё был инстанс "Status Bar" (мок системной
 * iOS-строки состояния — часы/батарея/сигнал) — сюда не переносится,
 * это не часть реального UI приложения, а device-mockup элемент.
 */
export function TopNav({ title, className = "" }: TopNavProps) {
  return (
    <header
      className={[
        "w-full bg-background px-4 pb-6",
        className,
      ].join(" ")}
    >
      <h1 className="text-base font-normal text-foreground">{title}</h1>
    </header>
  );
}
