"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: { href: string; icon: string; label: string }[] = [
  { href: "/today", icon: "🌸", label: "Today" },
  { href: "/train", icon: "🏋️", label: "Train" },
  { href: "/meals", icon: "🍓", label: "Meals" },
  { href: "/progress", icon: "📈", label: "Progress" },
  { href: "/settings", icon: "⚙️", label: "You" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-app border-t px-1.5 pt-2"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
      }}
    >
      {ITEMS.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/today" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-0.5 py-0.5 text-[10.5px] font-bold"
            style={{ color: active ? "var(--accent)" : "var(--muted)" }}
          >
            <span className="text-xl leading-none">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
