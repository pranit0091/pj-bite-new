"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Tags, Package, ShoppingCart, LogOut,
  Bell, Ticket, Menu, X, FileText, Image as ImageIcon, RotateCcw,
  Truck, Store, ChevronRight, HelpCircle, MessageSquare, Shield,
  Sparkles, Settings2, IndianRupee, Briefcase,
} from "lucide-react";

type Role = "SUPERADMIN" | "VENDOR" | "CUSTOMER";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  session: { user?: { name?: string | null } };
  role: Role;
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  navigation: NavItem[];
}

function SidebarContent({
  session,
  role,
  pathname,
  sidebarOpen,
  setSidebarOpen,
  navigation,
}: SidebarProps) {
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-white/5">
        <Link
          href="/admin/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/navbarlogo.png"
            alt="PJ Bite"
            className="h-8 object-contain brightness-0 invert"
          />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-full border border-brand-accent/20">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="md:hidden text-white/40 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Back to Store */}
      <div className="px-4 pt-4">
        <Link
          href="/"
          onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest transition-all border border-white/5 hover:border-white/10 group"
        >
          <Store className="w-4 h-4 text-brand-accent shrink-0" />
          Back to Store
          <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-4 no-scrollbar">
        <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.25em] mb-3 px-2">
          Menu
        </p>
        <nav className="space-y-0.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30"
                    : "text-white/50 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 shrink-0 ${
                    active
                      ? "text-brand-accent"
                      : "text-white/30 group-hover:text-white/60"
                  }`}
                />
                <span className="text-sm font-semibold">{item.name}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-brand-primary flex items-center justify-center text-white text-sm font-black shrink-0">
            {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate leading-tight">
              {session?.user?.name || "Admin"}
            </p>
            <p className="text-[10px] font-bold text-brand-accent uppercase tracking-wider">
              {role}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/20 rounded-xl transition-all uppercase tracking-widest"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.replace("/login");
      return;
    }

    const role = (session.user as { role: Role }).role;
    if (role !== "SUPERADMIN" && role !== "VENDOR") {
      router.replace("/");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-brand-accent rounded-full animate-spin" />
      </div>
    );
  }

  const role = (session.user as { role: Role }).role;
  const isSuperAdmin = role === "SUPERADMIN";

  if (role !== "SUPERADMIN" && role !== "VENDOR") return null;

  const NAVIGATION: NavItem[] = [
    { name: "Overview",   href: "/admin/dashboard",  icon: LayoutDashboard },
    ...(isSuperAdmin ? [{ name: "Vendors", href: "/admin/vendors", icon: Users }] : []),
    { name: "Users",      href: "/admin/users",      icon: Users },
    { name: "Categories", href: "/admin/categories", icon: Tags },
    { name: "Products",   href: "/admin/products",   icon: Package },
    { name: "Orders",     href: "/admin/orders",     icon: ShoppingCart },
    { name: "Refunds",    href: "/admin/refunds",    icon: RotateCcw },
    { name: "Shipping",          href: "/admin/shipping",         icon: Truck },
    { name: "Shipping Charges", href: "/admin/shipping-charges", icon: IndianRupee },
    { name: "Vouchers",   href: "/admin/coupons",    icon: Ticket },
    { name: "Blogs",            href: "/admin/blogs",            icon: FileText },
    { name: "Banners",          href: "/admin/banners",          icon: ImageIcon },
    { name: "FAQs",             href: "/admin/faqs",             icon: HelpCircle },
    { name: "Testimonials",     href: "/admin/testimonials",     icon: MessageSquare },
    { name: "Quality Cards",    href: "/admin/quality-cards",    icon: Shield },
    { name: "Benefit Products", href: "/admin/benefit-products", icon: Sparkles },
    { name: "Home Settings",    href: "/admin/home-settings",    icon: Settings2 },
    { name: "Job Openings",     href: "/admin/job-openings",     icon: Briefcase },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#F4F5F7] flex font-sans text-brand-text relative">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          print:hidden fixed md:static inset-y-0 left-0 z-50
          w-64 bg-[#111A0E] flex-shrink-0 flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0 shadow-2xl shadow-black/40" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <SidebarContent
          session={session}
          role={role}
          pathname={pathname}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          navigation={NAVIGATION}
        />
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col min-w-0">

        {/* Top Header */}
        <header className="print:hidden h-14 bg-white border-b border-[#E8E6E1] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="md:hidden w-9 h-9 flex items-center justify-center text-brand-text-muted hover:text-brand-text hover:bg-[#F4F5F7] rounded-lg transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold text-brand-text-muted hover:text-brand-primary transition-colors bg-[#F4F5F7] hover:bg-brand-primary/5 px-3 py-2 rounded-lg border border-[#E8E6E1] hover:border-brand-primary/20 group"
            >
              <Store className="w-3.5 h-3.5 text-brand-primary" />
              Back to Store
            </Link>

            <span className="md:hidden text-sm font-black text-brand-text capitalize">
              {pathname.split("/").pop()?.replace(/-/g, " ") || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-brand-primary uppercase tracking-widest bg-brand-primary/5 px-3 py-1.5 rounded-full border border-brand-primary/10">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
              System Operational
            </div>

            <button
              aria-label="Notifications"
              className="relative w-9 h-9 flex items-center justify-center rounded-lg bg-[#F4F5F7] border border-[#E8E6E1] hover:bg-brand-primary/5 transition-colors"
            >
              <Bell className="w-4 h-4 text-brand-text-muted" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-accent rounded-full border-2 border-white" />
            </button>

            <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white text-xs font-black">
              {session?.user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto pb-20 md:pb-6 print:p-0 print:m-0">
          {children}
        </div>
      </main>
    </div>
  );
}