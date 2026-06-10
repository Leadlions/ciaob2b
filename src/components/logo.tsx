import Image from "next/image";

export function Logo({ className = "h-9 w-auto" }: { className?: string }) {
  return (
    <Image
      src="/ciao-logo.png"
      alt="ciao!"
      width={1920}
      height={1080}
      priority
      className={className}
    />
  );
}
