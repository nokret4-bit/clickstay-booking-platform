import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Camera, Palmtree } from "lucide-react";
import { prisma } from "@/lib/prisma";

type GalleryImage = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
};

export default async function GalleryPage() {
  const galleryImages = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" }
    ],
  });
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tropical-blue/30 via-tropical-green-soft/20 to-tropical-yellow/20 py-24 overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-tropical-yellow/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-tropical-red/10 rounded-full blur-3xl" style={{animationDelay: '2s'}} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <Camera className="h-16 w-16 text-tropical-red mx-auto mb-6 animate-float" />
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-tropical-red via-tropical-yellow to-tropical-green bg-clip-text text-transparent">
              Resort Gallery
            </span>
          </h1>
          <div className="max-w-3xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-md px-8 py-4 mb-4">
            <p className="text-xl md:text-2xl text-tropical-black font-semibold">
              Experience Paradise Through Our Lens
            </p>
          </div>
          <p className="text-lg text-tropical-black font-semibold max-w-2xl mx-auto px-6 py-2 bg-white/70 backdrop-blur-sm rounded-xl">
            Explore the beauty of Manuel Resort through our stunning collection of photos
          </p>
        </div>
      </section>

      {/* Gallery Grid */}
      <main className="flex-1 py-16 bg-gradient-to-b from-white to-tropical-tan/10">
        <div className="container mx-auto px-4">
          {galleryImages.length === 0 ? (
            <div className="text-center py-16">
              <Palmtree className="h-20 w-20 text-tropical-tan mx-auto mb-4 opacity-50" />
              <p className="text-xl text-tropical-black font-bold drop-shadow-md">No gallery images available yet.</p>
              <p className="text-tropical-black/80 mt-2 font-medium drop-shadow-sm">Check back soon for beautiful photos of our resort!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image: GalleryImage, index: number) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  {/* Actual Image */}
                  <img 
                    src={image.imageUrl} 
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-tropical-black via-tropical-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div>
                      <div className="inline-block px-3 py-1 bg-tropical-yellow text-tropical-black text-xs font-bold rounded-full mb-2">
                        {image.category}
                      </div>
                      <h3 className="text-white text-xl font-bold">{image.title}</h3>
                      {image.description && (
                        <p className="text-white/90 text-sm mt-1">{image.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
