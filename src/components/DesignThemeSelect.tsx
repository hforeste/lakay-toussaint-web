"use client";

import { useEffect, useState } from "react";

const themes = [
  { value: "heritage", label: "Heritage Classic" },
  { value: "festival", label: "Cultural Festival" },
  { value: "night", label: "Night Fundraiser" },
  { value: "global", label: "Global Mission" },
  { value: "crisis", label: "Crisis Response" },
  { value: "mosaic", label: "Seattle Mosaic" },
  { value: "map", label: "Diaspora Map" },
  { value: "ledger", label: "Impact Ledger" },
  { value: "quilt", label: "Story Quilt" },
  { value: "market", label: "Community Market" },
];

const storageKey = "ltca-design-theme";

export function DesignThemeSelect() {
  const [theme, setTheme] = useState("heritage");

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(storageKey) || "heritage";
    const nextTheme = themes.some((option) => option.value === savedTheme)
      ? savedTheme
      : "heritage";

    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  function updateTheme(nextTheme: string) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(storageKey, nextTheme);
  }

  return (
    <label className="themePicker">
      <span>Design</span>
      <select
        aria-label="Select website design"
        value={theme}
        onChange={(event) => updateTheme(event.target.value)}
      >
        {themes.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
