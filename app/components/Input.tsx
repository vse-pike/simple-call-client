"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  /** Подпись поля (в макете — «Имя»). Служит плейсхолдером и плавающим лейблом. */
  label: string;
  error?: boolean;
  /** Кнопка/иконка справа внутри поля (в макете — кубик «случайное имя»). */
  trailing?: ReactNode;
}

/**
 * Поле ввода из Figma ("компоненты и цвета" → Input, COMPONENT_SET).
 * Обводка: default белая @16%, hover @22%, focused — акцент, error — красная.
 *
 * Состояния default/hover/filled/focused сделаны на чистом CSS (:focus и
 * :placeholder-shown), без JS-стейта. Отступление от макета: там лейбл
 * поднимался только в focused, а в filled исчезал совсем — здесь он поднят
 * и в filled тоже, иначе заполненное поле теряет подпись.
 */
export function Input({
  label,
  error,
  trailing,
  id,
  className = "",
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={["relative", className].join(" ")}>
      <input
        id={inputId}
        placeholder=" "
        className={[
          "peer h-14 w-full rounded-2xl border bg-transparent",
          "pt-5 pb-1 pl-[18px] text-base text-white caret-accent outline-none",
          trailing ? "pr-14" : "pr-[18px]",
          "transition-colors",
          error
            ? "border-danger"
            : "border-white/16 hover:border-white/22 focus:border-accent",
        ].join(" ")}
        {...rest}
      />

      <label
        htmlFor={inputId}
        className={[
          "pointer-events-none absolute left-[18px] origin-left transition-all",
          // Поле пустое и без фокуса — лейбл в роли плейсхолдера по центру.
          "top-1/2 -translate-y-1/2 text-base",
          // Фокус или введённый текст — лейбл уезжает наверх и уменьшается.
          "peer-focus:top-[10px] peer-focus:translate-y-0 peer-focus:text-[10px]",
          "peer-not-placeholder-shown:top-[10px] peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-[10px]",
          error ? "text-danger" : "text-white/40",
        ].join(" ")}
      >
        {label}
      </label>

      {trailing && (
        <div className="absolute top-1/2 right-[18px] -translate-y-1/2">
          {trailing}
        </div>
      )}
    </div>
  );
}
