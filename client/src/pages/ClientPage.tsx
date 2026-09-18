import { useState } from "react";
import { Calendar, X, Menu } from "lucide-react";
import logoImg from "../assets/logo.png";
import heroImg from "../assets/heroa.png";
import { NewAppointment } from "../components/NewAppointment";

export function ClientPage() {
  // Estado do menu mobile
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Estado para controlar o Modal de Agendamento
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);

  // Handlers do Modal
  const handleOpenAppointment = () => setIsAppointmentOpen(true);
  const handleCloseAppointment = () => setIsAppointmentOpen(false);
  const handleAppointmentSuccess = () => {
    // Ação opcional ao agendar com sucesso (ex: mensagem toast ou log)
    console.log("Agendamento concluído com sucesso!");
  };

  const instagramPosts = [
    { id: 1, url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600", alt: "Degradê e barba" },
    { id: 2, url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600", alt: "Corte clássico" },
    { id: 3, url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600", alt: "Barba e toalha quente" },
    { id: 4, url: "https://images.unsplash.com/photo-1593702295094-aea22597af65?q=80&w=600", alt: "Corte moderno" },
    { id: 5, url: "https://images.unsplash.com/photo-1517832606589-7a598b3895c6?q=80&w=600", alt: "Fade cabelo e barba" },
    { id: 6, url: "https://images.unsplash.com/photo-1605497746444-ac9dbd324d48?q=80&w=600", alt: "Trabalho de tesoura" },
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-white font-sans selection:bg-[#c6a062] selection:text-black">
      
      {/* NAV BAR FIXA */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#121212]/60 backdrop-blur-md border-b border-amber-500/10 mt-6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between relative">
             
          <div className="relative w-36 h-10 flex items-center">
            <a href="#home" className="absolute top-1/2 -translate-y-1/2 left-0 z-10">
              <img 
                src={logoImg} 
                alt="Corvelloni A Forja" 
                className="h-28 md:h-36 w-auto max-w-none object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" 
              />
            </a>
          </div>

          {/* NAVEGAÇÃO DESKTOP */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#home" className="hover:text-[#c6a062] transition-colors">Início</a>
            <a href="#instagram" className="hover:text-[#c6a062] transition-colors">Galeria</a>
            <a href="#servicos" className="hover:text-[#c6a062] transition-colors">Sobre Nós</a>
            <a href="#agendamento" className="hover:text-[#c6a062] transition-colors">Meus Agendamento</a>
          </nav>

          {/* BOTÃO HEADER (CTA) */}
          <div className="hidden md:block">
            <button
              onClick={handleOpenAppointment}
              className="px-6 py-2.5 rounded-sm bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs tracking-wider uppercase hover:from-amber-500 hover:to-amber-600 transition-all shadow-md shadow-amber-900/30"
            >
              Agendar Agora
            </button>
          </div>

          {/* BOTÃO MOBILE */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-300 hover:text-[#c6a062]"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MENU MOBILE EXPANDIDO */}
      {isMenuOpen && (
        <div className="md:hidden fixed top-[86px] left-0 w-full bg-[#0d0e11] border-b border-amber-500/10 p-6 flex flex-col gap-4 text-center text-xs uppercase tracking-wider z-40">
          <a href="#home" onClick={() => setIsMenuOpen(false)}>Início</a>
          <a href="#instagram" onClick={() => setIsMenuOpen(false)}>Galeria</a>
          <a href="#agendamento" onClick={() => setIsMenuOpen(false)}>Meus Agendamento</a>
          <a href="#servicos" onClick={() => setIsMenuOpen(false)}>Serviços</a>
          <a href="#contato" onClick={() => setIsMenuOpen(false)}>Contato</a>
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              handleOpenAppointment();
            }}
            className="mt-2 w-full py-3 bg-[#c6a062] text-[#070708] font-bold uppercase rounded-sm"
          >
            Agendar Horário
          </button>
        </div>
      )}

      {/* HERO SECTION */}
      <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 md:pt-36">
        <div 
          className="absolute top-24 md:top-28 bottom-0 left-0 right-0 bg-cover bg-center bg-no-repeat opacity-40 z-0"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        
        <div className="absolute top-24 md:top-28 bottom-0 left-0 right-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#070708]/95 via-[#070708]/75 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-[#070708]/50" />
          <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-amber-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16 md:py-24">
          <div className="max-w-3xl space-y-8">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#c6a062]">
              Estilo • Tradição • Força
            </span>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] tracking-tight text-white">
              ONDE O SEU ESTILO <br />
              <span className="italic font-normal text-amber-500 font-serif">É FORJADO</span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 font-light tracking-wide max-w-xl leading-relaxed">
              Mais que uma barbearia, um estilo de vida. Agende seu horário ou confira nossos últimos trabalhos direto do nosso Instagram.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={handleOpenAppointment}
                className="px-8 py-3.5 rounded-sm bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs uppercase tracking-widest hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/30 text-center"
              >
                Agendar Horário
              </button>
              <a 
                href="#instagram"
                className="px-8 py-3.5 rounded-sm border border-amber-500/30 text-white hover:bg-amber-500/10 font-bold text-xs uppercase tracking-widest transition-all text-center"
              >
                Ver Galeria
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* GALERIA */}
      <section id="instagram" className="py-24 bg-[#09090b] border-t border-amber-500/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6a062] flex items-center justify-center gap-2">
              Portfólio no Instagram
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              FORJADOS NO INSTAGRAM
            </h2>
            <p className="text-xs md:text-sm text-slate-400 max-w-md mx-auto">
              Acompanhe nossos últimos trabalhos e inspire-se para o seu próximo corte
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {instagramPosts.map((post) => (
              <div 
                key={post.id} 
                className="group relative aspect-square overflow-hidden rounded-lg border border-amber-500/10 bg-zinc-950"
              >
                <img 
                  src={post.url} 
                  alt={post.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                  <span className="text-[10px] uppercase tracking-widest font-bold">Ver no Instagram</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENDAMENTOS */}
      <section id="agendamento" className="py-24 bg-[#070708] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6a062]">
                Garanta sua vaga
              </span>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-white">
                PRONTO PARA FORJAR SEU VISUAL?
              </h2>
              <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed">
                Nossos barbeiros estão prontos para te atender com o mais alto padrão. Escolha o melhor dia, horário e o profissional de sua preferência.
              </p>
            </div>

            <div className="relative rounded-2xl bg-[#121215] p-8 md:p-10 border border-amber-500/20 shadow-2xl backdrop-blur-md">
              <div className="space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif font-bold text-white">Agendamento Online</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Rápido, prático e sem filas. Escolha o serviço e agende agora mesmo.
                  </p>
                </div>
                
                <button
                  onClick={handleOpenAppointment}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-sm uppercase tracking-widest hover:from-amber-500 hover:to-amber-600 transition-all shadow-lg shadow-amber-900/40"
                >
                  Agendar Novo Horário
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer id="contato" className="border-t border-slate-900 bg-[#070708] text-center md:text-left">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <p className="text-xs text-slate-500">Corvelloni • A Forja © {new Date().getFullYear()}</p>
        </div>
      </footer>

      {/* COMPONENTE MODAL DE AGENDAMENTO */}
      <NewAppointment 
        isOpen={isAppointmentOpen} 
        onClose={handleCloseAppointment} 
        onSuccess={handleAppointmentSuccess} 
      />

    </div>
  );
}