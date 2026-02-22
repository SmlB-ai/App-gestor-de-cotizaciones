"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Package,
  Users,
  FileText,
  Settings,
  LayoutDashboard,
  Calculator
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Materiales", href: "/materials", icon: Package },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Trabajos & PDF", href: "/jobs", icon: FileText },
  { name: "Configuración", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-white/80 backdrop-blur-xl border-r border-zinc-200/50 dark:bg-zinc-950/80 dark:border-zinc-800/50">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <span>GestorPro</span>
        </h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-300",
                isActive
                  ? "bg-white text-blue-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800 dark:text-blue-400 dark:shadow-none"
                  : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-400 group-hover:text-zinc-500 dark:text-zinc-500 dark:group-hover:text-zinc-400"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">Mi Empresa</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Configuración lista</p>
          </div>
        </div>
      </div>
    </div>
  );
}
