import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import DashboardClient, { type Booking } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // Привязываем демо-мастера к вошедшему (идемпотентно) и грузим брони
  await sb.rpc("claim_demo_master");
  const { data } = await sb.rpc("get_my_bookings");
  const bookings = (data as Booking[]) ?? [];

  return <DashboardClient initial={bookings} email={user.email ?? ""} />;
}
