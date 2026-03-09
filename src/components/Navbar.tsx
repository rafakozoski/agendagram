import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar, LayoutDashboard, LogIn, LogOut, Menu, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isPanel = location.pathname.startsWith("/admin") || location.pathname.startsWith("/painel");
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const panelLink = isAdmin ? "/admin" : "/painel";

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Reservagram</span>
        </Link>
        <div className="hidden md:flex items-center gap-3">
          {isPanel && user && (
            <>
              <Link to={panelLink}>
                <Button variant="default" size="sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Painel
                </Button>
              </Link>
              {isAdmin && !location.pathname.startsWith("/admin") && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              {isAdmin && location.pathname.startsWith("/admin") && (
                <Link to="/painel">
                  <Button variant="outline" size="sm">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Meu Negócio
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </>
          )}
          {!isPanel && (
            <>
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Início
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="ghost" size="sm">
                  Planos
                </Button>
              </Link>
              {user ? (
                <Link to={panelLink}>
                  <Button variant="default" size="sm" className="gradient-primary text-primary-foreground">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Painel
                  </Button>
                </Link>
              ) : (
                <Link to="/admin/login">
                  <Button variant="default" size="sm" className="gradient-primary text-primary-foreground">
                    <LogIn className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>
      {open && (
        <div className="md:hidden border-t bg-card px-6 py-4 space-y-2">
          <Link to="/" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Início</Button>
          </Link>
          <Link to="/pricing" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start">Planos</Button>
          </Link>
          {user ? (
            <>
              <Link to={panelLink} onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Painel
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" className="w-full justify-start" onClick={() => { signOut(); setOpen(false); }}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </>
          ) : (
            <Link to="/admin/login" onClick={() => setOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">
                <LogIn className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
