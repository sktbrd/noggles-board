"use client";

import { FC, useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

interface BannerProps {
  images: string[]; // ordered list of photo URLs
  altText?: string; // optional alt for accessibility
  autoRotateMs?: number; // fallback autoplay interval (default 6000 ms)
}

interface FloatingImage {
  id: string;
  src: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
}

const Banner: FC<BannerProps> = ({
  images,
  altText = "banner",
  autoRotateMs = 6000,
}) => {
  const [floatingImages, setFloatingImages] = useState<FloatingImage[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageCounter = useRef(0);
  const cleanupTimer = useRef<NodeJS.Timeout | null>(null);

  // Memoize images array for better performance
  const memoizedImages = useMemo(() => images, [images]);

  // Generate random properties for floating images
  const getRandomImageProps = (
    x: number,
    y: number
  ): Omit<FloatingImage, "id" | "src"> => ({
    x: x + (Math.random() - 0.5) * 100, // Slightly wider spread for bigger images
    y: y + (Math.random() - 0.5) * 100,
    rotation: (Math.random() - 0.5) * 12, // Subtle rotation
    scale: 0.9 + Math.random() * 0.3, // Larger scale range (0.9 to 1.2)
    zIndex: Math.floor(Math.random() * 15),
  });

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update mouse position immediately for smooth cursor following
      setMousePosition({ x, y });

      // Much more frequent image creation for smooth trail
      const now = Date.now();
      if (now - imageCounter.current < 80) return; // Slightly less frequent - 12.5fps
      imageCounter.current = now;

      // Create fewer images but make them bigger
      const numImages = Math.random() > 0.8 ? 2 : 1; // Less frequent double images

      for (let i = 0; i < numImages; i++) {
        const randomImage =
          memoizedImages[Math.floor(Math.random() * memoizedImages.length)];
        const newImage: FloatingImage = {
          id: `img-${now}-${i}`,
          src: randomImage,
          ...getRandomImageProps(x, y),
        };

        setFloatingImages((prev) => {
          const newImages = [...prev, newImage];
          return newImages.slice(-12); // Keep fewer images total
        });
      }

      // Less aggressive cleanup for smoother appearance
      if (cleanupTimer.current) {
        clearTimeout(cleanupTimer.current);
      }
      cleanupTimer.current = setTimeout(() => {
        setFloatingImages((prev) => prev.slice(-6)); // Keep fewer images after cleanup
      }, 500);
    },
    [memoizedImages]
  );

  const onMouseLeave = useCallback(() => {
    // Faster fade out when mouse leaves
    setTimeout(() => {
      setFloatingImages([]);
    }, 200);
  }, []);

  const onTouch = useCallback(
    (e: React.TouchEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      const randomImage =
        memoizedImages[Math.floor(Math.random() * memoizedImages.length)];
      const newImage: FloatingImage = {
        id: `touch-${Date.now()}`,
        src: randomImage,
        ...getRandomImageProps(x, y),
      };

      setFloatingImages((prev) => [...prev.slice(-3), newImage]); // Keep fewer for touch
    },
    [memoizedImages]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimer.current) {
        clearTimeout(cleanupTimer.current);
      }
    };
  }, []);

  if (!images.length) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden bg-black cursor-none"
      style={{
        backfaceVisibility: "hidden",
        transform: "translate3d(0,0,0)",
        willChange: "contents",
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouch}
      tabIndex={0}
      role="img"
      aria-label={altText}
    >
      {/* Title overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <h1 className="text-white text-6xl md:text-8xl font-bold tracking-tight">
          Noggles Board
        </h1>
      </div>

      {/* Floating images */}
      {floatingImages.map((img, index) => (
        <div
          key={img.id}
          className="absolute pointer-events-none will-change-transform"
          style={{
            left: img.x - 80, // Adjusted for larger images
            top: img.y - 60,
            transform: `rotate(${img.rotation}deg) scale(${img.scale}) translate3d(0,0,0)`,
            zIndex: img.zIndex + index,
            opacity: Math.max(0.15, 1 - index * 0.08), // Better opacity for fewer images
          }}
        >
          <div className="relative w-40 h-28 rounded-md overflow-hidden shadow-lg border border-white/15">
            <Image
              src={img.src}
              alt={altText}
              fill
              className="object-cover"
              loading={index < 2 ? "eager" : "lazy"} // Priority for first 2 since we have fewer
              sizes="160px" // Updated size for larger images
              unoptimized
              priority={index < 2}
            />
          </div>
        </div>
      ))}

      {/* More visible cursor */}
      <div
        className="absolute w-1 h-1 bg-white rounded-full pointer-events-none z-50 will-change-transform"
        style={{
          left: mousePosition.x - 2,
          top: mousePosition.y - 2,
          opacity: 0.8,
          transform: `translate3d(0,0,0)`,
        }}
      />

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};

export default Banner;
