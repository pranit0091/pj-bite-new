import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import User from "@/models/User";
import DashboardClient from "./DashboardClient";

export default async function CustomerDashboardPage({
  searchParams,
}: {
  searchParams?: { order?: string; method?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;
  // Only redirect admins to admin panel when NOT arriving from an order completion
  if ((role === "SUPERADMIN" || role === "VENDOR") && searchParams?.order !== "placed") {
    redirect("/admin/dashboard");
  }

  const email = session.user?.email;

  await dbConnect();

  const userProfile = await User.findOne({ email }).lean();
  const orders = await Order.find({ "customerDetails.email": new RegExp(`^${email}$`, "i") }).sort({ createdAt: -1 }).lean();

  const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalOrders = orders.length;

  return (
    <DashboardClient 
      userProfile={JSON.parse(JSON.stringify(userProfile))} 
      orders={JSON.parse(JSON.stringify(orders))} 
      totalSpent={totalSpent} 
      totalOrders={totalOrders} 
    />
  );
}
