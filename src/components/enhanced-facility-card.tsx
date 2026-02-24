"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TropicalCard } from "@/components/tropical/tropical-card";
import { Users, MapPin, Star, Eye, MessageSquare, Maximize2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";

interface EnhancedFacilityCardProps {
  facility: {
    id: string;
    name: string;
    kind: string;
    description: string | null;
    capacity: number;
    price: number;
    photos: string[];
    averageRating: number;
    totalReviews: number;
    bedrooms?: number;
    bathrooms?: number;
    floorArea?: number;
  };
  totalPrice: number;
  nights: number;
  searchParams: {
    from: string;
    to: string;
    types: string;
  };
  onViewDetails: () => void;
  onViewReviews: () => void;
  onSelect: () => void;
  isSelecting?: boolean;
}

export function EnhancedFacilityCard({ 
  facility, 
  totalPrice,
  nights,
  searchParams,
  onViewDetails,
  onViewReviews,
  onSelect,
  isSelecting = false
}: EnhancedFacilityCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);
  
  const photos = facility.photos || [];
  const firstPhoto = photos[0];
  const kindLabel = facility.kind.charAt(0) + facility.kind.slice(1).toLowerCase();
  
  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <TropicalCard className="overflow-hidden group relative hover:shadow-2xl transition-all duration-300">
      {/* Image Section with Overlay */}
      <div 
        className="aspect-[4/3] bg-tropical-tan/20 relative overflow-hidden rounded-t-2xl cursor-pointer"
        onMouseEnter={() => setImageHovered(true)}
        onMouseLeave={() => setImageHovered(false)}
        onClick={onViewDetails}
      >
        {firstPhoto && !imageError ? (
          <>
            <img 
              src={firstPhoto} 
              alt={facility.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tropical-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* View Details Overlay */}
            {imageHovered && (
              <div className="absolute inset-0 flex items-center justify-center bg-tropical-black/40 transition-opacity duration-300">
                <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 shadow-lg">
                  <Maximize2 className="h-5 w-5 text-tropical-green" />
                  <span className="font-semibold text-tropical-black">View Details</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-tropical">
            <span className="text-white text-6xl font-bold drop-shadow-lg">{facility.name.charAt(0)}</span>
          </div>
        )}
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          <Badge className="bg-tropical-yellow text-tropical-black font-bold shadow-lg border-0">
            {kindLabel}
          </Badge>
          {facility.averageRating > 0 && (
            <Badge className="bg-white/95 backdrop-blur-sm text-tropical-black font-bold shadow-lg border-0 flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {facility.averageRating.toFixed(1)}
            </Badge>
          )}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        {/* Title and Rating */}
        <div className="mb-3">
          <h3 className="text-2xl font-bold text-tropical-black mb-2 group-hover:text-tropical-red transition-colors">
            {facility.name}
          </h3>
          
          {/* Rating Display */}
          {facility.averageRating > 0 ? (
            <div className="flex items-center gap-2 mb-2">
              {renderStars(facility.averageRating)}
              <span className="text-sm font-semibold text-tropical-black">
                {facility.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-tropical-black/60">
                ({facility.totalReviews} {facility.totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          ) : (
            <div className="text-sm text-tropical-black/60 mb-2">
              No reviews yet
            </div>
          )}
        </div>
        
        {/* Short Description */}
        {facility.description && (
          <p className="text-tropical-black/70 text-sm line-clamp-2 mb-3">
            {facility.description}
          </p>
        )}
        
        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
          <div className="flex items-center gap-1.5 text-tropical-green-deep">
            <Users className="h-4 w-4" />
            <span className="font-medium">{facility.capacity} guests</span>
          </div>
          {facility.floorArea && (
            <div className="flex items-center gap-1.5 text-tropical-green-deep">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">{facility.floorArea} sqm</span>
            </div>
          )}
          {facility.bedrooms && (
            <div className="flex items-center gap-1.5 text-tropical-green-deep">
              <span className="font-medium">🛏️ {facility.bedrooms} bed{facility.bedrooms > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
        
        {/* Price */}
        <div className="mb-4 pb-4 border-b-2 border-tropical-tan/20">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold bg-gradient-tropical bg-clip-text text-transparent">
              {formatCurrency(totalPrice, "PHP")}
            </div>
            <div className="text-sm text-tropical-black/60">
              total
            </div>
          </div>
          <div className="text-xs text-tropical-black/60 font-medium">
            {formatCurrency(facility.price, "PHP")} × {nights} night{nights > 1 ? 's' : ''}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="space-y-2">
          {/* View Details and Reviews */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="w-full border-2 border-tropical-green/30 hover:border-tropical-green hover:bg-tropical-green/10"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onViewReviews}
              className="w-full border-2 border-tropical-blue/30 hover:border-tropical-blue hover:bg-tropical-blue/10"
              disabled={facility.totalReviews === 0}
            >
              <MessageSquare className="h-4 w-4 mr-1.5" />
              Reviews ({facility.totalReviews})
            </Button>
          </div>
          
          {/* Select Facility Button */}
          <Button
            size="lg"
            onClick={onSelect}
            disabled={isSelecting}
            className="w-full bg-gradient-to-r from-tropical-green to-tropical-blue hover:from-tropical-green/90 hover:to-tropical-blue/90 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isSelecting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Reserving...
              </>
            ) : (
              <>
                ✅ Select Facility
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-tropical-black/60 italic">
            Click "View Details" or "Reviews" to learn more
          </p>
        </div>
      </div>
    </TropicalCard>
  );
}
