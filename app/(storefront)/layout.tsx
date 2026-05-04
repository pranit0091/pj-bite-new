import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import CartSlideOver from "@/components/checkout/CartSlideOver";
import CheckoutSlideOver from "@/components/checkout/CheckoutSlideOver";
import AuthModal from "@/components/auth/AuthModal";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import HomeSettings from "@/models/HomeSettings";
import LoadingScreen from "@/components/ui/LoadingScreen";
import TopProgressBar from "@/components/ui/TopProgressBar";
import WishlistSyncWrapper from "@/components/layout/WishlistSyncWrapper";
import { Suspense } from "react";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user as
    | { name?: string | null; email?: string | null; image?: string | null; role?: string }
    | undefined;

  await dbConnect();

  const [rawCategories, rawHomeSettings] = await Promise.all([
    Category.find({}).select("name slug image").lean(),
    HomeSettings.findOne().lean(),
  ]);

  const categories: CategoryItem[] = rawCategories.map((cat) => ({
    _id: cat._id.toString(),
    name: cat.name as string,
    slug: cat.slug as string,
    image: (cat.image as string) || "",
  }));

  const hs = rawHomeSettings as { qualityClaims?: string[] } | null;
  const marqueeItems: string[] =
    hs?.qualityClaims && hs.qualityClaims.length > 0
      ? hs.qualityClaims
      : [];

  return (
    <>
      <LoadingScreen />

      <Suspense fallback={null}>
        <TopProgressBar />
      </Suspense>

      <Navbar user={user} categories={categories} marqueeItems={marqueeItems} />
      <CartSlideOver />
      <CheckoutSlideOver />
      <AuthModal />
      <WishlistSyncWrapper />
      <main className="flex-grow pb-16 lg:pb-0">{children}</main>
      <MobileBottomNav />
      <Footer />
    </>
  );
}