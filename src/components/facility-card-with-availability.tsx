"use client";

import { Badge } from "@/components/ui/badge";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { TropicalCard } from "@/components/tropical/tropical-card";
import { Users, MapPin, CheckCircle, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FacilityCardWithAvailabilityProps {
  facility: {
    id: string;
    name: string;
    kind: string;
    description: string | null;
    capacity: number;
    price: number;
    photos: string[];
    pricingType?: string;
  };
  availability: Array<{ date: string; available: boolean; price: number }>;
  searchParams: {
    from: string;
    to: string;
    types: string;
  };
}

export function FacilityCardWithAvailability({ 
  facility, 
  availability,
  searchParams 
}: FacilityCardWithAvailabilityProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  
  const photos = facility.photos || [];
  const firstPhoto = photos[0];
  const kindLabel = facility.kind.charAt(0) + facility.kind.slice(1).toLowerCase();

  // Calculate total price based on pricing type and dates
  const nights = Math.ceil((new Date(searchParams.to).getTime() - new Date(searchParams.from).getTime()) / (1000 * 60 * 60 * 24));
  const actualNights = nights < 1 ? 1 : nights;
  const isPerHead = facility.pricingType === 'PER_HEAD' || facility.kind === 'HALL';
  const isPerUse = facility.pricingType === 'PER_USE' || facility.kind === 'COTTAGE';
  const totalPrice = isPerHead
    ? Number(facility.price) * facility.capacity
    : isPerUse
    ? Number(facility.price)
    : Number(facility.price) * actualNights;

  const handleViewDetails = () => {
    // Navigate to facility detail page with search parameters
    const params = new URLSearchParams({
      from: searchParams.from,
      to: searchParams.to,
      types: searchParams.types,
    });
    router.push(`/unit/${facility.id}?${params.toString()}`);
  };

  return (
    <TropicalCard className="overflow-hidden group relative">
      {/* Image Section with Overlay */}
      <div className="aspect-[4/3] bg-tropical-tan/20 relative overflow-hidden rounded-t-2xl">
        {firstPhoto && !imageError ? (
          <>
            <img 
              src={firstPhoto} 
              alt={facility.name} 
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-tropical-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-tropical">
            <span className="text-white text-6xl font-bold drop-shadow-lg">{facility.name.charAt(0)}</span>
          </div>
        )}
        
        {/* Floating Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-tropical-yellow text-tropical-black font-bold shadow-lg border-0">
            {kindLabel}
          </Badge>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-tropical-black mb-2 group-hover:text-tropical-red transition-colors">
            {facility.name}
          </h3>
          
          {facility.description && (
            <p className="text-tropical-black/70 text-sm line-clamp-2 mb-3">
              {facility.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1.5 text-tropical-green-deep">
              <Users className="h-4 w-4" />
              <span className="font-medium">{facility.capacity} guests</span>
            </div>
            <div className="flex items-center gap-1.5 text-tropical-green-deep">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Manuel Resort</span>
            </div>
          </div>

          {/* Availability Status */}
          <div className="flex items-center gap-2 text-sm text-green-600 mb-3">
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Available for selected dates</span>
          </div>
        </div>
        
        {/* Price */}
        <div className="pt-4 border-t-2 border-tropical-tan/20 mb-4">
          <div className="text-2xl font-bold bg-gradient-tropical bg-clip-text text-transparent">
            {formatCurrency(totalPrice, "PHP")}
          </div>
          <div className="text-xs text-tropical-black/60 font-medium">
            {isPerHead
              ? `day use • ${facility.capacity} guests`
              : isPerUse
              ? 'day use'
              : `total for ${actualNights} night${actualNights !== 1 ? 's' : ''}`}
          </div>
        </div>
        
        {/* Action Button */}
        <TropicalButton 
          size="md" 
          variant="primary"
          onClick={handleViewDetails}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </TropicalButton>
      </div>
    </TropicalCard>
  );
}
