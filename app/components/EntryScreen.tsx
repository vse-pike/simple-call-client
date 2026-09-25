"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { BrandTitle } from "./BrandTitle";
import { Button } from "./Button";
import { Input } from "./Input";
import { Notification } from "./Notification";
import { ArrowIcon } from "./icons/ArrowIcon";
import { RandomIcon } from "./icons/RandomIcon";
import { randomName } from "../mock-data";

export interface EntryScreenProps {
  hostName?: string;
  submitLabel: string;
  onSubmit: (name: string) => void;
  notice?: string;
}

export function EntryScreen({
  hostName,
  submitLabel,
  onSubmit,
  notice,
}: EntryScreenProps) {
  const [name, setName] = useState("");
  const trimmed = name.trim();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <main className="relative flex min-h-dvh flex-col px-5 pb-[54px] sm:justify-center sm:gap-10 sm:pb-0">
      {notice && (
        <div className="absolute inset-x-0 top-14 flex justify-center px-5">
          <Notification message={notice} />
        </div>
      )}

      <div className="flex flex-1 items-center justify-center sm:flex-none">
        <BrandTitle hostName={hostName} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="mx-auto flex w-full max-w-[320px] flex-col gap-6"
      >
        <Input
          label="Имя"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="off"
          maxLength={60}
          trailing={
            <button
              type="button"
              onClick={() => setName(randomName())}
              aria-label="Подобрать случайное имя"
              className="flex h-7 w-7 items-center justify-center text-accent transition-opacity hover:opacity-80"
            >
              <RandomIcon className="h-7 w-7" />
            </button>
          }
        />

        <Button
          type="submit"
          disabled={!trimmed}
          iconTrailing
          icon={<ArrowIcon className="h-[26px] w-[26px]" />}
        >
          {submitLabel}
        </Button>
      </form>
    </main>
  );
}
