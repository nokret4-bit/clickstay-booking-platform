"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NavbarClient } from "@/components/navbar-client";
import { Footer } from "@/components/footer";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Clock, Users, MapPin, Palmtree, ArrowRight, AlertCircle } from "lucide-react";
import { format, addDays } from "date-fns";

export default function BookPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <BookPageContent />
    </Suspense>
  );
}

function BookPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect message from URL params
  const redirectMessage = searchParams.get("message");

  // Set minimum date to today
  const today = format(new Date(), "yyyy-MM-dd");

  const categories = [
    {
      id: "ROOM",
      name: "Rooms",
      description: "Comfortable accommodations with modern amenities",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "COTTAGE", 
      name: "Cottages",
      description: "Spacious private cottages perfect for families",
      icon: Palmtree,
      color: "from-green-500 to-emerald-500"
    },
    {
      id: "HALL",
      name: "Function Halls",
      description: "Elegant venues for events and gatherings",
      icon: MapPin,
      color: "from-purple-500 to-pink-500"
    }
  ];

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSearchAvailability = async () => {
    if (!checkInDate || !checkOutDate) {
      return;
    }

    if (selectedCategories.length === 0) {
      return;
    }

    setIsLoading(true);

    // Build query parameters
    const params = new URLSearchParams({
      from: checkInDate,
      to: checkOutDate,
      types: selectedCategories.join(",")
    });

    router.push(`/browse/availability?${params.toString()}`);
  };

  const isFormValid = checkInDate && checkOutDate && selectedCategories.length > 0;
  const isCheckOutValid = checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate);

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarClient />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-tropical-blue/20 via-tropical-green-soft/10 to-tropical-yellow/10 py-20 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-tropical-yellow/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-tropical-red/10 rounded-full blur-3xl" style={{animationDelay: '1s'}} />
          
          <div className="container mx-auto px-4 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-tropical-yellow/90 text-tropical-black px-6 py-2 rounded-full mb-6 shadow-lg">
              <CalendarDays className="h-5 w-5" />
              <span className="font-semibold">Start Your Booking Journey</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent">
                Find Your Perfect Stay
              </span>
            </h1>
            
            <p className="text-xl text-tropical-black mb-8 max-w-2xl mx-auto font-medium drop-shadow-md bg-white/40 backdrop-blur-sm px-6 py-3 rounded-2xl">
              Select your dates and preferences to discover available facilities tailored to your needs
            </p>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Redirect Message Alert */}
              {redirectMessage && (
                <Alert className="mb-6 border-tropical-yellow/50 bg-tropical-yellow/10">
                  <AlertCircle className="h-4 w-4 text-tropical-yellow" />
                  <AlertDescription className="text-tropical-black">
                    {redirectMessage}
                  </AlertDescription>
                </Alert>
              )}
              
              <Card className="shadow-xl border-0">
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-3xl font-bold text-tropical-black">
                    Tell Us About Your Stay
                  </CardTitle>
                  <CardDescription className="text-lg text-tropical-black/90 font-medium">
                    Let us know when you're visiting and what type of accommodation you prefer
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="checkin" className="text-base font-semibold flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-tropical-green" />
                        Check-in Date
                      </Label>
                      <input
                        id="checkin"
                        type="date"
                        min={today}
                        value={checkInDate}
                        onChange={(e) => {
                          setCheckInDate(e.target.value);
                          // Auto-set checkout to next day if not set or invalid
                          if (!checkOutDate || new Date(checkOutDate) <= new Date(e.target.value)) {
                            setCheckOutDate(format(addDays(new Date(e.target.value), 1), "yyyy-MM-dd"));
                          }
                        }}
                        className="w-full h-14 px-4 border-2 border-tropical-tan/20 rounded-xl focus:border-tropical-green focus:outline-none text-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="checkout" className="text-base font-semibold flex items-center gap-2">
                        <Clock className="h-5 w-5 text-tropical-red" />
                        Check-out Date
                      </Label>
                      <input
                        id="checkout"
                        type="date"
                        min={checkInDate || today}
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className={`w-full h-14 px-4 border-2 rounded-xl focus:outline-none text-lg ${
                          checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate)
                            ? "border-red-300 focus:border-red-400"
                            : "border-tropical-tan/20 focus:border-tropical-green"
                        }`}
                      />
                      {checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate) && (
                        <p className="text-sm text-red-500 mt-1">Check-out must be after check-in date</p>
                      )}
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-4">
                    <Label className="text-base font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5 text-tropical-blue" />
                      What type of facility are you looking for?
                    </Label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {categories.map((category) => {
                        const Icon = category.icon;
                        const isSelected = selectedCategories.includes(category.id);
                        
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => handleCategoryToggle(category.id)}
                            className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                              isSelected
                                ? "border-tropical-green bg-gradient-to-br from-tropical-green/5 to-tropical-blue/5 shadow-lg scale-105"
                                : "border-tropical-tan/20 hover:border-tropical-green/50 hover:shadow-md"
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mb-4`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            
                            <h3 className="text-lg font-bold text-tropical-black mb-2">
                              {category.name}
                            </h3>
                            
                            <p className="text-sm text-tropical-black/70">
                              {category.description}
                            </p>
                            
                            {isSelected && (
                              <div className="absolute top-3 right-3 w-6 h-6 bg-tropical-green rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">✓</span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    
                    {selectedCategories.length === 0 && (
                      <p className="text-sm text-tropical-black/50 text-center">
                        Please select at least one category to continue
                      </p>
                    )}
                  </div>

                  {/* Search Button */}
                  <div className="pt-4">
                    <TropicalButton
                      size="lg"
                      className="w-full h-16 text-lg font-semibold"
                      disabled={!isFormValid || !isCheckOutValid || isLoading}
                      onClick={handleSearchAvailability}
                    >
                      {isLoading ? (
                        "Searching Availability..."
                      ) : (
                        <>
                          Search Available Facilities
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </TropicalButton>
                    
                    <p className="text-center text-sm text-tropical-black/60 mt-3">
                      We'll show you only facilities available for your selected dates
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
