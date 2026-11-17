import { ImageOff } from 'lucide-react';
import { useEffect, useState } from 'react';

/** Imagem com fallback caso a URL esteja quebrada ou vazia. */
export default function ProductImage({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className={`grid place-items-center bg-zinc-200 text-zinc-400 ${className}`} aria-label={alt}>
        <ImageOff size={28} />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />;
}
