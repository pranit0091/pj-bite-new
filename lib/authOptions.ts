import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./mongodb";
import User from "@/models/User";
import OTP from "@/models/Otp";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp:   { label: "OTP",   type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) {
          throw new Error("Phone and OTP are required");
        }

        await dbConnect();

        const otpRecord = await OTP.findOne({
          phone: credentials.phone,
          createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
        });

        if (!otpRecord) {
          throw new Error("OTP expired. Please request a new one.");
        }

        const isValid = await bcrypt.compare(credentials.otp, otpRecord.otp);
        if (!isValid) {
          throw new Error("Incorrect OTP. Please try again.");
        }

        // Delete the used OTP immediately
        await OTP.deleteOne({ _id: otpRecord._id });

        // Find or create the user by phone
        let user = await User.findOne({ phone: credentials.phone });
        if (!user) {
          user = await User.create({
            name: `User ${credentials.phone.slice(-4)}`,
            email: `phone_${credentials.phone}@pjbite.local`,
            phone: credentials.phone,
            role: "CUSTOMER",
          });
        }

        if (user.isBlocked) {
          throw new Error("Your account has been suspended. Please contact support.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false; // Fail auth if no email provided by Google
        
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const newUser = await User.create({
            email: user.email,
            name: user.name || "Google User",
            image: user.image ? String(user.image) : undefined,
            role: "CUSTOMER", // Default role
          });
          user.id = newUser._id.toString();
        } else {
          user.id = existingUser._id.toString();
          (user as any).role = existingUser.role;
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // user is the return value of authorize() and signIn()
        token.role = (user as any).role || "CUSTOMER"; 
        token.id = user.id;
      }
      // If we need to fetch the user from DB again (for Google OAuth)
      if (!token.role && token.email) {
         await dbConnect();
         const dbUser = await User.findOne({ email: token.email });
         if (dbUser) {
           token.role = dbUser.role;
           token.id = dbUser._id.toString();
         }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        if (session.user) {
          (session.user as any).role = token.role;
          (session.user as any).id = token.id;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
