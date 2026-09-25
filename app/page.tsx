import { Suspense } from "react";
import { HomeScreen } from "./HomeScreen";

export default function Page() {
  // HomeScreen читает ?left=1 через useSearchParams — по документации Next 16
  // такой компонент оборачивается в Suspense, иначе пререндер страницы
  // целиком уедет в клиентский рендер.
  return (
    <Suspense>
      <HomeScreen />
    </Suspense>
  );
}
