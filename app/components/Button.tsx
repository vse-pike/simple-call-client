import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonAppearance =
  | "primary"
  | "secondary"
  | "secondarySystem"
  | "critical";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  appearance?: ButtonAppearance;
  /** Иконка рядом с текстом (в макете — arrow справа от «Создать»). */
  icon?: ReactNode;
  /** Иконка идёт после текста, а не до (как «Создать →»). */
  iconTrailing?: boolean;
  /**
   * Квадратная кнопка 58×58 без текста — кнопки управления звонком
   * в bottom nav (это те же инстансы «button» в макете, но без текста).
   */
  iconOnly?: boolean;
}

/**
 * Кнопка из Figma ("компоненты и цвета" → button, COMPONENT_SET).
 *
 * Цвета вариантов заданы в макете через прозрачность заливки:
 *   primary          — #FFB130, текст #0A0A0A (hover #FFBA30)
 *   secondary        — #F1CE1B @ 8%, текст #FFB130 (hover @ 16%)
 *   secondary system — белый @ 8%, текст белый (hover @ 15%)
 *   critical         — #FE3D3D, текст белый (hover #F83535)
 *   disabled         — прозрачность всего узла 44%
 */
export function Button({
  appearance = "primary",
  icon,
  iconTrailing,
  iconOnly,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  const appearanceClasses: Record<ButtonAppearance, string> = {
    primary: "bg-accent text-background hover:bg-accent-hover",
    secondary: "bg-secondary/8 text-accent hover:bg-secondary/16",
    secondarySystem: "bg-white/8 text-white hover:bg-white/15",
    critical: "bg-danger text-white hover:bg-danger-hover",
  };

  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-[10px] rounded-[20px]",
        "text-xl leading-none font-normal transition-colors",
        "disabled:pointer-events-none disabled:opacity-[0.44]",
        iconOnly
          ? "h-[58px] w-[58px] shrink-0 p-0"
          : "w-full px-[10px] pt-[18px] pb-4",
        appearanceClasses[appearance],
        className,
      ].join(" ")}
      {...rest}
    >
      {!iconTrailing && icon}
      {!iconOnly && children}
      {iconTrailing && icon}
    </button>
  );
}
