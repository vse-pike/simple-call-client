"use client";

import { useEffect, useState } from "react";

export interface BrandTitleProps {
  /**
   * Имя хоста встречи. Если передано — под заголовком появляется плашка
   * «от <имя>» (экран входа по ссылке-приглашению).
   */
  hostName?: string;
  className?: string;
}

/**
 * Слова-синонимы для рулетки. В макете дизайнер перебирал несколько
 * вариантов названия продукта на разных экранах (Созвон / Встреча / Звонок) —
 * вместо того чтобы взять один и потерять остальные, показываем их все.
 */
const TITLE_WORDS = ["Созвон", "Кол", "Митинг", "Синк", "Встреча"];

const ROLL_INTERVAL_MS = 2200;
const ROLL_DURATION_MS = 500;
/** Высота одной строки рулетки. Должна совпадать с line-height слова ниже. */
const ROW_HEIGHT_PX = 44;

/**
 * Вертикальная рулетка слов: список зациклен через дубль первого слова
 * в конце — когда доезжаем до дубля, мгновенно (без transition) прыгаем
 * на настоящий индекс 0. Стандартный приём для бесшовной карусели.
 *
 * Уважает prefers-reduced-motion: при нём рулетка не крутится вообще,
 * остаётся первое слово.
 */
function RollingWord() {
  const words = [...TITLE_WORDS, TITLE_WORDS[0]];
  const [index, setIndex] = useState(0);
  const [animated, setAnimated] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => setIndex((i) => i + 1), ROLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (index !== words.length - 1) return;
    // Доехали до дубля первого слова — после анимации бесшовно прыгаем
    // на настоящий индекс 0, не проезжая всю рулетку обратно.
    const id = setTimeout(() => {
      setAnimated(false);
      setIndex(0);
    }, ROLL_DURATION_MS);
    return () => clearTimeout(id);
  }, [index, words.length]);

  useEffect(() => {
    if (animated) return;
    const id = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [animated]);

  return (
    <div
      className="overflow-hidden"
      style={{ height: ROW_HEIGHT_PX }}
      aria-hidden="true"
    >
      <div
        style={{
          transform: `translateY(-${index * ROW_HEIGHT_PX}px)`,
          transition: animated
            ? `transform ${ROLL_DURATION_MS}ms cubic-bezier(0.3, 1, 0.4, 1)`
            : "none",
        }}
      >
        {words.map((word, i) => (
          <span
            key={i}
            style={{ height: ROW_HEIGHT_PX, lineHeight: `${ROW_HEIGHT_PX}px` }}
            className="block text-center text-4xl font-bold tracking-tight text-white uppercase"
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Заголовок продукта из Figma (экраны 1-4, 26-29): надзаголовок «Просто»
 * и крупное название капсом, которое теперь крутится рулеткой по словам
 * из TITLE_WORDS.
 */
export function BrandTitle({ hostName, className = "" }: BrandTitleProps) {
  return (
    <div className={["flex flex-col items-center gap-3", className].join(" ")}>
      <div className="flex flex-col items-center gap-4">
        <span className="text-2xl leading-tight font-light text-white/70">
          Просто
        </span>
        <RollingWord />
        {/* Реальный текст для скринридеров — визуальная рулетка скрыта от них. */}
        <span className="sr-only">{TITLE_WORDS[0]}</span>
      </div>

      {hostName && (
        <span className="rounded-full bg-white/8 px-3 py-2 text-base leading-none text-accent">
          от {hostName}
        </span>
      )}
    </div>
  );
}
