import Link from "next/link";
import { Leaf, ShieldCheck, Sprout, Truck, Award, ArrowRight, Check } from "lucide-react";

const TEAM = [
  {
    name: "Pranit Pandurang Nagpure",
    role: "Founder & CEO",
    tag: "Quality Lead Auditor",
    image: "/img11.jpg",
    objectPosition: "top",
    bio: "B.Sc. Agriculture · M.Sc. Food Technology · Organic Inspection & Food Safety Expert",
  },
  {
    name: "Vaibhav Rithe",
    role: "Senior Advisor",
    tag: "Agri-Innovation",
    image: "/img14.jpg",
    objectPosition: "center",
    bio: "Agriculture Entrepreneur · Rural Development · Carbon Credit Systems",
  },
  {
    name: "Aditya Raut",
    role: "Technical Lead",
    tag: "AgriTech",
    image: "/img16.jpg",
    objectPosition: "top",
    bio: "Technology + Farming Background · Sustainable Solutions Architect",
  },
  {
    name: "Dnyandip Pawar",
    role: "Operations & Brand",
    tag: "Communications",
    image: "/img19.jpg",
    objectPosition: "top",
    bio: "Digital Branding · Strategic Communication · Content Creator",
  },
];

const STATS = [
  { value: "50+", label: "Farmer Partners", icon: "🌾" },
  { value: "12+", label: "SKUs Launched", icon: "🍃" },
  { value: "2K+", label: "Happy Customers", icon: "❤️" },
  { value: "100%", label: "Zero Additives", icon: "✅" },
];

