import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import DashboardClient, { type Booking, type MyMaster } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/login");

  await sb.rpc("claim_demo_master");
  const [{ data: bookings }, { data: master }] = await Promise.all([
    sb.rpc("get_my_bookings"),
    sb.rpc("get_my_master"),
  ]);

  return (
    <DashboardClient
      initialBookings={(bookings as Booking[]) ?? []}
      initialMaster={master as MyMaster}
      email={user.email ?? ""}
    />
  );
}
