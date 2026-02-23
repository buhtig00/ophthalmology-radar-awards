import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Home, Award, Vote, Upload, BarChart3, Settings,
  Menu, X, Eye, ChevronRight, LogOut, User, Calendar, ChevronDown, Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { name: "Inicio", page: "Home", icon: Home },
  { name: "Categorías", page: "Categories", icon: Award },
  { name: "Votar", page: "Voting", icon: Vote },
  { name: "Rankings", page: "Rankings", icon: BarChart3 },
  { name: "Calendario", page: "EventCalendar", icon: Calendar },
];

const DROPDOWN_ITEMS = {
  label: "Participar",
  icon: Upload,
  items: [
    { name: "Enviar Caso", page: "SubmitCase", icon: Upload },
    { name: "Comprar Pases", page: "BuyTicket", icon: Ticket },
  ]
};

const USER_ITEMS = [
  { name: "Mi Perfil", page: "Profile", icon: User },
];

const ADMIN_ITEMS = [
  { name: "Admin Panel", page: "Admin", icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const isAdmin = user?.role === "admin";
  const allItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ITEMS] : NAV_ITEMS;
  const allSidebarItems = [
    ...NAV_ITEMS,
    ...DROPDOWN_ITEMS.items,
    ...USER_ITEMS,
    ...(isAdmin ? ADMIN_ITEMS : [])
  ];

  if (currentPageName === "Home") {
    return (
      <div className="min-h-screen bg-[#0a0e1a]">
        <style>{`
          :root {
            --navy: #0a0e1a;
            --navy-light: #111827;
            --gold: #c9a84c;
            --gold-light: #e8d48b;
            --gold-dark: #a07c2e;
          }
        `}</style>
        {/* Floating nav for home */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to={createPageUrl("Home")} className="flex items-center gap-2">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c08734be772c3bc57b27f/6fd832a21_ophthalmologyrada2r.png" alt="Ophthalmology Radar" className="h-8" style={{filter: 'brightness(0) saturate(100%) invert(67%) sepia(45%) saturate(514%) hue-rotate(8deg) brightness(96%) contrast(86%)'}} />
              <span className="text-white font-semibold tracking-wide text-sm">AWARDS</span>
            </Link>
            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    currentPageName === item.page
                      ? "text-[#c9a84c] bg-[#c9a84c]/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-1 ${
                    DROPDOWN_ITEMS.items.some(i => i.page === currentPageName)
                      ? "text-[#c9a84c] bg-[#c9a84c]/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}>
                    {DROPDOWN_ITEMS.label}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0a0e1a]/95 border-white/10 backdrop-blur-xl">
                  {DROPDOWN_ITEMS.items.map(item => (
                    <DropdownMenuItem key={item.page} asChild>
                      <Link
                        to={createPageUrl(item.page)}
                        className="flex items-center gap-2 text-gray-300 hover:text-white cursor-pointer"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {isAdmin && ADMIN_ITEMS.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    currentPageName === item.page
                      ? "text-[#c9a84c] bg-[#c9a84c]/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm hidden sm:inline">{user.full_name || user.email}</span>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => base44.auth.logout()}>
                    <LogOut className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold" onClick={() => base44.auth.redirectToLogin()}>
                  Iniciar Sesión
                </Button>
              )}
              <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {mobileOpen && (
            <div className="md:hidden bg-[#0a0e1a]/95 backdrop-blur-xl border-t border-white/5 p-4 space-y-1">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
              <div className="border-t border-white/5 my-2 pt-2">
                <p className="text-gray-500 text-xs px-4 py-2 font-semibold">Participar</p>
                {DROPDOWN_ITEMS.items.map(item => (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
              {isAdmin && (
                <div className="border-t border-white/5 my-2 pt-2">
                  {ADMIN_ITEMS.map(item => (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1320] flex">
      <style>{`
        :root {
          --navy: #0a0a0a;
          --navy-light: #1a1a1a;
          --charcoal: #2a2a2a;
          --gold: #C9A227;
          --gold-light: #E8C547;
          --gold-dark: #9A7A1F;
        }
        body {
          background: #000000;
        }
      `}</style>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a0e1a] border-r border-white/5 fixed inset-y-0">
        <div className="p-5 border-b border-white/5">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c08734be772c3bc57b27f/6fd832a21_ophthalmologyrada2r.png" alt="Ophthalmology Radar" className="h-10" style={{filter: 'brightness(0) saturate(100%) invert(67%) sepia(45%) saturate(514%) hue-rotate(8deg) brightness(96%) contrast(86%)'}} />
            <div>
              <div className="text-[#c9a84c] text-xs font-medium tracking-widest">AWARDS 2026</div>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {allSidebarItems.map(item => (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group ${
                currentPageName === item.page
                  ? "bg-[#c9a84c]/10 text-[#c9a84c]"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1">{item.name}</span>
              {currentPageName === item.page && <ChevronRight className="w-3 h-3 opacity-50" />}
            </Link>
          ))}
        </nav>
        {user && (
          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center">
                <User className="w-4 h-4 text-[#c9a84c]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{user.full_name || user.email}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
              <Button size="icon" variant="ghost" className="text-gray-500 hover:text-white h-8 w-8" onClick={() => base44.auth.logout()}>
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/5">
        <div className="h-14 px-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699c08734be772c3bc57b27f/6fd832a21_ophthalmologyrada2r.png" alt="OR" className="h-6" style={{filter: 'brightness(0) saturate(100%) invert(67%) sepia(45%) saturate(514%) hue-rotate(8deg) brightness(96%) contrast(86%)'}} />
            <span className="text-[#c9a84c] font-semibold text-xs">2026</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="bg-[#0a0e1a] border-t border-white/5 p-3 space-y-1">
            {allSidebarItems.map(item => (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm ${
                  currentPageName === item.page ? "bg-[#c9a84c]/10 text-[#c9a84c]" : "text-gray-400"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            {user && (
              <button onClick={() => base44.auth.logout()} className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 w-full">
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="pt-14 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}