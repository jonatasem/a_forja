import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { 
  Calendar, 
  X, 
  Menu, 
  Scissors, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  ChevronRight,
  ShieldCheck,
  Award,
  Users,
  LogOut
} from "lucide-react";
import logoImg from "../assets/logo.png";
import heroImg from "../assets/heroa.png";
import { NewAppointment } from "../components/NewAppointment";

export function ClientPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAppointmentOpen, setIsAppointmentOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Extrai utilizador e função de logout do hook de autenticação
  const { user, signOut } = useAuth();

  // Efeito para mudar o fundo da navbar ao rolar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleOpenAppointment = () => setIsAppointmentOpen(true);
  const handleCloseAppointment = () => setIsAppointmentOpen(false);
  const handleAppointmentSuccess = () => {
    console.log("Agendamento concluído com sucesso!");
  };

  const servicesList = [
    { name: "Corte Corvelloni", price: "R$ 60", duration: "45 min", desc: "Consultoria de estilo, lavagem especial e acabamento na navalha." },
    { name: "Barba Imperial", price: "R$ 45", duration: "35 min", desc: "Toalha quente, óleos essenciais, massagem facial e alinhamento." },
    { name: "Combo A Forja (Corte + Barba)", price: "R$ 95", duration: "1h 15min", desc: "A experiência completa de cuidado e relaxamento masculino." },
    { name: "Pigmentação / Camuflagem", price: "R$ 35", duration: "25 min", desc: "Disfarce natural para falhas na barba ou cabelo." },
  ];

  const instagramPosts = [
    { id: 1, url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=600", alt: "Degradê e barba", tag: "@corvelloni_forja" },
    { id: 2, url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600", alt: "Corte clássico", tag: "@corvelloni_forja" },
    { id: 3, url: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?q=80&w=600", alt: "Barba e toalha quente", tag: "@corvelloni_forja" },
    { id: 4, url: "https://images.unsplash.com/photo-1593702295094-aea22597af65?q=80&w=600", alt: "Corte moderno", tag: "@corvelloni_forja" },
    { id: 5, url: "https://images.unsplash.com/photo-1517832606589-7a598b3895c6?q=80&w=600", alt: "Fade cabelo e barba", tag: "@corvelloni_forja" },
    { id: 6, url: "https://images.unsplash.com/photo-1605497746444-ac9dbd324d48?q=80&w=600", alt: "Trabalho de tesoura", tag: "@corvelloni_forja" },
  ];

  const testimonials = [
    { name: "Ricardo Alves", role: "Cliente Fiel", comment: "O melhor atendimento da região. A experiência da toalha quente na barba é incomparável!", rating: 5 },
    { name: "Matheus Silva", role: "Cliente", comment: "Pontualidade e profissionalismo nota 10. O ambiente é muito agradável e o café é excelente.", rating: 5 },
    { name: "Lucas Mendes", role: "Cliente", comment: "Barbeiros realmente mestres no que fazem. Não troco a Corvelloni por nada.", rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-[#070708] text-white font-sans selection:bg-amber-500 selection:text-black">
      
      {/* HEADER / NAVBAR FIXA REFEITA */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#0c0c0e]/90 backdrop-blur-md border-b border-amber-500/20 py-3 shadow-2xl shadow-black/80" 
          : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
             
          {/* Logo Ajustada */}
          <a href="#home" className="flex items-center gap-3 group">
            <img 
              src={logoImg} 
              alt="Corvelloni A Forja" 
              className="h-20 md:h-24 w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </a>

          {/* NAVEGAÇÃO DESKTOP */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-zinc-300">
            <a href="#home" className="hover:text-amber-400 transition-colors">Início</a>
            <a href="#sobre" className="hover:text-amber-400 transition-colors">A Forja</a>
            <a href="#servicos" className="hover:text-amber-400 transition-colors">Serviços</a>
            <a href="#galeria" className="hover:text-amber-400 transition-colors">Galeria</a>
            <a href="#avaliacoes" className="hover:text-amber-400 transition-colors">Avaliações</a>
            <a href="#contato" className="hover:text-amber-400 transition-colors">Contato</a>
          </nav>

          {/* BOTÕES E PERFIL HEADER (DESKTOP) */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={handleOpenAppointment}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-amber-950/50 hover:shadow-amber-500/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Agendar Agora
            </button>

            {user ? (
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1.5 pr-3">
                <button
                  onClick={signOut}
                  title="Sair"
                  className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <a
                href="/login"
                className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors px-3 py-2"
              >
                Entrar
              </a>
            )}
          </div>

          {/* BOTÃO MOBILE */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MENU MOBILE EXPANDIDO */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[90px] bg-[#0d0e11]/95 backdrop-blur-xl border-b border-amber-500/20 p-6 flex flex-col gap-4 text-center text-xs uppercase tracking-wider z-40 shadow-2xl animate-in slide-in-from-top-2">
          <a href="#home" onClick={() => setIsMenuOpen(false)} className="py-2 text-zinc-300 hover:text-amber-400">Início</a>
          <a href="#sobre" onClick={() => setIsMenuOpen(false)} className="py-2 text-zinc-300 hover:text-amber-400">A Forja</a>
          <a href="#servicos" onClick={() => setIsMenuOpen(false)} className="py-2 text-zinc-300 hover:text-amber-400">Serviços</a>
          <a href="#galeria" onClick={() => setIsMenuOpen(false)} className="py-2 text-zinc-300 hover:text-amber-400">Galeria</a>
          <a href="#avaliacoes" onClick={() => setIsMenuOpen(false)} className="py-2 text-zinc-300 hover:text-amber-400">Avaliações</a>
          <a href="#contato" onClick={() => setIsMenuOpen(false)} className="py-2 text-zinc-300 hover:text-amber-400">Contato</a>
          
          <button 
            onClick={() => {
              setIsMenuOpen(false);
              handleOpenAppointment();
            }}
            className="mt-2 w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold uppercase rounded-xl shadow-lg shadow-amber-950/50"
          >
            Agendar Horário
          </button>

          {/* AÇÃO AUTH MOBILE */}
          {user ? (
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                signOut();
              }}
              className="w-full py-3 bg-zinc-900 border border-zinc-800 text-red-400 font-bold uppercase rounded-xl flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          ) : (
            <a 
              href="/login"
              onClick={() => setIsMenuOpen(false)}
              className="w-full py-3 bg-zinc-900 border border-amber-500/30 text-amber-400 font-bold uppercase rounded-xl block text-center"
            >
              Acessar Minha Conta
            </a>
          )}
        </div>
      )}

      {/* HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16">
        {/* Background Image com Máscara Gradiente */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 scale-105 transition-transform duration-10000 ease-out"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        
        {/* Overlays de Iluminação e Profundidade */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-[#070708]/80 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-transparent to-[#070708]/70 z-0" />
        <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-amber-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 h-96 w-96 rounded-full bg-amber-700/10 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-3xl space-y-8">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">
                Estilo • Tradição • Excelência
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-extrabold leading-[1.08] tracking-tight text-white">
              ONDE O SEU ESTILO <br />
              <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent italic font-normal">
                É FORJADO
              </span>
            </h1>

            {/* MENSAGEM DE BOAS-VINDAS DINÂMICA */}
            {user?.name && (
              <p className="text-amber-400 font-semibold text-sm tracking-wide">
                Bem vindo de volta, <span className=" decoration-amber-500/50 text-white/70">{user.name}</span>!
              </p>
            )}

            <p className="text-sm md:text-base text-zinc-300 font-light tracking-wide max-w-xl leading-relaxed">
              Mais que uma barbearia, um ambiente de convivência, alta precisão e respeito à sua identidade. Agende em poucos cliques.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={handleOpenAppointment}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-950/50 hover:shadow-amber-500/20 text-center flex items-center justify-center gap-2 group"
              >
                <span>Agendar Horário</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              
              <a 
                href="#servicos"
                className="px-8 py-4 rounded-xl border border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5 hover:bg-amber-500/10 text-white font-bold text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
              >
                Ver Serviços & Preços
              </a>
            </div>

            {/* Micro-destaques Rápido */}
            <div className="pt-8 border-t border-zinc-800/80 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <p className="text-xl font-bold text-amber-400">100%</p>
                <p className="text-[10px] uppercase text-zinc-500 tracking-wider">Satisfação</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-400">4.9 ★</p>
                <p className="text-[10px] uppercase text-zinc-500 tracking-wider">Avaliação Google</p>
              </div>
              <div>
                <p className="text-xl font-bold text-amber-400">+3k</p>
                <p className="text-[10px] uppercase text-zinc-500 tracking-wider">Atendimentos</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SOBRE NÓS / A FORJA */}
      <section id="sobre" className="py-24 bg-[#09090b] border-t border-zinc-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Cards de Apresentação visual */}
            <div className="relative">
              <div className="aspect-4/3 rounded-3xl overflow-hidden border border-amber-500/20 shadow-2xl relative bg-zinc-900">
                <img 
                  src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=800" 
                  alt="Ambiente da Barbearia" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#121215]/90 backdrop-blur-md border border-amber-500/20">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">O Conceito A Forja</p>
                  <p className="text-xs text-zinc-300 mt-1">Técnicas clássicas combinadas com a sofisticação moderna.</p>
                </div>
              </div>
            </div>

            {/* Texto de Apresentação */}
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500 flex items-center gap-2">
                <Scissors className="w-4 h-4" /> Nossa História
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white leading-tight">
                MISTURA DE TRADIÇÃO, CAFÉ E CULTURA MASCULINA
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Na <strong className="text-amber-400 font-semibold">Corvelloni • A Forja</strong>, entendemos que o corte de cabelo e o alinhamento da barba não são apenas estética — são um ritual de renovação e confiança.
              </p>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Nossos barbeiros passam por treinamento constante para entregar cortes precisos, degradês perfeitos e barboterapia relaxante com produtos de altíssima qualidade.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <Award className="w-6 h-6 text-amber-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase">Mestres Barbeiros</h4>
                  <p className="text-[11px] text-zinc-500 mt-1">Profissionais especialistas em visagismo.</p>
                </div>
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                  <Users className="w-6 h-6 text-amber-400 mb-2" />
                  <h4 className="text-xs font-bold text-white uppercase">Atendimento Premium</h4>
                  <p className="text-[11px] text-zinc-500 mt-1">Bebidas selecionadas e ambiente climatizado.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      {/* SERVIÇOS & PREÇOS */}
      <section id="servicos" className="py-24 bg-[#070708] relative border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500">
              Tabela de Serviços
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              NOSSOS SERVIÇOS EXCLUSIVOS
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 max-w-md mx-auto">
              Escolha o tratamento ideal para o seu visual com transparência e qualidade garantida
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {servicesList.map((service, index) => (
              <div 
                key={index} 
                className="p-6 rounded-2xl bg-[#121215] border border-zinc-800/80 hover:border-amber-500/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-serif font-bold text-white group-hover:text-amber-400 transition-colors">
                      {service.name}
                    </h3>
                    <span className="text-lg font-extrabold text-amber-400">{service.price}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                    {service.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/60 pt-4 mt-2">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-amber-500" /> {service.duration}
                  </span>
                  <button 
                    onClick={handleOpenAppointment}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 uppercase tracking-wider transition-colors"
                  >
                    Agendar <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALERIA INSTAGRAM */}
      <section id="galeria" className="py-24 bg-[#09090b] border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500 flex items-center justify-center gap-2">
              Icon do Instagram
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              FORJADOS NO INSTAGRAM
            </h2>
            <p className="text-xs md:text-sm text-zinc-400 max-w-md mx-auto">
              Inspire-se com alguns dos nossos trabalhos recentes
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {instagramPosts.map((post) => (
              <div 
                key={post.id} 
                className="group relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg"
              >
                <img 
                  src={post.url} 
                  alt={post.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-75"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white p-4 text-center">
                  Icon do Instagram
                  <span className="text-xs font-bold uppercase tracking-wider">{post.tag}</span>
                  <span className="text-[10px] text-zinc-300">{post.alt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AVALIAÇÕES */}
      <section id="avaliacoes" className="py-24 bg-[#070708] border-t border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-500">
              Opinião dos Clientes
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">
              QUEM EXPERIMENTOU, APROVA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-300 italic leading-relaxed">
                    "{t.comment}"
                  </p>
                </div>
                <div className="pt-4 border-t border-zinc-800/80 mt-4">
                  <p className="text-xs font-bold text-white">{t.name}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHAMADA FINAL DE AGENDAMENTO */}
      <section id="agendamento" className="py-20 bg-gradient-to-b from-[#09090b] to-[#070708] border-t border-zinc-900 relative">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl bg-gradient-to-r from-[#18181c] via-[#121215] to-[#18181c] p-8 md:p-12 border border-amber-500/30 shadow-2xl text-center space-y-6 relative overflow-hidden">
            
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Calendar className="w-8 h-8" />
            </div>

            <div className="max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-white">
                PRONTO PARA O SEU PRÓXIMO CORTE?
              </h2>
              <p className="text-xs md:text-sm text-zinc-400">
                Sem filas de espera. Escolha o horário conveniente no seu telemóvel ou computador.
              </p>
            </div>

            <button
              onClick={handleOpenAppointment}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold text-xs uppercase tracking-widest hover:from-amber-500 hover:to-amber-600 transition-all shadow-xl shadow-amber-950/50 hover:scale-105"
            >
              Agendar Horário Agora
            </button>
          </div>
        </div>
      </section>

      {/* RODAPÉ & INFORMAÇÕES DE CONTATO */}
      <footer id="contato" className="border-t border-zinc-900 bg-[#050506] text-zinc-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="space-y-4">
            <img src={logoImg} alt="Corvelloni A Forja" className="h-20 w-auto object-contain" />
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              O seu espaço exclusivo para cuidados masculinos. Tradição, estilo e o corte ideal para a sua presença.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Localização & Contato</h4>
            <p className="flex items-center gap-2 text-zinc-400">
              <MapPin className="w-4 h-4 text-amber-500" /> Rua Principal, 1000 - Centro
            </p>
            <p className="flex items-center gap-2 text-zinc-400">
              <Phone className="w-4 h-4 text-amber-500" /> (00) 99999-9999
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Horário de Funcionamento</h4>
            <p className="text-zinc-400">Segunda a Sexta: 09h00 às 20h00</p>
            <p className="text-zinc-400">Sábado: 08h00 às 18h00</p>
            <p className="text-zinc-500">Domingo: Fechado</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 pt-8 mt-8 border-t border-zinc-900/80 text-center text-[11px] text-zinc-600">
          Corvelloni • A Forja © {new Date().getFullYear()} — Todos os direitos reservados.
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