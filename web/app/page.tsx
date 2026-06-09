import Link from "next/link";
import { getAllMasters } from "@/lib/data";

export default function Home() {
  const masters = getAllMasters();

  return (
    <main className="landing">
      <div className="logo">
        nav<span>bar</span>
      </div>
      <h1>
        Онлайн-запись к мастеру <span>за 30 секунд</span>
      </h1>
      <p>
        Клиенты записываются по ссылке — без звонков и без установки
        приложения. Расписание, база клиентов и напоминания в Telegram для
        барберов и мастеров красоты.
      </p>
      <div className="section-title">Демо-страница мастера</div>
      {masters.map((m) => (
        <Link key={m.slug} href={`/${m.slug}`} className="demo-link">
          <div>
            <div className="service-name">{m.name}</div>
            <div className="service-duration">
              {m.specialization} · navbar.uz/{m.slug}
            </div>
          </div>
          <span className="arrow">→</span>
        </Link>
      ))}
    </main>
  );
}
