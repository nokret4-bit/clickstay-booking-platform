"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Star,
  Users,
  Maximize2,
  Wifi,
  Wind,
  Car,
  Waves,
  Music,
  Utensils,
  Shield,
  Clock,
  XCircle,
  CheckCircle
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

interface FacilityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: {
    id: string;
    name: string;
    kind: string;
    shortDescription?: string;
    fullDescription?: string;
    capacity: number;
    maxGuests?: number;
    bedrooms?: number;
    bathrooms?: number;
    floorArea?: number;
    price: number;
    photos: string[];
    averageRating: number;
    totalReviews: number;
    highlights?: string[];
    policies?: string[];
    amenities?: string[];
  };
  totalPrice: number;
  nights: number;
  onSelect: () => void;
  onViewReviews: () => void;
}

const AMENITY_ICONS: Record<string, any> = {
  'Air Conditioning': Wind,
  'WiFi': Wifi,
  'Parking': Car,
  'Pool Access': Waves,
  'Sound System': Music,
  'Kitchen': Utensils,
  'Security': Shield,
};

export function FacilityDetailsModal({
  isOpen,
  onClose,
  facility,
  totalPrice,
  nights,
  onSelect,
  onViewReviews
}: FacilityDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const photos = facility.photos || [];
  const hasPhotos = photos.length > 0;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    setImageError(false);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setImageError(false);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getAmenityIcon = (amenity: string) => {
    const IconComponent = AMENITY_ICONS[amenity] || CheckCircle;
    return <IconComponent className="h-4 w-4 text-tropical-green" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">{facility.name}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <Badge className="w-fit bg-tropical-yellow text-tropical-black">
            {facility.kind}
          </Badge>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Image Gallery */}
            {hasPhotos && (
              <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden group">
                {!imageError ? (
                  <img
                    src={photos[currentImageIndex]}
                    alt={`${facility.name} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-tropical">
                    <span className="text-white text-8xl font-bold">{facility.name.charAt(0)}</span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {photos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {photos.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Rating and Reviews Link */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {renderStars(facility.averageRating)}
                <span className="text-lg font-semibold">
                  {facility.averageRating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({facility.totalReviews} {facility.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
              {facility.totalReviews > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewReviews}
                  className="border-tropical-blue text-tropical-blue hover:bg-tropical-blue/10"
                >
                  View All Reviews
                </Button>
              )}
            </div>

            {/* Full Description */}
            {facility.fullDescription && (
              <div>
                <h3 className="text-lg font-semibold mb-2">📝 Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {facility.fullDescription}
                </p>
              </div>
            )}

            {/* Highlights */}
            {facility.highlights && facility.highlights.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">✨ Highlights</h3>
                <ul className="space-y-2">
                  {facility.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-tropical-green flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Capacity & Space */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🏠 Capacity & Space</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-gray-600 mb-1">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Max Guests</span>
                  </div>
                  <div className="text-xl font-bold">{facility.maxGuests || facility.capacity}</div>
                </div>
                {facility.bedrooms && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">🛏️ Bedrooms</div>
                    <div className="text-xl font-bold">{facility.bedrooms}</div>
                  </div>
                )}
                {facility.bathrooms && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">🚿 Bathrooms</div>
                    <div className="text-xl font-bold">{facility.bathrooms}</div>
                  </div>
                )}
                {facility.floorArea && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Maximize2 className="h-4 w-4" />
                      <span className="text-sm">Floor Area</span>
                    </div>
                    <div className="text-xl font-bold">{facility.floorArea} sqm</div>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {facility.amenities && facility.amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">⚡ Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {facility.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-700">
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policies */}
            {facility.policies && facility.policies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">📋 Policies</h3>
                <ul className="space-y-2">
                  {facility.policies.map((policy, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Clock className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{policy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing Summary */}
            <div className="bg-gradient-to-br from-tropical-green/10 to-tropical-blue/10 p-6 rounded-lg border-2 border-tropical-green/20">
              <h3 className="text-lg font-semibold mb-4">💰 Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">
                    {formatCurrency(facility.price, "PHP")} × {nights} night{nights > 1 ? 's' : ''}
                  </span>
                  <span className="font-semibold">{formatCurrency(totalPrice, "PHP")}</span>
                </div>
                <div className="pt-2 border-t-2 border-tropical-green/20">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-2xl font-bold bg-gradient-tropical bg-clip-text text-transparent">
                      {formatCurrency(totalPrice, "PHP")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer with CTA */}
        <div className="px-6 py-4 border-t bg-white sticky bottom-0">
          <Button
            size="lg"
            onClick={() => {
              onSelect();
              onClose();
            }}
            className="w-full bg-gradient-to-r from-tropical-green to-tropical-blue hover:from-tropical-green/90 hover:to-tropical-blue/90 text-white font-bold text-lg shadow-lg"
          >
            ✅ Select This Facility
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
