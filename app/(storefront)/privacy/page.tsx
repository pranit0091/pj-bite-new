import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | PJ Bite",
  description: "Learn how PJ Bite collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "March 23, 2025";

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-brand-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-brand-text font-serif tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-sm text-brand-text-muted font-medium">Last Updated: {lastUpdated}</p>
        </div>

        {/* Intro */}
        <div className="bg-brand-bg rounded-3xl p-8 border border-[#E8E6E1] mb-10">
          <p className="text-brand-text-muted leading-relaxed font-medium">
            At PJ Bite, we deeply respect your privacy. This Privacy Policy explains how we collect, use, 
            disclose, and safeguard your information when you visit our website or make a purchase. 
            Please read this policy carefully. If you do not agree, please discontinue use of the site.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 text-brand-text-muted font-medium leading-relaxed">

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">1. Information We Collect</h2>
            <p className="mb-4">We may collect information about you in a variety of ways:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-brand-text">Personal Data:</strong> Name, email address, phone number, shipping address, and payment details when you register or place an order.</li>
              <li><strong className="text-brand-text">Device Data:</strong> IP address, browser type, operating system, referring URLs, and pages visited, collected automatically via cookies.</li>
              <li><strong className="text-brand-text">Transaction Data:</strong> Details about purchases you make on our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>To process and fulfill your orders and send related information.</li>
              <li>To create and manage your account.</li>
              <li>To send you transactional emails and marketing communications (with your consent).</li>
              <li>To improve our website, products, and customer experience.</li>
              <li>To comply with legal obligations and resolve disputes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">3. Sharing Your Information</h2>
            <p className="mb-4">We do not sell or rent your personal information. We may share your data with:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><strong className="text-brand-text">Payment Processors:</strong> (e.g., Razorpay) to securely process transactions.</li>
              <li><strong className="text-brand-text">Logistics Partners:</strong> To fulfill and ship your orders.</li>
              <li><strong className="text-brand-text">Analytics Providers:</strong> (e.g., Google Analytics) to analyze site usage.</li>
              <li><strong className="text-brand-text">Legal Authorities:</strong> When required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">4. Cookies</h2>
            <p>
              We use cookies to enhance your experience on our site. You may disable cookies through your browser settings; however, some features of the site may not function properly without them.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">5. Data Security</h2>
            <p>
              We implement commercially reasonable security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">6. Your Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Access and receive a copy of your personal data.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your personal data (subject to legal obligations).</li>
              <li>Opt out of marketing communications at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">7. Children's Privacy</h2>
            <p>
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-brand-text font-serif mb-4">9. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
            <div className="mt-4 bg-brand-bg rounded-2xl p-6 border border-[#E8E6E1]">
              <p><strong className="text-brand-text">PJ Bite</strong></p>
              <p>Email: <a href="mailto:infopjbite@gmail.com" className="text-brand-primary hover:underline font-bold">infopjbite@gmail.com</a></p>
              <p>Phone: +91 7744929395</p>
              <p>Address: At Post Gaul, Taluka Deoli, District Wardha, Maharashtra, India 442101</p>
            </div>
          </section>
        </div>

        {/* Policy Links */}
        <div className="mt-16 pt-10 border-t border-[#E8E6E1]">
          <p className="text-sm text-brand-text-muted font-medium text-center mb-6">Related Policies</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/terms" className="font-bold text-brand-primary hover:underline">Terms of Service</Link>
            <span className="text-[#E8E6E1]">•</span>
            <Link href="/shipping" className="font-bold text-brand-primary hover:underline">Shipping Policy</Link>
            <span className="text-[#E8E6E1]">•</span>
            <Link href="/refunds" className="font-bold text-brand-primary hover:underline">Refunds & Returns</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
