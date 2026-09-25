import type { SVGProps } from "react";

/** Иконка из Figma (16x16), однотонная — цвет наследуется через currentColor. */
export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path fillRule="evenodd" clipRule="evenodd" d="M8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1ZM11.6208 5.5459C11.393 5.31809 11.0237 5.31809 10.7959 5.5459L6.83333 9.50846L5.2041 7.87923C4.9763 7.65143 4.60704 7.65143 4.37923 7.87923C4.15143 8.10704 4.15143 8.4763 4.37923 8.7041L6.4209 10.7458C6.6487 10.9736 7.01796 10.9736 7.24577 10.7458L11.6208 6.37077C11.8486 6.14296 11.8486 5.7737 11.6208 5.5459Z" fill="currentColor"/>
    </svg>
  );
}
