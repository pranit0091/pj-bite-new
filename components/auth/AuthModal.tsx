"use client";

import { useState, useEffect } from "react";
import {
  X, Mail, ArrowRight, ShieldCheck,
  Leaf, Loader2, CheckCircle2, User as UserIcon, KeyRound,
  AlertCircle, Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { showToast } from "@/lib/swal";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register" | "forgot" | "reset" | "verify-register" | "phone-otp";
type LoginMethod = "email" | "phone";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal } = useCartStore();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setMode("login");
      setLoginMethod("email");
      setError("");
      setIsSuccess(false);
      setPhone("");
      setOtp("");
    }
    return () => { document.body.style.overflow = ""; };
  }, [isAuthModalOpen]);

  const { status } = useSession();
  useEffect(() => {
    if (status === "authenticated" && isAuthModalOpen) {
      const timer = setTimeout(() => closeAuthModal(), 500);
      return () => clearTimeout(timer);
    }
  }, [status, isAuthModalOpen, closeAuthModal]);

  // ── Email/password login ──────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Invalid email or password");
      showToast("Invalid email or password", "error");
      setLoading(false);
    } else {
      handleSuccess("Welcome back!");
    }
  };

  // ── Send OTP to phone ─────────────────────────────────────────────────────
  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("OTP sent to your mobile!", "success");
      setOtp("");
      setMode("phone-otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP (from phone-otp mode) ─────────────────────────────────────
  const handleResendPhoneOtp = async () => {
    setError(""); setOtp("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("New OTP sent!", "success");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify phone OTP and sign in ──────────────────────────────────────────
  const handlePhoneOtpLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await signIn("phone-otp", { phone, otp, redirect: false });
    if (res?.error) {
      setError("Invalid or expired OTP. Please try again.");
      setLoading(false);
    } else {
      handleSuccess("Welcome!");
    }
  };

  // ── Email registration ────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      showToast("Verification code sent to your email!", "success");
      setMode("verify-register");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify email OTP after registration ───────────────────────────────────
  const handleVerifyRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/verify-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.ok) {
        handleSuccess("Account created successfully!");
      } else {
        showToast("Account created! Please sign in.", "success");
        setMode("login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ───────────────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Recovery code sent to your email!", "success");
      setMode("reset");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send recovery code");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password ────────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast("Password reset successfully!", "success");
      setMode("login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (msg: string) => {
    setIsSuccess(true);
    showToast(msg, "success");
    setTimeout(() => {
      closeAuthModal();
      router.refresh();
    }, 800);
  };

  const currentSubmit =
    mode === "phone-otp"                           ? handlePhoneOtpLogin :
    mode === "login" && loginMethod === "phone"    ? handleSendPhoneOtp :
    mode === "login"                               ? handleLogin :
    mode === "register"                            ? handleRegister :
    mode === "verify-register"                     ? handleVerifyRegister :
    mode === "forgot"                              ? handleForgotPassword :
                                                     handleResetPassword;

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-brand-text/70 backdrop-blur-[6px] z-[100]"
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.97, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.97, opacity: 0, y: 16 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white w-full max-w-md rounded-[2rem] p-7 sm:p-10 pointer-events-auto shadow-[0_30px_80px_-20px_rgba(26,32,16,0.35)] relative overflow-hidden border border-[#EAE7DD]"
            >
              <button
                onClick={closeAuthModal}
                aria-label="Close"
                className="absolute top-5 right-5 w-9 h-9 rounded-full border border-[#EAE7DD] bg-white hover:bg-brand-bg text-brand-text-muted hover:text-brand-text transition-all z-10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-brand-primary/12 to-brand-accent/8 blur-2xl rounded-full pointer-events-none" />
              <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-brand-accent/10 blur-2xl rounded-full pointer-events-none" />

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="py-12 text-center relative z-10"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-brand-text mb-2">Welcome!</h2>
                    <p className="text-brand-text-muted font-medium">Authentication successful.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="relative z-10"
                  >
                    {/* ── Header ── */}
                    <div className="text-center mb-7 mt-1">
                      <div className="inline-flex items-center justify-center gap-2 text-brand-primary font-black text-[10px] uppercase tracking-[0.35em] leading-none mb-4">
                        <Leaf className="w-3.5 h-3.5" />
                        <span>PJ Bite</span>
                      </div>
                      <h2 className="font-serif font-black text-brand-text leading-[1.05] tracking-tight"
                          style={{ fontSize: "clamp(1.7rem, 4vw, 2.25rem)", letterSpacing: "-0.015em" }}>
                        {mode === "login"           && "Welcome Back"}
                        {mode === "register"        && "Create Account"}
                        {mode === "forgot"          && "Reset Password"}
                        {mode === "reset"           && "Verify OTP"}
                        {mode === "verify-register" && "Verify Account"}
                        {mode === "phone-otp"       && "Verify Phone"}
                      </h2>
                      <p className="text-[12px] text-brand-text-muted font-medium mt-2.5 leading-relaxed">
                        {mode === "login"           && "Sign in to your PJ Bite account"}
                        {mode === "register"        && "Join us — fresh dry fruits at your door"}
                        {mode === "forgot"          && "We'll send you a verification code"}
                        {mode === "reset"           && "Enter the OTP we just emailed you"}
                        {mode === "verify-register" && "Confirm your email to finish signing up"}
                        {mode === "phone-otp"       && "Enter the 6-digit code we sent"}
                      </p>
                    </div>

                    {/* ── Google + method tabs (login & register only) ── */}
                    {(mode === "login" || mode === "register") && (
                      <>
                        <button
                          onClick={() => signIn("google")}
                          className="w-full h-12 bg-white border border-[#E8E6E1] rounded-xl flex items-center justify-center gap-3 hover:bg-brand-bg hover:border-brand-primary/30 transition-all group mb-4"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                          </svg>
                          <span className="text-xs font-black text-brand-text uppercase tracking-widest">
                            Continue with Google
                          </span>
                        </button>

                        {/* Email | Phone OTP tabs — login only */}
                        {mode === "login" ? (
                          <div className="flex items-center gap-1 p-1 bg-brand-bg rounded-xl mb-4">
                            <button
                              type="button"
                              onClick={() => { setLoginMethod("email"); setError(""); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                loginMethod === "email"
                                  ? "bg-white text-brand-primary shadow-sm"
                                  : "text-brand-text-muted hover:text-brand-text"
                              }`}
                            >
                              <Mail className="w-3 h-3" /> Email
                            </button>
                            <button
                              type="button"
                              onClick={() => { setLoginMethod("phone"); setError(""); }}
                              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                loginMethod === "phone"
                                  ? "bg-white text-brand-primary shadow-sm"
                                  : "text-brand-text-muted hover:text-brand-text"
                              }`}
                            >
                              <Smartphone className="w-3 h-3" /> Phone OTP
                            </button>
                          </div>
                        ) : (
                          <div className="relative py-2 mb-1">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-[#E8E6E1]" />
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                              <span className="bg-white px-3 text-brand-text-muted/60">OR EMAIL</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Error banner ── */}
                    {error && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={currentSubmit} className="space-y-4">

                      {/* Name — register only */}
                      {mode === "register" && (
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted/60 group-focus-within:text-brand-primary transition-colors" />
                          <input
                            type="text" required value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:font-medium placeholder:text-brand-text-muted/50"
                            placeholder="Full Name"
                          />
                        </div>
                      )}

                      {/* Email — email login, register, forgot */}
                      {((mode === "login" && loginMethod === "email") || mode === "register" || mode === "forgot") && (
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted/60 group-focus-within:text-brand-primary transition-colors" />
                          <input
                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:font-medium placeholder:text-brand-text-muted/50"
                            placeholder="Email Address"
                          />
                        </div>
                      )}

                      {/* Phone number — phone login mode */}
                      {mode === "login" && loginMethod === "phone" && (
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-text-muted/70 group-focus-within:text-brand-primary transition-colors select-none pointer-events-none">
                            +91
                          </span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                            className="w-full pl-14 pr-4 py-3.5 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold tracking-wider focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:font-medium placeholder:tracking-normal placeholder:text-brand-text-muted/50"
                            placeholder="10-digit mobile number"
                            maxLength={10}
                          />
                        </div>
                      )}

                      {/* Email being verified — verify-register and reset */}
                      {(mode === "verify-register" || mode === "reset") && (
                        <div className="bg-brand-bg p-3 rounded-xl border border-brand-primary/10 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-black text-brand-text-muted">Verifying email</span>
                            <span className="text-xs font-bold text-brand-text">{email}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMode(mode === "verify-register" ? "register" : "forgot")}
                            className="text-[10px] font-black text-brand-primary uppercase hover:underline"
                          >
                            Change
                          </button>
                        </div>
                      )}

                      {/* Phone being verified — phone-otp mode */}
                      {mode === "phone-otp" && (
                        <div className="bg-brand-bg p-3 rounded-xl border border-brand-primary/10 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-wider font-black text-brand-text-muted">OTP sent to</span>
                            <span className="text-xs font-bold text-brand-text">+91 {phone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setMode("login"); setLoginMethod("phone"); setError(""); setOtp(""); }}
                            className="text-[10px] font-black text-brand-primary uppercase hover:underline"
                          >
                            Change
                          </button>
                        </div>
                      )}

                      {/* OTP input — email verify, password reset, phone-otp */}
                      {(mode === "reset" || mode === "verify-register" || mode === "phone-otp") && (
                        <div className="relative group">
                          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted/60 group-focus-within:text-brand-primary transition-colors" />
                          <input
                            type="text" required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            className="w-full pl-11 pr-4 py-3.5 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold tracking-[0.3em] font-mono focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:font-medium placeholder:tracking-normal placeholder:font-sans placeholder:text-brand-text-muted/50"
                            placeholder="6-Digit OTP" maxLength={6}
                          />
                        </div>
                      )}

                      {/* Password — email login, register, reset */}
                      {((mode === "login" && loginMethod === "email") || mode === "register" || mode === "reset") && (
                        <div className="space-y-1.5">
                          <div className="relative group">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-muted/60 group-focus-within:text-brand-primary transition-colors" />
                            <input
                              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-11 pr-4 py-3.5 bg-brand-bg/50 border border-[#E8E6E1] rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all placeholder:font-medium placeholder:text-brand-text-muted/50 tracking-widest placeholder:tracking-normal"
                              placeholder={mode === "reset" ? "New Password" : "Password"}
                              minLength={6}
                            />
                          </div>
                          {mode === "login" && loginMethod === "email" && (
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => { setMode("forgot"); setError(""); }}
                                className="text-[11px] font-bold text-brand-text-muted hover:text-brand-primary transition-colors"
                              >
                                Forgot password?
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Submit button */}
                      <button
                        type="submit" disabled={loading}
                        className="group w-full h-13 py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-black text-[11px] rounded-xl transition-all duration-300 flex items-center justify-center gap-2.5 mt-3 disabled:opacity-50 uppercase tracking-[0.25em] shadow-[0_10px_24px_-8px_rgba(121,174,111,0.55)] hover:shadow-[0_14px_28px_-8px_rgba(121,174,111,0.7)] hover:-translate-y-0.5"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                          <>
                            {mode === "login" && loginMethod === "email"  && "Sign In"}
                            {mode === "login" && loginMethod === "phone"  && "Send OTP"}
                            {mode === "register"                          && "Send OTP"}
                            {mode === "forgot"                            && "Send OTP"}
                            {mode === "verify-register"                   && "Verify & Proceed"}
                            {mode === "reset"                             && "Verify & Proceed"}
                            {mode === "phone-otp"                         && "Verify & Login"}
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>

                    {/* ── Footer links ── */}
                    <div className="text-center text-[11px] font-bold text-brand-text-muted mt-6">
                      {mode === "login" && (
                        <p>Don't have an account?{" "}
                          <button type="button" onClick={() => { setMode("register"); setError(""); }} className="text-brand-primary hover:underline ml-1">Sign up</button>
                        </p>
                      )}
                      {mode === "register" && (
                        <p>Already have an account?{" "}
                          <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-brand-primary hover:underline ml-1">Sign in</button>
                        </p>
                      )}
                      {mode === "verify-register" && (
                        <p>Wrong email?{" "}
                          <button type="button" onClick={() => { setMode("register"); setError(""); }} className="text-brand-primary hover:underline ml-1">Change details</button>
                        </p>
                      )}
                      {(mode === "forgot" || mode === "reset") && (
                        <p>Remember your password?{" "}
                          <button type="button" onClick={() => { setMode("login"); setError(""); }} className="text-brand-primary hover:underline ml-1">Back to login</button>
                        </p>
                      )}
                      {mode === "phone-otp" && (
                        <p>Didn't receive the OTP?{" "}
                          <button
                            type="button"
                            onClick={handleResendPhoneOtp}
                            disabled={loading}
                            className="text-brand-primary hover:underline ml-1 disabled:opacity-50"
                          >
                            Resend
                          </button>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-brand-text-muted/50 uppercase tracking-[0.1em] border-t border-[#F0EDE8]/50 pt-5 mt-5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Encrypted & Secure
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
