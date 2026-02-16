"use client";

type ThemeLogoProps = {
  theme: "light" | "dark";
  lightSrc: string; // used when theme === "light"
  darkSrc: string;  // used when theme === "dark"
  alt: string;
  className?: string; // controls size here
};

export function ThemeLogo({
  theme,
  lightSrc,
  darkSrc,
  alt,
  className = "h-10 w-10",
}: ThemeLogoProps) {
  const src = theme === "light" ? lightSrc : darkSrc;

  return (
    <img
      src={src}
      alt={alt}
      className={`${className} object-contain`}
      draggable={false}
    />
  );
}
