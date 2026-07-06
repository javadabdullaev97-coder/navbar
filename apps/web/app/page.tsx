import Link from "next/link";

// Корень — заглушка-навигация к демо-мастеру. Публичная запись живёт на /[slug].
export default function Home() {
  return (
    <main className="wrap">
      <div className="logo">
        nav<span>bar</span>
      </div>
      <h1>Онлайн-запись</h1>
      <p className="muted">Публичная страница мастера доступна по ссылке-slug.</p>
      <Link href="/asror" className="card" style={{ display: "block" }}>
        <strong>Демо: navbar / asror →</strong>
        <p className="muted" style={{ marginTop: 6 }}>
          Открыть публичную страницу барбера Асрора
        </p>
      </Link>
      <Link href="/login" className="card" style={{ display: "block" }}>
        <strong>Кабинет мастера →</strong>
        <p className="muted" style={{ marginTop: 6 }}>
          Вход для мастера: заявки и подтверждение записей
        </p>
      </Link>
    </main>
  );
}
