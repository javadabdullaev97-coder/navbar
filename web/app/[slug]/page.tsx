import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMasterBySlug } from "@/lib/data";
import BookingWidget from "@/components/BookingWidget";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const master = getMasterBySlug(slug);
  if (!master) return { title: "Мастер не найден — Navbar" };
  return {
    title: `${master.name} — запись онлайн | Navbar`,
    description: `${master.specialization}, ${master.address}. Онлайн-запись без звонков.`,
  };
}

export default async function MasterPage({ params }: Props) {
  const { slug } = await params;
  const master = getMasterBySlug(slug);
  if (!master) notFound();

  const initial = master.name.charAt(0).toUpperCase();

  return (
    <main className="container">
      <div className="logo">
        nav<span>bar</span>
      </div>

      <div className="master-header">
        <div className="avatar">{initial}</div>
        <div>
          <div className="master-name">{master.name}</div>
          <div className="master-spec">{master.specialization}</div>
          <div className="master-address">{master.address}</div>
        </div>
      </div>
      <p className="master-bio">{master.bio}</p>

      <BookingWidget master={master} />
    </main>
  );
}
