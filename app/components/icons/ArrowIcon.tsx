import type { SVGProps } from "react";

/** Иконка из Figma (16x16), однотонная — цвет наследуется через currentColor. */
export function ArrowIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M1.66675 8.16683H14.3332M10.3334 12.3334C10.3334 9.00008 11.6667 9.00008 14.3332 8.16683C11.6667 7.00008 10.3334 7.33341 10.3334 3.66675" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="bevel"/>
    </svg>
  );
}
