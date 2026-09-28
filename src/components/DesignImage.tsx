import Image from "next/image";

type DesignImageProps = {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  src: string;
};

export function DesignImage({
  alt,
  className,
  priority = false,
  sizes = "(max-width: 980px) 100vw, 50vw",
  src,
}: DesignImageProps) {
  const isVercelBlobImage = src.startsWith("https://") && src.includes(".public.blob.vercel-storage.com/");

  return (
    <Image
      alt={alt}
      className={className}
      fill
      priority={priority}
      sizes={sizes}
      src={src}
      unoptimized={isVercelBlobImage}
    />
  );
}
