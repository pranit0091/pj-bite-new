import { Briefcase, Leaf, Heart, Sprout, ArrowRight, MapPin, Clock } from "lucide-react";
import CareersForm from "./CareersForm";

const OPEN_ROLES = [
  {
    title: "Field Sourcing Executive",
    type: "Full-time",
    location: "Maharashtra / Field",
    desc: "Work directly with our farmer partners to source premium quality fruits and ensure supply chain integrity.",
    tags: ["Agriculture", "Field Work", "Logistics"],
  },
  {
    title: "Quality Control Analyst",
    type: "Full-time",
    location: "Nagpur, Maharashtra",
    desc: "Oversee lab testing, batch verification, and quality standards across all product lines.",
    tags: ["Food Science", "Lab", "FSSAI"],
  },
  {
    title: "Digital Marketing Specialist",
    type: "Full-time",
    location: "Remote / Hybrid",
    desc: "Drive brand awareness and customer acquisition through creative digital campaigns and content strategy.",
    tags: ["SEO", "Social Media", "Content"],
  },
  {
    title: "Operations & Logistics Coordinator",
    type: "Full-time",
    location: "Nagpur, Maharashtra",
    desc: "Manage order fulfilment, warehouse operations, and last-mile delivery coordination.",
    tags: ["Operations", "Logistics", "Supply Chain"],
  },
  {
    title: "Customer Experience Executive",
    type: "Full-time",
    location: "Remote",
    desc: "Ensure every customer interaction reflects our commitment to quality, responsiveness, and care.",
    tags: ["Customer Support", "CRM", "Communication"],
  },
];

const VALUES = [
  { icon: Leaf, title: "Mission-Driven", desc: "Join a team building something meaningful — bridging farmers and conscious consumers." },
  { icon: Heart, title: "People First", desc: "We invest in our team's growth, wellness, and work-life harmony." },
  { icon: Sprout, title: "Grow Fast", desc: "Early-stage startup energy with the structure to accelerate your career." },
];

export default function CareersPage() {
  return (
    <div className="bg-[#FAF7F2] min-h-screen">

      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-[#111A0E]">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #1E5C2A 0%, transparent 50%), radial-gradient(circle at 80% 20%, #C4951A 0%, transparent 40%)" }} />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-32 pb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">We&rsquo;re Hiring · Join Our Team</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white font-serif leading-[1.02] tracking-tight mb-6 text-balance">
            Build the Future<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-yellow-300">
              of Real Food
            </span>
          </h1>
          <p className="text-white/60 text-lg sm:text-xl font-medium leading-relaxed max-w-2xl mx-auto">
            PJ Bite is a farm-to-consumer brand on a mission to make honest, zero-additive nutrition
            accessible to everyone. We&rsquo;re growing fast and looking for passionate people to grow with us.
          </p>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#FAF7F2] to-transparent" />
      </section>

      {/* ── WHY JOIN US ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-4">Why PJ Bite</span>
          <h2 className="text-4xl font-black text-brand-text font-serif">A Place Where Purpose Meets Work</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-white border border-[#E8E6E1] rounded-2xl p-8 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-11 h-11 bg-brand-primary/10 rounded-xl flex items-center justify-center mb-5">
                <v.icon className="w-5 h-5 text-brand-primary" />
              </div>
              <h3 className="text-base font-black text-brand-text mb-2">{v.title}</h3>
              <p className="text-sm text-brand-text-muted font-medium leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OPEN POSITIONS ── */}
      <section className="bg-white border-y border-[#E8E6E1] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-black text-brand-primary uppercase tracking-[0.2em] mb-4">Open Roles</span>
            <h2 className="text-4xl font-black text-brand-text font-serif">Current Openings</h2>
          </div>
          <div className="space-y-4">
            {OPEN_ROLES.map((role) => (
              <div key={role.title}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#FAF7F2] border border-[#E8E6E1] rounded-2xl hover:border-brand-primary/40 hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base font-black text-brand-text">{role.title}</h3>
                    {role.tags.map((tag) => (
                      <span key={tag} className="text-[10px] font-bold text-brand-primary bg-brand-primary/8 px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-brand-text-muted font-medium mb-3 leading-relaxed">{role.desc}</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-text-muted">
                      <Clock className="w-3.5 h-3.5" /> {role.type}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-brand-text-muted">
                      <MapPin className="w-3.5 h-3.5" /> {role.location}
                    </span>
                  </div>
                </div>
                <a href="#apply"
                  className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-xs font-black rounded-xl hover:bg-[#164a20] transition-colors uppercase tracking-widest">
                  Apply <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-brand-text-muted font-medium">
              Don&rsquo;t see a role that fits? Send us a general application — we&rsquo;re always open to great talent.
            </p>
          </div>
        </div>
      </section>

      {/* ── APPLICATION FORM ── */}
      <section id="apply" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Briefcase className="w-7 h-7 text-brand-primary" />
          </div>
          <h2 className="text-4xl font-black text-brand-text font-serif mb-3">Apply Now</h2>
          <p className="text-brand-text-muted font-medium">
            Fill in your details and we&rsquo;ll get back to you within 3–5 business days.
          </p>
        </div>
        <CareersForm roles={OPEN_ROLES.map((r) => r.title)} />
      </section>

    </div>
  );
}
