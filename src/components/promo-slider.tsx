"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

interface Promo {
  id: string;
  title: string | null;
  description: string | null;
  mediaUrl: string;
  mediaType: 'IMAGE' | 'VIDEO';
  bgColor: string;
  facilityLink: string | null;
  isActive: boolean;
  order: number;
}

export function PromoSlider() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    // Fetch promos from API
    fetch("/api/promos")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setPromos(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching promos:", error);
      });
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % promos.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + promos.length) % promos.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // Don't render if no promos
  if (promos.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full overflow-hidden px-4 sm:px-6 md:px-8 lg:px-12 py-6">
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {promos.map((promo) => {
          const href = (promo.facilityLink || "/browse") as Route;
          return (
          <Link 
            key={promo.id}
            href={href}
            className="min-w-full block relative group cursor-pointer px-2"
          >
            <div className="w-full h-[280px] sm:h-[350px] md:h-[420px] lg:h-[480px] relative overflow-hidden rounded-xl shadow-lg">
              {promo.mediaType === 'VIDEO' ? (
                <video
                  src={promo.mediaUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={promo.mediaUrl}
                  alt="Promotional banner"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              {/* Optional overlay for better contrast */}
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors duration-300"></div>
            </div>
          </Link>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 sm:left-8 md:left-10 lg:left-14 top-1/2 -translate-y-1/2 z-10"
        aria-label="Previous slide"
      >
        <div className="bg-background/80 hover:bg-background/95 rounded-full p-2 md:p-3 shadow-lg opacity-70 hover:opacity-100 transition-all">
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
        </div>
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 sm:right-8 md:right-10 lg:right-14 top-1/2 -translate-y-1/2 z-10"
        aria-label="Next slide"
      >
        <div className="bg-background/80 hover:bg-background/95 rounded-full p-2 md:p-3 shadow-lg opacity-70 hover:opacity-100 transition-all">
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
        </div>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {promos.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
              currentSlide === index
                ? "bg-primary border-primary w-8"
                : "bg-background/50 border-primary/50 hover:bg-background/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
