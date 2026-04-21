// src/app/contacto/page.tsx
import { MessageSquare, Mail, ExternalLink } from "lucide-react";

export default function ContactoPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[70dvh] gap-6 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
        <MessageSquare size={28} className="text-muted-foreground" />
      </div>
      <div>
        <h1 className="font-[family-name:var(--font-syne)] font-bold text-2xl mb-2">Contacto</h1>
        <p className="text-muted-foreground text-sm max-w-xs">¿Tenés una idea, querés reportar algo o simplemente decir hola?</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <a href="mailto:hola@404noexiste.uy" className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-4 hover:bg-muted transition-colors">
          <Mail size={18} />
          <span className="text-sm font-medium">hola@404noexiste.uy</span>
        </a>
        <a href="https://instagram.com/404noexiste" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-card border border-border rounded-2xl px-5 py-4 hover:bg-muted transition-colors">
          <ExternalLink size={18} />
          <span className="text-sm font-medium">@404noexiste</span>
        </a>
      </div>
    </div>
  );
}