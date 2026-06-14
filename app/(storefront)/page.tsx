import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import BenefitProduct from "@/models/BenefitProduct";
import Category from "@/models/Category";
import { Banner } from "@/models/Banner";
import FAQ from "@/models/FAQ";
import Testimonial from "@/models/Testimonial";
import QualityCard from "@/models/QualityCard";
import HomeSettings from "@/models/HomeSettings";
import HomeClient from "./HomeClient";

export const revalidate = 0;

export default async function HomePage() {
  await dbConnect();

  const [
    rawBanners,
    rawCategories,
    rawNewArrivals,
    featuredRaw,
    rawFaqs,
    rawTestimonials,
    rawQualityCards,
    rawBenefitProducts,
    rawHomeSettings,
  ] = await Promise.all([
    Banner.find({ type: "home", active: true }).sort({ order: 1 }).lean(),
    Category.find({}).select("name slug image").lean(),
    Product.find({}).sort({ createdAt: -1 }).limit(8).lean(),
    Product.find({ isFeatured: true }).limit(4).lean(),
    FAQ.find({ active: true }).sort({ order: 1 }).lean(),
    Testimonial.find({ active: true }).sort({ order: 1 }).lean(),
    QualityCard.find({ active: true }).sort({ order: 1 }).lean(),
    BenefitProduct.find({ active: true }).sort({ order: 1, createdAt: 1 }).lean(),
    HomeSettings.findOne().lean(),
  ]);

  // Fall back to latest if no featured products
  const rawProducts =
    featuredRaw.length > 0
      ? featuredRaw
      : await Product.find({}).sort({ createdAt: -1 }).limit(4).lean();

  // Serialize — strip ObjectIds before passing to Client Components
  const dbBanners = rawBanners.map((b) => ({
    imageUrl: b.imageUrl as string,
    title: b.title as string,
  }));

  const dbCategories = rawCategories.map((c) => ({
    _id: c._id.toString(),
    name: c.name as string,
    slug: c.slug as string,
    image: (c.image as string) || "",
  }));

  const dbProducts = rawProducts.map((p) => ({
    _id: p._id.toString(),
    name: p.name as string,
    slug: p.slug as string,
    price: p.price as number,
    originalPrice: (p.originalPrice as number) || undefined,
    images: (p.images as string[]) || [],
    vendorId: p.vendorId?.toString() || "",
    stock: typeof p.stock === "number" ? p.stock : 0,
  }));

  const dbNewArrivals = rawNewArrivals.map((p) => ({
    _id: p._id.toString(),
    name: p.name as string,
    slug: p.slug as string,
    price: p.price as number,
    originalPrice: (p.originalPrice as number) || undefined,
    images: (p.images as string[]) || [],
    vendorId: p.vendorId?.toString() || "",
    stock: typeof p.stock === "number" ? p.stock : 0,
  }));

  const dbFaqs = rawFaqs.map((f: any) => ({
    _id: f._id.toString(),
    question: f.question as string,
    answer: f.answer as string,
    order: f.order as number,
  }));

  const dbTestimonials = rawTestimonials.map((t: any) => ({
    _id: t._id.toString(),
    name: t.name as string,
    location: (t.location as string) || "",
    detail: (t.detail as string) || "",
    text: t.text as string,
    rating: t.rating as number,
  }));

  const dbQualityCards = rawQualityCards.map((c: any) => ({
    _id: c._id.toString(),
    title: c.title as string,
    desc: c.desc as string,
    img: c.img as string,
    alt: (c.alt as string) || "",
    order: c.order as number,
    reportUrl: (c.reportUrl as string) || "",
  }));

  const dbBenefitProducts = rawBenefitProducts.map((p: any) => ({
    _id: p._id.toString(),
    name: p.name as string,
    tagline: (p.tagline as string) || "",
    benefits: (p.benefits as string[]) || [],
    desc: (p.desc as string) || "",
    iconType: (p.iconType as string) || "mixed",
    bgColor: (p.bgColor as string) || "bg-amber-50",
    image: "",
  }));

  const hs = rawHomeSettings as any;
  const dbHomeSettings = hs
    ? {
        trustStrip: (hs.trustStrip || []).map((x: any) => ({ label: x.label, subline: x.subline, iconType: x.iconType })),
        benefits: (hs.benefits || []).map((x: any) => ({ label: x.label, sub: x.sub, iconName: x.iconName })),
        purposes: (hs.purposes || []).map((x: any) => ({ label: x.label, iconName: x.iconName, href: x.href })),
        qualityClaims: (hs.qualityClaims || []) as string[],
        whyPjBite: (hs.whyPjBite || []).map((x: any) => ({ title: x.title, desc: x.desc, iconName: x.iconName })),
        howItWorks: (hs.howItWorks || []).map((x: any) => ({ step: x.step, label: x.label, desc: x.desc, iconName: x.iconName })),
        bulkOrder: { badge: hs.bulkOrder?.badge || "", title: hs.bulkOrder?.title || "", subtitle: hs.bulkOrder?.subtitle || "" },
      }
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.pjbite.com/#organization",
        name: "PJ Bite",
        url: "https://www.pjbite.com",
        logo: "https://www.pjbite.com/pjbite-logo.svg",
        description:
          "Premium selection of 100% natural dried fruits and healthy snacks. No added sugar, no preservatives.",
        sameAs: [
          "https://www.instagram.com/pjbite",
          "https://www.facebook.com/pjbite",
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: dbFaqs.slice(0, 5).map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient
        dbBanners={dbBanners}
        dbProducts={dbProducts}
        dbCategories={dbCategories}
        dbNewArrivals={dbNewArrivals}
        dbFaqs={dbFaqs}
        dbTestimonials={dbTestimonials}
        dbQualityCards={dbQualityCards}
        dbBenefitProducts={dbBenefitProducts}
        dbHomeSettings={dbHomeSettings}
      />
    </>
  );
}
