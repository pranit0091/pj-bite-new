import { Metadata } from "next";
import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import ProductActionButtons from "@/components/checkout/ProductActionButtons";
import ProductAccordions from "@/components/ui/ProductAccordions";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductReviews from "@/components/products/ProductReviews";
import RelatedProducts from "@/components/products/RelatedProducts";
import ProductShareButton from "@/components/products/ProductShareButton";
import { Leaf, ShieldCheck, Truck, CheckCircle2, Star } from "lucide-react";

export const revalidate = 0; // SSR

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const product = await Product.findOne({ slug }).lean() as any;

  if (!product) return {};

  const title = `${product.name} | Nature's Nutrition`;
  const plainDesc = product.description 
    ? product.description.replace(/<[^>]+>/g, '').slice(0, 155) + '...'
    : `Buy 100% natural ${product.name}. Farm direct, no added sugar.`;

  const ogImages = product.images && product.images.length > 0 
    ? product.images.map((img: any) => ({ url: typeof img === 'string' ? img : img.url }))
    : [];

  return {
    title,
    description: plainDesc,
    openGraph: {
      title,
      description: plainDesc,
      url: `https://www.pjbite.com/products/${slug}`,
      images: ogImages,
      type: "article", // Next.js doesn't natively have "product" directly in og types, but standard OG uses article or website for generic pages. Product schema handles the rest.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: plainDesc,
      images: ogImages.map((i: any) => i.url),
    }
  };
}
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  await dbConnect();
  
  const productRaw = await Product.findOne({ slug }).lean();

  if (!productRaw) {
    notFound();
  }
  const product = JSON.parse(JSON.stringify(productRaw));

  // Fetch related products (same category, excluding current)
  const relatedRaw = await Product.find({ 
    categoryId: (productRaw as any).categoryId, 
    _id: { $ne: (productRaw as any)._id } 
  }).limit(4).lean();
  const relatedProducts = JSON.parse(JSON.stringify(relatedRaw));

  // Dynamic Array Parsing
  const heroHighlights = Array.isArray(product.heroHighlights) ? product.heroHighlights : [];
  const claims = Array.isArray(product.claims) && product.claims.length > 0 ? product.claims : ["100% Pure & Organic", "No Preservatives", "Farm Fresh"];
  const images = Array.isArray(product.images) ? product.images : [];

  // Logic to calculate savings
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const savingsPercent = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  // Map generic icons for dynamic active claims (Trust badges area)
  const trustIcons = [Leaf, ShieldCheck, Truck];

  // Construct JSON-LD Schema
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": images.length > 0 ? (typeof images[0] === 'string' ? images[0] : images[0].url) : "",
    "description": product.description ? product.description.replace(/<[^>]+>/g, '') : "",
    "brand": {
      "@type": "Brand",
      "name": "PJ Bite"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.pjbite.com/products/${slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition"
    }
  };

  return (
    <div className="bg-brand-bg relative min-h-screen pb-36 lg:pb-32 font-sans selection:bg-brand-primary/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Cinematic Ambient Background */}
      <div className="absolute top-0 right-0 w-[50vw] max-w-[600px] h-[400px] bg-gradient-to-bl from-brand-primary/10 via-brand-accent/5 to-transparent blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-0 w-[40vw] max-w-[400px] h-[400px] bg-gradient-to-tr from-brand-accent/5 to-transparent blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 pt-4 sm:pt-8 lg:pt-16 xl:pt-20 relative z-10">
        
        {/* Main Grid Split: Gallery left, Content right */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.4fr_1fr] gap-6 lg:gap-16 xl:gap-24 items-start">
          
          {/* Left Column: Gallery */}
          <div className="w-full">
            <ProductImageGallery images={images} />
          </div>

          {/* Right Column: SaaS Bento Content */}
          <div className="flex flex-col w-full">
            
            {/* Header Block */}
            <div className="mb-8">
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="bg-white/80 backdrop-blur-md shadow-sm border border-[#E8E6E1]/60 text-brand-primary text-[10px] uppercase font-black tracking-[0.2em] px-3.5 py-1.5 rounded-full">
                  Premium Selection
                </span>
                {heroHighlights[0] && (
                   <span className="text-[11px] font-bold text-brand-text-muted tracking-wider uppercase bg-brand-bg px-3 py-1 rounded-full border border-[#E8E6E1]/50">
                     {heroHighlights[0]}
                   </span>
                )}
                {/* Simulated Review Stars (Optional integration) */}
                <div className="flex items-center gap-1 ml-auto">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-gray-500 ml-1">(4.9)</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-brand-text tracking-tighter font-serif leading-[1.1]">
                  {product.name}
                </h1>
                
                {/* Share Option */}
                <ProductShareButton productName={product.name} />
              </div>

              {product.tagline && (
                <p className="text-base text-brand-text-muted font-medium italic mt-2">
                  "{product.tagline}"
                </p>
              )}
            </div>

            {/* Pricing Bento Box */}
            <div className="bg-white/60 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 premium-shadow mb-8 relative overflow-hidden group">
              {/* Highlight ribbon */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-500" />
              
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
                <p className="text-4xl font-black text-brand-text tracking-tight flex items-start">
                  <span className="text-xl font-bold text-gray-400 mt-1 mr-1">₹</span>
                  {product.price.toLocaleString()}
                </p>
                
                {hasDiscount && (
                  <div className="flex flex-col pb-1">
                    <p className="text-xl font-bold text-gray-400 line-through decoration-gray-300">₹{product.originalPrice.toLocaleString()}</p>
                    <p className="text-sm font-black text-brand-accent uppercase tracking-wider">Save {savingsPercent}%</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] uppercase tracking-[0.15em] text-brand-text-muted font-bold mt-4 pt-4 border-t border-gray-100">
                Inclusive of all taxes. Free shipping on orders above ₹999.
              </p>
            </div>

            {/* Interactive SaaS Buttons Bento */}
            <div className="bg-white p-6 rounded-[2rem] border border-[#E8E6E1]/80 premium-shadow mb-8 z-30">
              <ProductActionButtons 
                product={JSON.parse(JSON.stringify(product))}
              />
            </div>

            {/* Dynamic Claims / Highlights Bento Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 mb-8 bg-[#fbfbfb] p-6 rounded-[2rem] border border-[#E8E6E1]/50">
              {claims.slice(0, 4).map((claim: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-brand-accent" />
                  </div>
                  <span className="text-sm font-bold text-brand-text leading-tight">{claim}</span>
                </div>
              ))}
            </div>

            {/* Description Editorial Box */}
            {product.description && (
              <div className="mb-8">
                <h3 className="text-[11px] font-black text-brand-text uppercase tracking-[0.2em] mb-4">The Story</h3>
                <p className="text-brand-text-muted text-[14px] leading-[1.8] font-medium text-left">
                  {product.description}
                </p>
              </div>
            )}

            {/* Custom SVG Icons Section (Premium Dry Fruits Features) */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center mb-10 pt-4">
              {[
                { 
                  title: "100% NATURAL", 
                  subtitle: "NO PRESERVATIVES",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-primary relative z-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 20A7 7 0 0114 9h4v4a8 8 0 01-11 5l-4 4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 9s0 3-4 6" />
                    </svg>
                  )
                },
                { 
                  title: "FARM DIRECT", 
                  subtitle: "SOURCING",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-primary relative z-10">
                      <circle cx="12" cy="12" r="4" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2 M12 20v2 M4.93 4.93l1.41 1.41 M17.66 17.66l1.41 1.41 M2 12h2 M20 12h2 M4.93 19.07l1.41-1.41 M17.66 6.34l1.41-1.41" />
                    </svg>
                  )
                },
                { 
                  title: "PREMIUM GRADE", 
                  subtitle: "HANDPICKED",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-primary relative z-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15l-3 3-5-1 1-5-3-3 4-2 2-5 3 2 4-2 2 5 4 2-3 3 1 5-5 1z" />
                    </svg>
                  )
                },
                { 
                  title: "NUTRIENT RICH", 
                  subtitle: "HEALTHY",
                  svg: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-brand-primary relative z-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  )
                },
              ].map((item, idx) => (
                <div key={`svg-icon-${idx}`} className="flex flex-col items-center group">
                  <div className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] rounded-full border-[1.5px] border-brand-primary flex flex-col items-center justify-center mb-3 group-hover:bg-brand-primary/5 transition-colors duration-300 relative">
                     <div className="absolute inset-2 border-[0.5px] border-brand-primary/30 rounded-full"></div>
                     {item.svg}
                  </div>
                  <p className="text-[9px] sm:text-[10px] uppercase tracking-wide font-bold text-brand-primary leading-tight px-1 flex flex-col items-center justify-start text-center">
                    <span>{item.title}</span>
                    <span>{item.subtitle}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Info Accordions (Ingredients, Nutrition, Benefits) */}
            <div className="pt-2">
              <h3 className="text-[11px] font-black text-brand-text uppercase tracking-[0.2em] mb-4">Product Details</h3>
              <div className="bg-white rounded-[2rem] border border-[#E8E6E1]/80 premium-shadow overflow-hidden">
                <ProductAccordions 
                  ingredients={product.ingredients}
                  nutrition={product.nutrition}
                  benefits={product.benefits}
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── RICH DESCRIPTION BANNERS (Optional) ── */}
      {product.descriptionImages && product.descriptionImages.length > 0 && (
        <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center mt-16 sm:mt-24 px-4 sm:px-6 mb-8">
          {product.descriptionImages.map((imgUrl: string, idx: number) => (
            <img 
              key={`desc-banner-${idx}`}
              src={imgUrl} 
              alt={`${product.name} Description Banner ${idx + 1}`}
              className="w-full h-auto object-contain block" // block removes bottom gap, object-contain preserves ratio
            />
          ))}
        </div>
      )}

      {/* Verified Buyer Reviews - Integrated Component (Full Width Grid Bottom) */}
      <div className="mt-32 border-t border-[#E8E6E1] bg-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-serif font-black text-brand-text tracking-tight mb-3">Customer Reviews</h2>
            <p className="text-sm text-brand-text-muted font-medium">Real feedback from verified buyers.</p>
          </div>
          <ProductReviews productId={product._id.toString()} />
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