const VALUES = [
  {
    icon: Leaf,
    title: "Direct from Farmers",
    desc: "We work directly with farmers, cutting out middlemen to ensure fair value at every level of the supply chain.",
  },
  {
    icon: ShieldCheck,
    title: "Globally Certified",
    desc: "Our manufacturing process meets globally recognised food safety standards. Every batch is verified.",
  },
  {
    icon: Sprout,
    title: "Natural Technology",
    desc: "Solar-dried and naturally preserved — zero chemicals, zero preservatives. Just nature doing its work.",
  },
  {
    icon: Truck,
    title: "Farm-to-Door Promise",
    desc: "From harvest to your hands, every step is optimised for freshness, traceability, and transparency.",
  },
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Rigorous quality control at every stage ensures you receive only the finest produce in every order.",
  },
  {
    icon: Check,
    title: "Honest Ingredients",
    desc: "Our labels list exactly what's inside. No hidden additives, no deceptive processing — just real food.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-brand-bg min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden bg-[#0E1A0F]">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 18% 55%, #79AE6F 0%, transparent 55%), radial-gradient(circle at 82% 22%, #F4C542 0%, transparent 45%)" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(0,0,0,0.5))] pointer-events-none" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-32 pb-24">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-sm mb-9">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
            <span className="text-white/70 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.35em]">Our Story · Est. 2024</span>
          </div>
          <h1 className="font-serif font-black text-white leading-[1.02] tracking-tight mb-9 text-balance"
              style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", letterSpacing: "-0.025em" }}>
            Rooted in Soil,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent via-brand-accent-light to-brand-accent">
              Driven by Purpose
            </span>
          </h1>
          <p className="text-white/65 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-12">
            PJ Bite is building a transparent farm-to-consumer ecosystem — bringing naturally preserved,
            zero-additive dried fruits from the farm directly to you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/products"
              className="group inline-flex items-center gap-2.5 bg-brand-accent text-brand-text font-black text-[11px] sm:text-xs px-8 py-4 rounded-full hover:bg-brand-accent-dark transition-all duration-300 uppercase tracking-[0.25em] shadow-[0_14px_32px_-10px_rgba(244,197,66,0.6)] hover:-translate-y-0.5">
              Explore Products <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-2 text-white/85 hover:text-white text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] transition-colors border-b border-white/25 hover:border-white pb-1">
              Get in Touch
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-brand-bg to-transparent pointer-events-none" />
      </section>

      {/* ── BENTO STATS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white border border-[#E8E6E1] rounded-2xl p-6 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl sm:text-4xl font-black text-brand-primary font-serif">{s.value}</div>
              <div className="text-xs font-bold text-brand-text-muted uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-5 border-l-4 border-brand-primary pl-4">Our Mission</span>
            <h2 className="text-4xl md:text-5xl font-black text-brand-text font-serif leading-tight mb-8">
              Bridging Farmers &amp;<br />Conscious Consumers
            </h2>
            <div className="space-y-5 text-[#4A5568] font-medium leading-relaxed">
              <p>We work directly with farmers to source fresh, high-quality fruits, ensuring fair value and strong partnerships at the grassroots level. By eliminating unnecessary middlemen, we create a system that benefits everyone.</p>
              <p>Using natural drying technology, we convert fresh fruits into nutrient-rich snacks that preserve original taste, color, and nutritional value — <strong className="text-brand-text font-black">without preservatives, chemicals, or artificial ingredients.</strong></p>
            </div>
            <div className="mt-8 inline-flex items-center gap-3 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl px-5 py-3">
              <ShieldCheck className="w-5 h-5 text-brand-primary shrink-0" />
              <span className="text-sm font-bold text-brand-text">Globally Certified Manufacturing</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="relative bg-[#111A0E] rounded-[2rem] p-8 sm:p-10 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <p className="text-brand-accent text-[10px] font-black uppercase tracking-[0.25em] mb-4">The PJ Bite Story</p>
                <blockquote className="text-lg sm:text-xl font-serif italic text-white/90 leading-relaxed mb-6 border-l-2 border-brand-accent pl-5">
                  &ldquo;Born from the soil — rooted in real farming experiences and driven by a vision to create meaningful change.&rdquo;
                </blockquote>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/img11.jpg" alt="Pranit" className="w-10 h-10 rounded-full object-cover object-top border-2 border-brand-accent/40" />
                  <div>
                    <p className="text-sm font-black text-white">Pranit Pandurang Nagpure</p>
                    <p className="text-xs text-white/50 font-medium">Founder &amp; Quality Lead Auditor</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="bg-white py-28 border-y border-[#E8E6E1]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-4">What We Stand For</span>
            <h2 className="text-4xl md:text-5xl font-black text-brand-text font-serif">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map((v, i) => (
              <div key={v.title}
                className={`group relative rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
                  ${i === 0 ? "bg-brand-primary border-brand-primary" : "bg-[#FAF7F2] border-[#E8E6E1] hover:border-brand-primary/30"}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-5
                  ${i === 0 ? "bg-white/15" : "bg-brand-primary/10"}`}>
                  <v.icon className={`w-5 h-5 ${i === 0 ? "text-white" : "text-brand-primary"}`} />
                </div>
                <h3 className={`text-base font-black mb-2 ${i === 0 ? "text-white" : "text-brand-text"}`}>{v.title}</h3>
                <p className={`text-sm leading-relaxed font-medium ${i === 0 ? "text-white/70" : "text-brand-text-muted"}`}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="py-28 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-4">The People Behind PJ Bite</span>
          <h2 className="text-4xl md:text-5xl font-black text-brand-text font-serif mb-4">Meet Our Team</h2>
          <p className="text-brand-text-muted max-w-lg mx-auto font-medium">Passionate individuals united by a shared belief — that honest food and fair farming can coexist beautifully.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM.map((member) => (
            <div key={member.name}
              className="group bg-white border border-[#E8E6E1] rounded-2xl p-6 text-center hover:border-brand-primary/30 hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-500 hover:-translate-y-1">

              {/* Circle photo */}
              <div className="relative mx-auto w-36 h-36 mb-5">
                {/* Decorative ring */}
                <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20 group-hover:border-brand-primary/60 transition-colors duration-500 scale-110" />
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 ease-out"
                    style={{ objectPosition: member.objectPosition }}
                  />
                </div>
              </div>

              <h3 className="text-sm font-black text-brand-text font-serif leading-snug mb-1">{member.name}</h3>
              <p className="text-xs font-bold text-brand-primary uppercase tracking-wider mb-3">{member.role}</p>
              <p className="text-xs text-brand-text-muted leading-relaxed font-medium mb-3">{member.bio}</p>
              <div className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                <span className="text-[10px] font-bold text-brand-text-muted uppercase tracking-widest">{member.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="pb-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto bg-[#111A0E] rounded-[2.5rem] overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 30% 50%, rgba(30,92,42,0.5) 0%, transparent 60%), radial-gradient(circle at 80% 30%, rgba(196,149,26,0.15) 0%, transparent 50%)" }} />
          <div className="relative z-10 px-8 sm:px-16 py-16 sm:py-20 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left max-w-2xl">
              <p className="text-brand-accent text-xs font-black uppercase tracking-[0.25em] mb-4">Start Snacking Better</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-serif leading-tight mb-4 text-balance">
                Join the Wellness Revolution
              </h2>
              <p className="text-white/60 text-base font-medium leading-relaxed max-w-xl">
                Experience naturally dried, zero-additive premium fruits — delivered straight from the farm to your door.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/products"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-primary font-black text-sm px-8 py-4 rounded-full hover:bg-brand-bg transition-colors uppercase tracking-widest shadow-lg">
                Shop Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold text-sm px-8 py-4 rounded-full border border-white/20 hover:bg-white/15 transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
