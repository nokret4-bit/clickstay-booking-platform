"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NavbarClient } from "@/components/navbar-client";
import { Footer } from "@/components/footer";
import { TropicalButton } from "@/components/tropical/tropical-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarDays, Clock, Users, Palmtree, ArrowRight, ArrowLeft, AlertCircle, Ticket, Building2 } from "lucide-react";
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
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Select type, Step 2: Select dates
  const [selectedType, setSelectedType] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const redirectMessage = searchParams.get("message");
  const today = format(new Date(), "yyyy-MM-dd");

  const isRoom = selectedType === "ROOM";
  const isCottage = selectedType === "COTTAGE";
  const isHall = selectedType === "HALL";

  const handleTypeSelect = (type: string) => {
    if (type === "TICKETS") {
      router.push("/tickets");
      return;
    }
    setSelectedType(type);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType("");
    setCheckInDate("");
    setCheckOutDate("");
  };

  const handleSearchAvailability = () => {
    if (isRoom && (!checkInDate || !checkOutDate)) return;
    if ((isCottage || isHall) && !checkInDate) return;

    setIsLoading(true);

    const from = checkInDate;
    const to = isRoom ? checkOutDate : format(addDays(new Date(checkInDate), 1), "yyyy-MM-dd");

    const params = new URLSearchParams({
      from,
      to,
      types: selectedType,
    });

    router.push(`/browse/availability?${params.toString()}`);
  };

  const isFormValid = isRoom
    ? checkInDate && checkOutDate && new Date(checkOutDate) > new Date(checkInDate)
    : checkInDate;

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
                {step === 1 ? "What Are You Looking For?" : isRoom ? "Select Your Stay Dates" : "Select Your Visit Date"}
              </span>
            </h1>
            
            <p className="text-xl text-tropical-black mb-8 max-w-2xl mx-auto font-medium drop-shadow-md bg-white/40 backdrop-blur-sm px-6 py-3 rounded-2xl">
              {step === 1
                ? "Choose your facility type to get started"
                : isRoom
                ? "Pick your check-in and check-out dates"
                : "Pick the date you'd like to visit"}
            </p>
          </div>
        </section>

        {/* Booking Form Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
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
                    {step === 1 ? "Choose Your Facility" : isRoom ? "Room Booking" : isHall ? "Function Hall Booking" : "Cottage Day Use"}
                  </CardTitle>
                  <CardDescription className="text-lg text-tropical-black/90 font-medium">
                    {step === 1
                      ? "Select the type of facility you want to book"
                      : isRoom
                      ? "Select your check-in and check-out dates"
                      : `Select the date for your ${isHall ? 'function hall' : 'cottage'} visit`}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8">
                  {/* STEP 1: Facility Type Selection */}
                  {step === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <button
                        type="button"
                        onClick={() => handleTypeSelect("ROOM")}
                        className="relative p-8 rounded-xl border-2 border-tropical-tan/20 hover:border-blue-400 hover:shadow-lg transition-all duration-300 text-left group"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-tropical-black mb-2">Room</h3>
                        <p className="text-sm text-tropical-black/70">Comfortable rooms for overnight stays with modern amenities</p>
                        <ArrowRight className="absolute top-4 right-4 h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeSelect("COTTAGE")}
                        className="relative p-8 rounded-xl border-2 border-tropical-tan/20 hover:border-green-400 hover:shadow-lg transition-all duration-300 text-left group"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Palmtree className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-tropical-black mb-2">Cottage</h3>
                        <p className="text-sm text-tropical-black/70">Day-use cottages for a relaxing getaway with your family</p>
                        <ArrowRight className="absolute top-4 right-4 h-5 w-5 text-gray-300 group-hover:text-green-500 transition-colors" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeSelect("HALL")}
                        className="relative p-8 rounded-xl border-2 border-tropical-tan/20 hover:border-purple-400 hover:shadow-lg transition-all duration-300 text-left group"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-tropical-black mb-2">Function Hall</h3>
                        <p className="text-sm text-tropical-black/70">Book a function hall for your event or gathering</p>
                        <ArrowRight className="absolute top-4 right-4 h-5 w-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeSelect("TICKETS")}
                        className="relative p-8 rounded-xl border-2 border-tropical-tan/20 hover:border-orange-400 hover:shadow-lg transition-all duration-300 text-left group"
                      >
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                          <Ticket className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-tropical-black mb-2">Tickets</h3>
                        <p className="text-sm text-tropical-black/70">Buy resort admission & event tickets</p>
                        <ArrowRight className="absolute top-4 right-4 h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: Date Selection */}
                  {step === 2 && (
                    <>
                      <div className="flex items-center gap-3 mb-2">
                        <button
                          onClick={handleBack}
                          className="flex items-center gap-1 text-tropical-green hover:underline font-medium text-sm"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to facility selection
                        </button>
                      </div>

                      {isRoom ? (
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
                      ) : (
                        <div className="max-w-md mx-auto space-y-3">
                          <Label htmlFor="visitDate" className="text-base font-semibold flex items-center gap-2">
                            <CalendarDays className="h-5 w-5 text-tropical-green" />
                            Visit Date
                          </Label>
                          <input
                            id="visitDate"
                            type="date"
                            min={today}
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full h-14 px-4 border-2 border-tropical-tan/20 rounded-xl focus:border-tropical-green focus:outline-none text-lg"
                          />
                          <p className="text-sm text-tropical-black/50">{isHall ? "Function halls are for day use only" : "Cottages are for day use only — no overnight stays"}</p>
                        </div>
                      )}

                      <div className="pt-4">
                        <TropicalButton
                          size="lg"
                          className="w-full h-16 text-lg font-semibold"
                          disabled={!isFormValid || isLoading}
                          onClick={handleSearchAvailability}
                        >
                          {isLoading ? (
                            "Searching Availability..."
                          ) : (
                            <>
                              Search Available {isRoom ? "Rooms" : isHall ? "Function Halls" : "Cottages"}
                              <ArrowRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </TropicalButton>
                        <p className="text-center text-sm text-tropical-black/60 mt-3">
                          We'll show you only {isRoom ? "rooms" : isHall ? "function halls" : "cottages"} available for your selected date{isRoom ? "s" : ""}
                        </p>
                      </div>
                    </>
                  )}
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
