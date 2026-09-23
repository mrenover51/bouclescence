import Image from "next/image";
import Link from "next/link";

export function Logo({
  compact = false,
  preload = false,
}: {
  compact?: boolean;
  preload?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="Bouclescence, accueil"
      className={`relative block shrink-0 overflow-hidden ${
        compact
          ? "h-[4.75rem] w-[5.625rem]"
          : "h-16 w-[4.75rem] sm:h-[4.75rem] sm:w-[5.625rem] lg:h-[5.5rem] lg:w-[6.5rem]"
      }`}
    >
      <Image
        src="/images/logo-bouclescence.jpg"
        alt="Bouclescence"
        width={1000}
        height={893}
        preload={preload}
        sizes={compact ? "111px" : "(max-width: 639px) 94px, (max-width: 1023px) 111px, 128px"}
        className="absolute -left-[11.8%] -top-[5.2%] h-auto w-[122.7%] max-w-none object-contain"
      />
    </Link>
  );
}
