import React, { useState, useEffect } from 'react';
import { useWedding } from '../../context/WeddingContext';
import { 
  Users, 
  LayoutGrid, 
  MapPin, 
  Briefcase, 
  Clock, 
  Crown, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight, 
  QrCode, 
  Heart, 
  ArrowRight,
  ChevronDown,
  Lock,
  Compass,
  Check
} from 'lucide-react';

export const NoviasLandingPage: React.FC = () => {
  const { setShowAuthModal } = useWedding();
  const [activeTab, setActiveTab] = useState<'invitados' | 'mesas' | 'planos' | 'proveedores' | 'cronograma' | 'invitacion'>('invitados');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    document.title = 'Casanovia | Organiza tu boda como gestionas tu empresa';
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenAuth = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-[#EBEBEB] text-[#2D3748] antialiased selection:bg-[#D4D4D4] selection:text-[#1A202C] font-['Poppins',sans-serif]">
      
      {/* 1. TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#EBEBEB]/90 backdrop-blur-md border-b border-[#DCDCDC] shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo (Untouched) */}
          <div className="flex items-center gap-3">
            <a 
              href="/novias" 
              className="flex items-center gap-2 group transition-transform active:scale-95"
              aria-label="Casanovia Inicio"
            >
              <div className="w-11 h-11 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]">
                <img src="/n.svg" alt="N" className="w-6 h-6 object-contain" />
              </div>
              <img src="/casanovia.svg" alt="Casanovia" className="h-7 w-auto object-contain" />
            </a>
          </div>

          {/* Nav Links Desktop - Poppins */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-['Poppins',sans-serif] font-light">
            <button 
              onClick={() => scrollToSection('problema')}
              className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-widest transition-colors cursor-pointer"
            >
              El Problema
            </button>
            <button 
              onClick={() => scrollToSection('solucion')}
              className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Módulos
            </button>
            <button 
              onClick={() => scrollToSection('colaboracion')}
              className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Novia + Novio
            </button>
            <button 
              onClick={() => scrollToSection('demo')}
              className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Cómo Funciona
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-xs text-gray-600 hover:text-gray-900 uppercase tracking-widest transition-colors cursor-pointer"
            >
              Preguntas
            </button>
          </nav>

          {/* CTA Header Actions */}
          <div className="flex items-center gap-3 font-['Poppins',sans-serif] font-medium">
            <button
              onClick={handleOpenAuth}
              className="px-4 py-2.5 rounded-2xl bg-[#EBEBEB] text-black text-xs uppercase tracking-wider shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center gap-2 cursor-pointer font-medium"
            >
              <Lock className="w-3.5 h-3.5 text-black" />
              <span className="text-black">Acceso</span>
            </button>
            <button
              onClick={() => scrollToSection('solucion')}
              className="hidden sm:flex px-5 py-2.5 rounded-2xl bg-[#EBEBEB] text-black text-xs uppercase tracking-wider shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all items-center gap-2 cursor-pointer font-medium"
            >
              <span className="text-black">Descubrir</span>
              <ChevronRight className="w-3.5 h-3.5 text-black" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Copy */}
          <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16">
            
            {/* Tagline Pill - Poppins */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] mb-6 font-['Poppins',sans-serif] font-light">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] text-gray-700 uppercase tracking-widest">
                Gestión Centralizada &middot; Bodas de Alto Nivel
              </span>
            </div>

            {/* Main Punchy Heading - FORUM */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-normal text-[#1A202C] tracking-wide leading-[1.12] mb-6 font-['Forum',serif] uppercase">
              ORGANIZA TU BODA COMO GESTIONAS TU EMPRESA.
            </h1>

            {/* Subheading / Explanatory text - Poppins */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 font-light leading-relaxed mb-8 max-w-3xl mx-auto font-['Poppins',sans-serif]">
              Invitados, confirmaciones, mesas, proveedores, pagos, planos y cronograma. <strong className="text-gray-900 font-medium">Todo conectado en un solo lugar.</strong>
            </p>

            {/* Hero CTAs - Poppins */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 font-['Poppins',sans-serif] font-medium">
              <button
                onClick={() => scrollToSection('solucion')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#EBEBEB] text-black text-xs sm:text-sm uppercase tracking-wider shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center gap-3 cursor-pointer font-medium"
              >
                <span className="text-black">DESCUBRIR CASANOVIA</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
              
              <button
                onClick={() => scrollToSection('demo')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#EBEBEB] text-black text-xs sm:text-sm uppercase tracking-wider shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center gap-3 cursor-pointer font-medium"
              >
                <span className="text-black">VER CÓMO FUNCIONA</span>
                <Compass className="w-4 h-4 text-black" />
              </button>
            </div>

          </div>

          {/* High-End Hero UI Showcase Component */}
          <div className="max-w-5xl mx-auto">
            <div className="p-4 sm:p-7 rounded-[2.5rem] bg-[#EBEBEB] shadow-[15px_15px_30px_#c8c8c8,-15px_-15px_30px_#ffffff]">
              
              {/* Browser/Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-300/80 px-2 font-['Poppins',sans-serif] font-light">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E57373] shadow-xs"></span>
                  <span className="w-3 h-3 rounded-full bg-[#FFB74D] shadow-xs"></span>
                  <span className="w-3 h-3 rounded-full bg-[#81C784] shadow-xs"></span>
                  <span className="text-[11px] text-gray-500 uppercase tracking-wider ml-2">
                    Casanovia &middot; Panel de Control &middot; Boda Sofía & Mateo
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)] font-normal">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sincronizado en tiempo real</span>
                </div>
              </div>

              {/* Dashboard Hero Grid Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Metric Card 1: Invitados & RSVP */}
                <div className="p-5 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 font-['Poppins',sans-serif] font-light">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Invitados & RSVP</span>
                    <div className="w-8 h-8 rounded-full bg-[#EBEBEB] flex items-center justify-center shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]">
                      <Users className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-normal text-gray-900 font-['Forum',serif]">184</span>
                      <span className="text-xs font-light text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-['Poppins',sans-serif]">89% confirmados</span>
                    </div>
                    <div className="w-full bg-gray-300 h-2 rounded-full mt-3 overflow-hidden shadow-[inset_1px_1px_2px_#bbb]">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: '89%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2 font-['Poppins',sans-serif] font-light">
                      <span>164 Asisten</span>
                      <span>12 Pendientes</span>
                      <span>8 No Asisten</span>
                    </div>
                  </div>
                </div>

                {/* Metric Card 2: Mesas & Asignación */}
                <div className="p-5 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 font-['Poppins',sans-serif] font-light">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Distribución de Mesas</span>
                    <div className="w-8 h-8 rounded-full bg-[#EBEBEB] flex items-center justify-center shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]">
                      <LayoutGrid className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-normal text-gray-900 font-['Forum',serif]">18</span>
                      <span className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Mesas en Salón</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="flex-1 text-center p-1.5 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]">
                        <p className="text-[9px] text-gray-500 font-light uppercase font-['Poppins',sans-serif]">Ubicados</p>
                        <p className="text-xs font-normal text-gray-900 font-['Forum',serif]">164 / 164</p>
                      </div>
                      <div className="flex-1 text-center p-1.5 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]">
                        <p className="text-[9px] text-gray-500 font-light uppercase font-['Poppins',sans-serif]">Sin Mesa</p>
                        <p className="text-xs font-normal text-emerald-600 font-['Forum',serif]">0</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metric Card 3: Finanzas & Cronograma */}
                <div className="p-5 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3 font-['Poppins',sans-serif] font-light">
                    <span className="text-[11px] text-gray-500 uppercase tracking-wider">Proveedores & Control</span>
                    <div className="w-8 h-8 rounded-full bg-[#EBEBEB] flex items-center justify-center shadow-[3px_3px_6px_#d1d1d1,-3px_-3px_6px_#ffffff]">
                      <Briefcase className="w-4 h-4 text-gray-700" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-normal text-gray-900 font-['Forum',serif]">12 / 12</span>
                      <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-['Poppins',sans-serif] font-light">Contratos al día</span>
                    </div>
                    <div className="mt-2.5 p-2 rounded-xl bg-[#EBEBEB] shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] flex items-center justify-between text-xs">
                      <span className="text-gray-600 font-['Poppins',sans-serif] font-light text-[11px]">Cronograma evento</span>
                      <span className="font-medium text-gray-900 font-['Poppins',sans-serif] text-xs">34 Hitos Definidos</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. SECCIÓN 2 — EL PROBLEMA */}
      <section id="problema" className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-['Poppins',sans-serif] font-light text-rose-600 uppercase tracking-widest block mb-3">
              La Realidad De Planificar Sin Un Sistema
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight leading-tight font-['Forum',serif] uppercase">
              ¿TU BODA ESTÁ REPARTIDA ENTRE WHATSAPP, EXCEL Y DOCUMENTOS?
            </h2>
          </div>

          {/* 6 Chaos Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-14">
            
            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shrink-0 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-lg font-normal text-rose-500 font-['Forum',serif]">1</span>
              </div>
              <div>
                <h3 className="text-base font-normal text-gray-900 mb-1 font-['Forum',serif]">Invitados en una hoja de cálculo</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-['Poppins',sans-serif] font-light">Versiones duplicadas, nombres sin confirmar y cambios de última hora que se pierden.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shrink-0 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-lg font-normal text-rose-500 font-['Forum',serif]">2</span>
              </div>
              <div>
                <h3 className="text-base font-normal text-gray-900 mb-1 font-['Forum',serif]">Confirmaciones en WhatsApp</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-['Poppins',sans-serif] font-light">Audios, mensajes leídos sin anotar y respuestas sueltas en chats personales.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shrink-0 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-lg font-normal text-rose-500 font-['Forum',serif]">3</span>
              </div>
              <div>
                <h3 className="text-base font-normal text-gray-900 mb-1 font-['Forum',serif]">Proveedores en diferentes conversaciones</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-['Poppins',sans-serif] font-light">Presupuestos en correos, cotizaciones en PDF y acuerdos hablados sin respaldo claro.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shrink-0 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-lg font-normal text-rose-500 font-['Forum',serif]">4</span>
              </div>
              <div>
                <h3 className="text-base font-normal text-gray-900 mb-1 font-['Forum',serif]">Pagos en documentos separados</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-['Poppins',sans-serif] font-light">Adelantos y saldos pendientes difíciles de cuadrar antes del evento.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shrink-0 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-lg font-normal text-rose-500 font-['Forum',serif]">5</span>
              </div>
              <div>
                <h3 className="text-base font-normal text-gray-900 mb-1 font-['Forum',serif]">Mesas que cambian una y otra vez</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-['Poppins',sans-serif] font-light">Distribuir asientos manualmente sin ver el plano del salón genera confusión constante.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shrink-0 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <span className="text-lg font-normal text-rose-500 font-['Forum',serif]">6</span>
              </div>
              <div>
                <h3 className="text-base font-normal text-gray-900 mb-1 font-['Forum',serif]">El cronograma en otro archivo</h3>
                <p className="text-sm text-gray-600 leading-relaxed font-['Poppins',sans-serif] font-light">Minuto a minuto desfasado que nadie tiene sincronizado el día de la boda.</p>
              </div>
            </div>

          </div>

          {/* Highlight Key Takeaway Box */}
          <div className="max-w-3xl mx-auto text-center p-8 sm:p-10 rounded-[2.5rem] bg-[#EBEBEB] shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff]">
            <p className="text-xs font-['Poppins',sans-serif] font-light text-gray-500 uppercase tracking-widest mb-3">La Conclusión Inevitable</p>
            <h3 className="text-2xl sm:text-4xl font-normal text-gray-900 tracking-tight font-['Forum',serif]">
              Tu boda no necesita más herramientas. <span className="text-gray-900 underline decoration-amber-500 decoration-4">Necesita un sistema.</span>
            </h3>
          </div>

        </div>
      </section>

      {/* 4. SECCIÓN 3 — LA SOLUCIÓN */}
      <section id="solucion" className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-['Poppins',sans-serif] font-light text-gray-500 uppercase tracking-widest block mb-3">
              Arquitectura Digital Todo En Uno
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight mb-5 font-['Forum',serif] uppercase">
              UNA BODA. UN SOLO LUGAR.
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 font-light leading-relaxed font-['Poppins',sans-serif]">
              Casanovia reúne la gestión de tu evento para que puedas organizarlo, coordinarlo y tomar decisiones desde un solo lugar.
            </p>
          </div>

          {/* 6 Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* 1. INVITADOS */}
            <div className="p-8 rounded-[2.5rem] bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[14px_14px_28px_#c8c8c8,-14px_-14px_28px_#ffffff] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] mb-6 group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7 text-gray-800" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 uppercase tracking-wider mb-2 font-['Forum',serif]">
                INVITADOS
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed mb-4 font-['Poppins',sans-serif]">
                Gestiona invitados y sus confirmaciones en tiempo real. Control de pases familiares, dietas especiales y mensajes de felicitación.
              </p>
              <div className="flex items-center gap-2 text-xs font-light text-gray-600 font-['Poppins',sans-serif]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Confirmación RSVP Digital &middot; Sin papel</span>
              </div>
            </div>

            {/* 2. MESAS */}
            <div className="p-8 rounded-[2.5rem] bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[14px_14px_28px_#c8c8c8,-14px_-14px_28px_#ffffff] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] mb-6 group-hover:scale-105 transition-transform">
                <LayoutGrid className="w-7 h-7 text-gray-800" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 uppercase tracking-wider mb-2 font-['Forum',serif]">
                MESAS
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed mb-4 font-['Poppins',sans-serif]">
                Asigna personas y organiza la distribución de las mesas. Visualiza la capacidad exacta, equilibrio de grupos y afinidad entre invitados.
              </p>
              <div className="flex items-center gap-2 text-xs font-light text-gray-600 font-['Poppins',sans-serif]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Asignación inteligente sin solapamientos</span>
              </div>
            </div>

            {/* 3. PLANOS */}
            <div className="p-8 rounded-[2.5rem] bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[14px_14px_28px_#c8c8c8,-14px_-14px_28px_#ffffff] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] mb-6 group-hover:scale-105 transition-transform">
                <MapPin className="w-7 h-7 text-gray-800" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 uppercase tracking-wider mb-2 font-['Forum',serif]">
                PLANOS
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed mb-4 font-['Poppins',sans-serif]">
                Visualiza y organiza la ubicación de mesas y espacios. Plano 2D interactivo del salón, pista de baile, escenario y zonas de bar.
              </p>
              <div className="flex items-center gap-2 text-xs font-light text-gray-600 font-['Poppins',sans-serif]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Croquis interactivo y exportable</span>
              </div>
            </div>

            {/* 4. PROVEEDORES */}
            <div className="p-8 rounded-[2.5rem] bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[14px_14px_28px_#c8c8c8,-14px_-14px_28px_#ffffff] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] mb-6 group-hover:scale-105 transition-transform">
                <Briefcase className="w-7 h-7 text-gray-800" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 uppercase tracking-wider mb-2 font-['Forum',serif]">
                PROVEEDORES
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed mb-4 font-['Poppins',sans-serif]">
                Centraliza proveedores, servicios y pagos. Registra presupuestos acordados, abonos realizados y saldos pendientes por liquidar.
              </p>
              <div className="flex items-center gap-2 text-xs font-light text-gray-600 font-['Poppins',sans-serif]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Control financiero transparente</span>
              </div>
            </div>

            {/* 5. CRONOGRAMA */}
            <div className="p-8 rounded-[2.5rem] bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[14px_14px_28px_#c8c8c8,-14px_-14px_28px_#ffffff] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] mb-6 group-hover:scale-105 transition-transform">
                <Clock className="w-7 h-7 text-gray-800" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 uppercase tracking-wider mb-2 font-['Forum',serif]">
                CRONOGRAMA
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed mb-4 font-['Poppins',sans-serif]">
                Planifica rápidamente las actividades de tu boda. Minuto a minuto sincronizado con responsables asignados para cada momento clave.
              </p>
              <div className="flex items-center gap-2 text-xs font-light text-gray-600 font-['Poppins',sans-serif]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Itinerario minuto a minuto en vivo</span>
              </div>
            </div>

            {/* 6. PROTOCOLO */}
            <div className="p-8 rounded-[2.5rem] bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff] hover:shadow-[14px_14px_28px_#c8c8c8,-14px_-14px_28px_#ffffff] transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-[#EBEBEB] flex items-center justify-center shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] mb-6 group-hover:scale-105 transition-transform">
                <Crown className="w-7 h-7 text-gray-800" />
              </div>
              <h3 className="text-xl font-normal text-gray-900 uppercase tracking-wider mb-2 font-['Forum',serif]">
                PROTOCOLO
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed mb-4 font-['Poppins',sans-serif]">
                Organiza los momentos importantes del evento: cortejo nupcial, orden de discursos, sesión de fotos y protocolo de ingreso formal.
              </p>
              <div className="flex items-center gap-2 text-xs font-light text-gray-600 font-['Poppins',sans-serif]">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Roles y cortejo perfectamente coordinados</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SECCIÓN 4 — EL CONCEPTO "NOVIA + NOVIO" */}
      <section id="colaboracion" className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            
            {/* Left Narrative Column */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBEBEB] shadow-[inset_2px_2px_4px_#d1d1d1,inset_-2px_-2px_4px_#ffffff] mb-5 font-['Poppins',sans-serif] font-light">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[11px] text-gray-600 uppercase tracking-wider">
                  Colaboración En Tiempo Real
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight leading-tight mb-6 font-['Forum',serif] uppercase">
                UNA BODA SE ORGANIZA ENTRE DOS.
              </h2>

              <div className="space-y-3 mb-8">
                <p className="text-2xl sm:text-3xl font-normal text-gray-900 font-['Forum',serif]">
                  Novia + Novio.
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm font-light text-gray-800 font-['Poppins',sans-serif]">
                  <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]">
                    &bull; Dos personas.
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff]">
                    &bull; Una sola información.
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] text-sm font-light text-gray-800 font-['Poppins',sans-serif]">
                  &bull; Una misma visión para el gran día.
                </div>
              </div>

              <p className="text-base sm:text-lg text-gray-700 font-light leading-relaxed mb-6 font-['Poppins',sans-serif]">
                Casanovia permite compartir el proceso de planificación y gestión entre ambos de forma simultánea. No más dudas sobre quién habló con el fotógrafo o si un familiar ya confirmó su asistencia.
              </p>

              <div className="p-5 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
                <p className="text-xl sm:text-2xl font-normal text-gray-900 font-['Forum',serif]">
                  Organicen juntos, aunque estén en lugares diferentes.
                </p>
              </div>
            </div>

            {/* Right Multi-Device Synchronized Graphic */}
            <div className="relative">
              <div className="p-6 sm:p-8 rounded-[2.5rem] bg-[#EBEBEB] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] space-y-6">
                
                {/* Device 1: Laptop Screen (Novia) */}
                <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                  <div className="flex items-center justify-between mb-3 font-['Poppins',sans-serif] font-light">
                    <div className="flex items-center gap-2">
                      <Laptop className="w-4 h-4 text-gray-700" />
                      <span className="text-xs text-gray-900 font-normal">Novia (Oficina / Laptop)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">En línea</span>
                  </div>
                  <div className="text-xs text-gray-700 bg-[#EBEBEB] p-2.5 rounded-xl shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] flex items-center justify-between font-['Poppins',sans-serif] font-light">
                    <span>Mesa 4: Asignados Familia Pérez (4 pases)</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

                {/* Live Sync Pulse Connector */}
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest font-['Poppins',sans-serif] font-light">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <div className="flex items-center gap-1 bg-[#EBEBEB] px-3 py-1 rounded-full shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Sincronización instantánea</span>
                  </div>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>

                {/* Device 2: Mobile Screen (Novio) */}
                <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                  <div className="flex items-center justify-between mb-3 font-['Poppins',sans-serif] font-light">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-gray-700" />
                      <span className="text-xs text-gray-900 font-normal">Novio (Móvil / En viaje)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Actualizado</span>
                  </div>
                  <div className="text-xs text-gray-700 bg-[#EBEBEB] p-2.5 rounded-xl shadow-[2px_2px_4px_#d1d1d1,-2px_-2px_4px_#ffffff] flex items-center justify-between font-['Poppins',sans-serif] font-light">
                    <span>Proveedor DJ: Abono del 50% registrado</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 6. SECCIÓN 5 — CONTROL */}
      <section id="control" className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-14">
              <span className="text-[11px] font-['Poppins',sans-serif] font-light text-gray-500 uppercase tracking-widest block mb-3">
                Decisiones Claras &middot; Autonomía Total
              </span>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight mb-5 font-['Forum',serif] uppercase">
                TÚ SIGUES TENIENDO EL CONTROL.
              </h2>
              <p className="text-lg sm:text-xl text-gray-700 font-light font-['Poppins',sans-serif]">
                Tú contratas proveedores. Tomas decisiones. Apruebas presupuestos. Organizas invitados. Pero todo queda respaldado de forma ordenada.
              </p>
            </div>

            {/* Decision Checklist Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 font-['Forum',serif]">
              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-800 shrink-0" />
                <span className="text-base font-normal text-gray-800">Contratas proveedores con claridad</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-800 shrink-0" />
                <span className="text-base font-normal text-gray-800">Tomas decisiones en equipo</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-800 shrink-0" />
                <span className="text-base font-normal text-gray-800">Apruebas presupuestos exactos</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-800 shrink-0" />
                <span className="text-base font-normal text-gray-800">Organizas y confirmas invitados</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-800 shrink-0" />
                <span className="text-base font-normal text-gray-800">Distribuyes las mesas en plano</span>
              </div>

              <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-gray-800 shrink-0" />
                <span className="text-base font-normal text-gray-800">Planificas el cronograma exacto</span>
              </div>
            </div>

            {/* Wedding Planner Ally Box */}
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#EBEBEB] shadow-[10px_10px_20px_#d1d1d1,-10px_-10px_20px_#ffffff]">
              <div className="flex flex-col sm:row items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-[#EBEBEB] flex items-center justify-center shrink-0 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
                  <ShieldCheck className="w-8 h-8 text-gray-800" />
                </div>
                <div>
                  <h3 className="text-2xl font-normal text-gray-900 mb-2 font-['Forum',serif]">
                    Tú decides cuánto quieres delegar.
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 font-light leading-relaxed font-['Poppins',sans-serif]">
                    Casanovia te ayuda a mantener el control total de la información incluso cuando trabajas con Wedding Planners, productoras y proveedores. Ambos mundos se potencian con datos claros y centralizados.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. SECCIÓN 6 — DEMOSTRACIÓN VISUAL ("MIRA CÓMO FUNCIONA") */}
      <section id="demo" className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[11px] font-['Poppins',sans-serif] font-light text-gray-500 uppercase tracking-widest block mb-3">
              Experiencia De Usuario Premium
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight mb-4 font-['Forum',serif] uppercase">
              MIRA CÓMO FUNCIONA
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 font-light font-['Poppins',sans-serif]">
              Explora los módulos clave de la plataforma diseñados para resolver cada detalle con precisión.
            </p>
          </div>

          {/* Interactive Showcase Tabs */}
          <div className="max-w-5xl mx-auto">
            
            {/* Tab Selector Buttons - Poppins */}
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar font-['Poppins',sans-serif]">
              <button
                onClick={() => setActiveTab('invitados')}
                className={`px-4 py-3 rounded-2xl text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer text-black ${
                  activeTab === 'invitados'
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] font-semibold border border-gray-400/40'
                    : 'bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] font-normal'
                }`}
              >
                <span className="text-black">1. Invitados & RSVP</span>
              </button>

              <button
                onClick={() => setActiveTab('mesas')}
                className={`px-4 py-3 rounded-2xl text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer text-black ${
                  activeTab === 'mesas'
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] font-semibold border border-gray-400/40'
                    : 'bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] font-normal'
                }`}
              >
                <span className="text-black">2. Mesas & Asientos</span>
              </button>

              <button
                onClick={() => setActiveTab('planos')}
                className={`px-4 py-3 rounded-2xl text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer text-black ${
                  activeTab === 'planos'
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] font-semibold border border-gray-400/40'
                    : 'bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] font-normal'
                }`}
              >
                <span className="text-black">3. Plano 2D</span>
              </button>

              <button
                onClick={() => setActiveTab('proveedores')}
                className={`px-4 py-3 rounded-2xl text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer text-black ${
                  activeTab === 'proveedores'
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] font-semibold border border-gray-400/40'
                    : 'bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] font-normal'
                }`}
              >
                <span className="text-black">4. Proveedores & Pagos</span>
              </button>

              <button
                onClick={() => setActiveTab('cronograma')}
                className={`px-4 py-3 rounded-2xl text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer text-black ${
                  activeTab === 'cronograma'
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] font-semibold border border-gray-400/40'
                    : 'bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] font-normal'
                }`}
              >
                <span className="text-black">5. Cronograma</span>
              </button>

              <button
                onClick={() => setActiveTab('invitacion')}
                className={`px-4 py-3 rounded-2xl text-xs uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer text-black ${
                  activeTab === 'invitacion'
                    ? 'bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] font-semibold border border-gray-400/40'
                    : 'bg-[#EBEBEB] shadow-[5px_5px_10px_#d1d1d1,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#c8c8c8,-7px_-7px_14px_#ffffff] font-normal'
                }`}
              >
                <span className="text-black">6. Web & Pase QR</span>
              </button>
            </div>

            {/* Tab Visual Content Window */}
            <div className="p-6 sm:p-10 rounded-[2.5rem] bg-[#EBEBEB] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff]">
              
              {/* TAB 1: INVITADOS */}
              {activeTab === 'invitados' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-300 pb-4">
                    <div>
                      <h3 className="text-2xl font-normal text-gray-900 font-['Forum',serif]">Directorio de Invitados & RSVP Digital</h3>
                      <p className="text-sm text-gray-700 font-light font-['Poppins',sans-serif]">Control de asistencia, pases asignados y confirmaciones en directo.</p>
                    </div>
                    <div className="flex gap-2 font-['Poppins',sans-serif] font-light">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-xl shadow-xs">
                        164 Confirmados
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-normal text-xs font-['Forum',serif]">
                          CP
                        </div>
                        <div>
                          <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Familia Carlos Paredes</p>
                          <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Mesa 2 &middot; 3 pases confirmados &middot; Dieta celíaca</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-['Poppins',sans-serif] font-light">
                        CONFIRMADO
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center font-normal text-xs font-['Forum',serif]">
                          LR
                        </div>
                        <div>
                          <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Dra. Lucía Ramos & Acompañante</p>
                          <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Mesa 5 &middot; 2 pases confirmados</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-['Poppins',sans-serif] font-light">
                        CONFIRMADO
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center font-normal text-xs font-['Forum',serif]">
                          MA
                        </div>
                        <div>
                          <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Ing. Martín Alarcón</p>
                          <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Mesa 7 &middot; 2 pases &middot; Enlace WhatsApp enviado</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full font-['Poppins',sans-serif] font-light">
                        PENDIENTE
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MESAS */}
              {activeTab === 'mesas' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-300 pb-4">
                    <h3 className="text-2xl font-normal text-gray-900 font-['Forum',serif]">Asignación y Balance de Mesas</h3>
                    <p className="text-sm text-gray-700 font-light font-['Poppins',sans-serif]">Visualiza la capacidad y agrupa familias y amigos sin sobrepasar los cupos.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-normal text-gray-900 font-['Forum',serif]">Mesa 01 (Presidencial)</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-['Poppins',sans-serif] font-light">8 / 8</span>
                      </div>
                      <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Novios, Padres de la Novia, Padres del Novio</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-normal text-gray-900 font-['Forum',serif]">Mesa 02 (Familia Materna)</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-['Poppins',sans-serif] font-light">10 / 10</span>
                      </div>
                      <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Tíos, Primos Directos y Abuela Carmen</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-normal text-gray-900 font-['Forum',serif]">Mesa 03 (Amigos Universidad)</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-['Poppins',sans-serif] font-light">10 / 10</span>
                      </div>
                      <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Compañeros de Facultad & Parejas</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-normal text-gray-900 font-['Forum',serif]">Mesa 04 (Colegas de Empresa)</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-['Poppins',sans-serif] font-light">8 / 10</span>
                      </div>
                      <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Equipo Ejecutivo y Socios</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: PLANOS */}
              {activeTab === 'planos' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-300 pb-4">
                    <h3 className="text-2xl font-normal text-gray-900 font-['Forum',serif]">Croquis 2D del Salón & Espacios</h3>
                    <p className="text-sm text-gray-700 font-light font-['Poppins',sans-serif]">Diseño espacial con ubicación de mesas, pista de baile, escenario y barras.</p>
                  </div>

                  {/* High-Fidelity 2D Canvas Viewport */}
                  <div className="p-3 sm:p-4 rounded-3xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
                    <div className="relative w-full bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden select-none">
                      <svg
                        viewBox="0 0 1000 620"
                        className="w-full h-auto block"
                        style={{ minHeight: '320px' }}
                      >
                        {/* Background Subtle Grid / Canvas */}
                        <rect width="1000" height="620" fill="#FFFFFF" />

                        {/* Top Left: Acceso Invitados & Recepción */}
                        <g transform="translate(195, 20)">
                          <rect
                            width="145"
                            height="24"
                            rx="5"
                            fill="#FDF8E2"
                            stroke="#E6CE8A"
                            strokeWidth="1.2"
                          />
                          <text
                            x="72"
                            y="16"
                            textAnchor="middle"
                            fill="#8A641B"
                            fontSize="9"
                            fontWeight="600"
                            fontFamily="Poppins, sans-serif"
                          >
                            🚪 Acceso Invitados & Recepción ➔
                          </text>
                        </g>

                        {/* Left Side: Barra Libre & Cócteles */}
                        <g transform="translate(205, 215)">
                          <rect
                            width="34"
                            height="185"
                            rx="10"
                            fill="#FCE8EF"
                            stroke="#F5B8D0"
                            strokeWidth="1.2"
                          />
                          <text
                            x="-92"
                            y="21"
                            textAnchor="middle"
                            fill="#8E3E63"
                            fontSize="9"
                            fontWeight="600"
                            fontFamily="Poppins, sans-serif"
                            transform="rotate(-90)"
                          >
                            🍸 Barra Libre & Cócteles
                          </text>
                        </g>

                        {/* Left Side Lower: Cabina DJ / Live Audio */}
                        <g transform="translate(210, 480)">
                          <rect
                            width="32"
                            height="105"
                            rx="8"
                            fill="#F6EFE6"
                            stroke="#DECDB0"
                            strokeWidth="1.2"
                          />
                          <text
                            x="-52"
                            y="20"
                            textAnchor="middle"
                            fill="#7C5E43"
                            fontSize="8"
                            fontWeight="600"
                            fontFamily="Poppins, sans-serif"
                            transform="rotate(-90)"
                          >
                            🎧 Cabina DJ / Live Audio
                          </text>
                        </g>

                        {/* Center: Pista de Baile Principal */}
                        <g transform="translate(325, 245)">
                          <rect
                            width="350"
                            height="190"
                            rx="14"
                            fill="#EFE4CE"
                            stroke="#E0D2B8"
                            strokeWidth="1.5"
                          />
                          <text
                            x="175"
                            y="100"
                            textAnchor="middle"
                            fill="#635238"
                            fontSize="11.5"
                            fontWeight="600"
                            fontFamily="Poppins, sans-serif"
                          >
                            ✨ Pista de Baile Principal
                          </text>
                        </g>

                        {/* Right Upper: Mesa de Torta */}
                        <g transform="translate(745, 230)">
                          <circle
                            cx="0"
                            cy="0"
                            r="16"
                            fill="#DCF8E8"
                            stroke="#A3E7BF"
                            strokeWidth="1.2"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fill="#1B633D"
                            fontSize="7"
                            fontWeight="600"
                            fontFamily="Poppins, sans-serif"
                          >
                            🎂 Torta
                          </text>
                        </g>

                        {/* Right Side: Mesa de Honor (Presidencial) */}
                        <g transform="translate(730, 280)">
                          <rect
                            width="34"
                            height="95"
                            rx="10"
                            fill="#DDD5F3"
                            stroke="#BEB1E6"
                            strokeWidth="1.2"
                          />
                          <text
                            x="-47"
                            y="18"
                            textAnchor="middle"
                            fill="#4E3B7D"
                            fontSize="8.5"
                            fontWeight="600"
                            fontFamily="Poppins, sans-serif"
                            transform="rotate(-90)"
                          >
                            Mesa de Honor
                          </text>
                          <text
                            x="-47"
                            y="27"
                            textAnchor="middle"
                            fill="#6B599C"
                            fontSize="6.5"
                            fontFamily="Poppins, sans-serif"
                            transform="rotate(-90)"
                          >
                            2/2 pers.
                          </text>
                          {/* 2 Seats for Mesa de Honor */}
                          <circle cx="44" cy="30" r="6" fill="#334155" />
                          <text x="44" y="32" textAnchor="middle" fill="#FFFFFF" fontSize="4.5" fontWeight="bold">HD</text>
                          <circle cx="44" cy="65" r="6" fill="#334155" />
                          <text x="44" y="67" textAnchor="middle" fill="#FFFFFF" fontSize="4.5" fontWeight="bold">RJ</text>
                        </g>

                        {/* --- TOP ROW TABLES (Upper Arc) --- */}
                        {/* Function to render a round table with 10 seats */}
                        {[
                          // Outer Top
                          { cx: 325, cy: 110, name: 'Mesa 17', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['CC', 'KH', 'JR', 'YL', 'VN', 'DP', 'RL', 'EL', 'DM', 'NL'] },
                          { cx: 430, cy: 110, name: 'Mesa 4', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['MR', 'SL', 'GC', 'CC', 'LM', 'FC', 'JL', 'JP', 'HH', 'JR'] },
                          { cx: 535, cy: 110, name: 'Mesa 6', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['AA', 'CI', 'EI', 'FB', 'BS', 'NA', 'OS', 'EI', 'AD', 'VH'] },
                          { cx: 640, cy: 110, name: 'Mesa 3', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['BM', 'JQ', 'AR', 'EL', 'AP', 'CR', 'EQ', 'CF', 'SF', 'VV'] },
                          // Inner Top
                          { cx: 375, cy: 175, name: 'Mesa 14', cap: '10/10 pers.', fill: '#D8F3E5', stroke: '#A1E3BE', textFill: '#1E6B42', seats: ['YM', 'MI', 'HC', 'TL', 'OA', 'AS', 'JJ', 'LK', 'JL', 'FC'] },
                          { cx: 480, cy: 175, name: 'Mesa 2', cap: '10/10 pers.', fill: '#D8F3E5', stroke: '#A1E3BE', textFill: '#1E6B42', seats: ['VC', 'ER', 'JZ', 'PL', 'CM', 'NL', 'WL', 'JA', 'LA', 'AC'] },
                          { cx: 585, cy: 175, name: 'Mesa 10', cap: '10/10 pers.', fill: '#E6E0F8', stroke: '#C4B5FD', textFill: '#5B419C', seats: ['CC', 'VN', 'DP', 'BL', 'EL', 'DM', 'BS', 'NA', 'OS', 'EI'] },
                          { cx: 685, cy: 175, name: 'Mesa 11', cap: '10/10 pers.', fill: '#E6E0F8', stroke: '#C4B5FD', textFill: '#5B419C', seats: ['SV', 'MJ', 'WJ', 'AR', 'JF', 'BQ', 'CR', 'EQ', 'CF', 'SF'] },
                          
                          // --- BOTTOM ROW TABLES (Lower Arc) ---
                          // Inner Bottom
                          { cx: 310, cy: 470, name: 'Mesa 18', cap: '10/10 pers.', fill: '#DDF0FC', stroke: '#93C5FD', textFill: '#1E5E96', seats: ['AM', 'QJ', 'JB', 'HD', 'DJ', 'NA', 'SA', 'IC', 'JF', 'TM'] },
                          { cx: 410, cy: 470, name: 'Mesa 8', cap: '10/10 pers.', fill: '#DDF0FC', stroke: '#93C5FD', textFill: '#1E5E96', seats: ['GF', 'LP', 'LT', 'HC', 'BR', 'SC', 'AR', 'SF', 'NF', 'LM'] },
                          { cx: 505, cy: 470, name: 'Mesa 9', cap: '10/10 pers.', fill: '#F3ECE2', stroke: '#D6C7B2', textFill: '#6E5235', seats: ['NB', 'JC', 'AV', 'WJ', 'ML', 'BM', 'DG', 'RM', 'EC', 'AN'] },
                          { cx: 600, cy: 470, name: 'Mesa 13', cap: '9/10 pers.', fill: '#E6E0F8', stroke: '#C4B5FD', textFill: '#5B419C', seats: ['JY', '10', 'MA', 'PA', 'JL', 'FA', 'KL', 'BR', 'AH', 'MI'] },
                          { cx: 690, cy: 470, name: 'Mesa 12', cap: '10/10 pers.', fill: '#E6E0F8', stroke: '#C4B5FD', textFill: '#5B419C', seats: ['JC', 'VL', 'CQ', 'AY', 'JE', 'SQ', 'FC', 'MC', 'CL', 'RL'] },
                          
                          // Outer Bottom
                          { cx: 360, cy: 540, name: 'Mesa 7', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['JA', 'CA', 'LC', 'SS', 'FM', 'EA', 'PA', 'WY', 'EZ', 'KL'] },
                          { cx: 455, cy: 540, name: 'Mesa 5', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['AO', 'BA', 'LA', 'MP', 'MI', 'MA', 'CQ', 'HS', 'DG', 'RM'] },
                          { cx: 550, cy: 540, name: 'Mesa 16', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['LR', 'MC', 'FC', 'FM', 'MS', 'CT', 'JL', 'FA', 'KL', 'BR'] },
                          { cx: 645, cy: 540, name: 'Mesa 15', cap: '10/10 pers.', fill: '#FCE4E8', stroke: '#F7ADC0', textFill: '#9F224E', seats: ['BR', 'AH', 'MI', 'PM', 'ST', 'QR', 'JV', 'AB', 'DM', 'EL'] }
                        ].map((table, tIdx) => {
                          const r = 24;
                          const seatDistance = 33;
                          return (
                            <g key={tIdx}>
                              {/* 10 Circular Chairs Around Table */}
                              {table.seats.map((seat, sIdx) => {
                                const angle = ((sIdx * 360) / table.seats.length - 90) * (Math.PI / 180);
                                const sx = table.cx + seatDistance * Math.cos(angle);
                                const sy = table.cy + seatDistance * Math.sin(angle);
                                return (
                                  <g key={sIdx}>
                                    <circle
                                      cx={sx}
                                      cy={sy}
                                      r="5.5"
                                      fill="#334155"
                                      stroke="#1E293B"
                                      strokeWidth="0.5"
                                    />
                                    <text
                                      x={sx}
                                      y={sy + 1.8}
                                      textAnchor="middle"
                                      fill="#FFFFFF"
                                      fontSize="4"
                                      fontWeight="bold"
                                      fontFamily="Poppins, sans-serif"
                                    >
                                      {seat}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Center Table Circle */}
                              <circle
                                cx={table.cx}
                                cy={table.cy}
                                r={r}
                                fill={table.fill}
                                stroke={table.stroke}
                                strokeWidth="1.2"
                              />

                              {/* Table Name */}
                              <text
                                x={table.cx}
                                y={table.cy - 1.5}
                                textAnchor="middle"
                                fill={table.textFill}
                                fontSize="7.5"
                                fontWeight="600"
                                fontFamily="Poppins, sans-serif"
                              >
                                {table.name}
                              </text>

                              {/* Capacity Subtext */}
                              <text
                                x={table.cx}
                                y={table.cy + 7}
                                textAnchor="middle"
                                fill={table.textFill}
                                fontSize="5"
                                opacity="0.85"
                                fontFamily="Poppins, sans-serif"
                              >
                                {table.cap}
                              </text>
                            </g>
                          );
                        })}

                        {/* Bottom Floating Toolbar Pill */}
                        <g transform="translate(435, 582)">
                          <rect
                            width="130"
                            height="24"
                            rx="12"
                            fill="#F1F3F5"
                            stroke="#D1D5DB"
                            strokeWidth="1"
                          />
                          <text
                            x="65"
                            y="15.5"
                            textAnchor="middle"
                            fill="#4B5563"
                            fontSize="8"
                            fontWeight="500"
                            fontFamily="Poppins, sans-serif"
                          >
                            🔍 &nbsp; 61% &nbsp; 🔍 &nbsp; ⤢ &nbsp; ↺ &nbsp; 0° &nbsp; 📎
                          </text>
                        </g>

                      </svg>
                    </div>

                    <p className="text-xs text-gray-600 mt-3.5 text-center font-['Poppins',sans-serif] font-light">
                      Visualización interactiva de distribución real del salón: Pista central, mesas perimetrales numeradas con sillas asignadas, bar y cabina técnica.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 4: PROVEEDORES */}
              {activeTab === 'proveedores' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-300 pb-4">
                    <h3 className="text-2xl font-normal text-gray-900 font-['Forum',serif]">Directorio de Proveedores & Balance Financiero</h3>
                    <p className="text-sm text-gray-700 font-light font-['Poppins',sans-serif]">Presupuestos, contratos, abonos realizados y saldos pendientes.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
                      <div>
                        <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Catering & Banquete de Gala</p>
                        <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Presupuesto: S/ 32,000 &middot; Abonos: S/ 20,000</p>
                      </div>
                      <span className="text-base font-normal text-amber-800 font-['Forum',serif]">Saldo: S/ 12,000</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
                      <div>
                        <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Fotografía & Video Cinematográfico</p>
                        <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Presupuesto: S/ 8,500 &middot; Abonos: S/ 8,500</p>
                      </div>
                      <span className="text-xs text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-['Poppins',sans-serif] font-light">100% PAGADO</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff] flex items-center justify-between">
                      <div>
                        <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Iluminación Arquitectónica & DJ Set</p>
                        <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Presupuesto: S/ 6,200 &middot; Abonos: S/ 3,100</p>
                      </div>
                      <span className="text-base font-normal text-amber-800 font-['Forum',serif]">Saldo: S/ 3,100</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CRONOGRAMA */}
              {activeTab === 'cronograma' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-300 pb-4">
                    <h3 className="text-2xl font-normal text-gray-900 font-['Forum',serif]">Cronograma Minuto a Minuto</h3>
                    <p className="text-sm text-gray-700 font-light font-['Poppins',sans-serif]">Secuencia exacta de momentos con responsables asignados.</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      <span className="text-base font-normal text-gray-900 w-20 font-['Forum',serif]">04:30 PM</span>
                      <div className="flex-1">
                        <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Ceremonia Religiosa / Ingreso</p>
                        <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Responsable: Cortejo Nupcial & Fotografía</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      <span className="text-base font-normal text-gray-900 w-20 font-['Forum',serif]">06:00 PM</span>
                      <div className="flex-1">
                        <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Cóctel de Bienvenida & Recepción de Invitados</p>
                        <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Responsable: Barman & Saxofonista en Vivo</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#EBEBEB] shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                      <span className="text-base font-normal text-gray-900 w-20 font-['Forum',serif]">07:30 PM</span>
                      <div className="flex-1">
                        <p className="text-base font-normal text-gray-900 font-['Forum',serif]">Ingreso Triunfal de los Novios & Primer Vals</p>
                        <p className="text-xs text-gray-600 font-['Poppins',sans-serif] font-light">Responsable: DJ, Efectos de Pirotecnia Fría & Maestro de Ceremonias</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: INVITACIÓN & QR */}
              {activeTab === 'invitacion' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="border-b border-gray-300 pb-4">
                    <h3 className="text-2xl font-normal text-gray-900 font-['Forum',serif]">Web de Invitación & Pase Digital con QR</h3>
                    <p className="text-sm text-gray-700 font-light font-['Poppins',sans-serif]">Diseño interactivo con cuenta regresiva, confirmación con un clic y pase personalizado.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl bg-[#EBEBEB] shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
                    <div className="w-28 h-28 rounded-2xl bg-white p-2.5 shadow-[4px_4px_8px_#d1d1d1,-4px_-4px_8px_#ffffff] flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-gray-900" />
                    </div>
                    <div className="space-y-2 text-center sm:text-left">
                      <span className="text-[10px] text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full uppercase tracking-wider font-['Poppins',sans-serif] font-light">
                        Pase Personalizado
                      </span>
                      <h4 className="text-xl font-normal text-gray-900 font-['Forum',serif]">Sofía & Mateo &middot; Pase de Acceso Exclusivo</h4>
                      <p className="text-sm text-gray-700 font-light leading-relaxed font-['Poppins',sans-serif]">
                        Cada invitado recibe un enlace único por WhatsApp que muestra su pase, mesa asignada, mapa interactivo y botón de confirmación inmediata.
                      </p>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* 8. SECCIÓN 7 — TRANSFORMACIÓN (DE ESTO... A ESTO) */}
      <section className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[11px] font-['Poppins',sans-serif] font-light text-gray-500 uppercase tracking-widest block mb-3">
              Evolución Del Proceso
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight font-['Forum',serif] uppercase">
              DE ESTO... A ESTO.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
            
            {/* DE ESTO (Caos) */}
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#EBEBEB] shadow-[inset_6px_6px_12px_#d1d1d1,inset_-6px_-6px_12px_#ffffff] flex flex-col justify-between">
              <div>
                <span className="text-xs font-['Poppins',sans-serif] font-light text-rose-600 uppercase tracking-widest block mb-4">
                  ANTES &middot; EL MÉTODO TRADICIONAL
                </span>
                <h3 className="text-2xl font-normal text-gray-800 mb-6 font-['Forum',serif]">
                  Dispersión y Desgaste
                </h3>
                <ul className="space-y-3.5 text-sm text-gray-700 font-['Poppins',sans-serif] font-light">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Mensajes sueltos de WhatsApp sin clasificar</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Hojas de Excel desactualizadas y con errores</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Notas de voz, capturas de pantalla y PDFs sueltos</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Dudas de último minuto sobre pagos y proveedores</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-300/60 text-xs font-['Poppins',sans-serif] font-light text-gray-600">
                Resultado: Estrés, tiempo perdido y riesgo de olvidos.
              </div>
            </div>

            {/* A ESTO (Casanovia) */}
            <div className="p-8 sm:p-10 rounded-[2.5rem] bg-[#EBEBEB] shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] flex flex-col justify-between border border-white/60">
              <div>
                <span className="text-xs font-['Poppins',sans-serif] font-light text-emerald-600 uppercase tracking-widest block mb-4">
                  AHORA &middot; CON CASANOVIA
                </span>
                <h3 className="text-2xl font-normal text-gray-900 mb-6 font-['Forum',serif]">
                  Claridad, Control y Elegancia
                </h3>
                <ul className="space-y-3.5 text-sm text-gray-900 font-['Poppins',sans-serif] font-light">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Un solo centro de mando sincronizado en la nube</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Confirmaciones de invitados automáticas con RSVP digital</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mesas y planos 2D visibles al instante</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Novia y novio con acceso desde cualquier celular o PC</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-gray-300 text-xs font-['Poppins',sans-serif] font-light text-emerald-800">
                Resultado: Paz mental, control total y disfrute del proceso.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 9. SECCIÓN 8 — TIEMPO */}
      <section className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center">
            
            <div className="w-16 h-16 rounded-3xl bg-[#EBEBEB] flex items-center justify-center mx-auto mb-8 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
              <Clock className="w-8 h-8 text-gray-800" />
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight leading-tight mb-6 font-['Forum',serif] uppercase">
              MENOS TIEMPO ORGANIZANDO. MÁS TIEMPO DISFRUTANDO.
            </h2>

            <p className="text-lg sm:text-xl text-gray-700 font-light leading-relaxed mb-10 font-['Poppins',sans-serif]">
              Una boda implica cientos de decisiones. Casanovia te ayuda a mantener toda la información organizada para que el proceso sea más claro y manejable.
            </p>

            <button
              onClick={handleOpenAuth}
              className="px-8 py-4 rounded-2xl bg-[#EBEBEB] text-black text-xs uppercase tracking-wider shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all cursor-pointer font-['Poppins',sans-serif] font-medium"
            >
              <span className="text-black">Comenzar Ahora con Casanovia</span>
            </button>

          </div>

        </div>
      </section>

      {/* 10. SECCIÓN 9 — EXPERIENCIA REAL */}
      <section className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-4xl mx-auto text-center mb-14">
            <span className="text-[11px] font-['Poppins',sans-serif] font-light text-gray-500 uppercase tracking-widest block mb-3">
              Confiabilidad Probada
            </span>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight mb-5 font-['Forum',serif] uppercase">
              CASANOVIA YA ESTÁ EN EL MUNDO REAL.
            </h2>
            <p className="text-lg sm:text-xl text-gray-700 font-light leading-relaxed font-['Poppins',sans-serif]">
              Una herramienta creada para gestionar eventos reales, no solamente para mostrar una bonita interfaz.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            
            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] flex items-center justify-center mx-auto mb-4 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <ShieldCheck className="w-6 h-6 text-gray-800" />
              </div>
              <h3 className="text-base font-normal text-gray-900 uppercase tracking-wider mb-1 font-['Forum',serif]">
                Seguridad de Datos
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed font-['Poppins',sans-serif]">
                Información privada y encriptada disponible únicamente para la pareja.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] flex items-center justify-center mx-auto mb-4 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <Smartphone className="w-6 h-6 text-gray-800" />
              </div>
              <h3 className="text-base font-normal text-gray-900 uppercase tracking-wider mb-1 font-['Forum',serif]">
                Multiplataforma
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed font-['Poppins',sans-serif]">
                Acceso desde cualquier smartphone, tablet o laptop sin necesidad de instalar apps pesadas.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#EBEBEB] shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#EBEBEB] flex items-center justify-center mx-auto mb-4 shadow-[inset_3px_3px_6px_#d1d1d1,inset_-3px_-3px_6px_#ffffff]">
                <Sparkles className="w-6 h-6 text-gray-800" />
              </div>
              <h3 className="text-base font-normal text-gray-900 uppercase tracking-wider mb-1 font-['Forum',serif]">
                Protocolo Real
              </h3>
              <p className="text-sm text-gray-700 font-light leading-relaxed font-['Poppins',sans-serif]">
                Estructurado según las exigencias reales de recepciones y fiestas de alto nivel.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 11. FAQ SECTION */}
      <section id="faq" className="py-20 md:py-28 bg-[#EBEBEB] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-14">
            <span className="text-[11px] font-['Poppins',sans-serif] font-light text-gray-500 uppercase tracking-widest block mb-3">
              Dudas Resueltas
            </span>
            <h2 className="text-3xl sm:text-5xl font-normal text-gray-900 tracking-tight font-['Forum',serif] uppercase">
              PREGUNTAS FRECUENTES
            </h2>
          </div>

          <div className="space-y-4">
            
            {/* FAQ Item 1 */}
            <div className="rounded-3xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === 0 ? null : 0)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-lg sm:text-xl font-normal text-gray-900 font-['Forum',serif]">
                  ¿Puedo usar Casanovia si ya contraté una Wedding Planner?
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${openFaq === 0 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 0 && (
                <div className="px-6 pb-6 text-sm sm:text-base text-gray-700 leading-relaxed border-t border-gray-200/60 pt-4 font-['Poppins',sans-serif] font-light">
                  Totalmente. Casanovia no compite con tu Wedding Planner, sino que actúa como el centro de control común donde tú y tu pareja pueden consultar el avance de invitados, el croquis del salón y el cronograma sin depender de cadenas infinitas de emails o llamadas.
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="rounded-3xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === 1 ? null : 1)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-lg sm:text-xl font-normal text-gray-900 font-['Forum',serif]">
                  ¿Cómo confirman asistencia los invitados?
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${openFaq === 1 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 1 && (
                <div className="px-6 pb-6 text-sm sm:text-base text-gray-700 leading-relaxed border-t border-gray-200/60 pt-4 font-['Poppins',sans-serif] font-light">
                  A través de su enlace web personalizado enviado por WhatsApp. El invitado ingresa, confirma los pases familiares asignados, registra alergias alimentarias si las tiene y sus respuestas se actualizan automáticamente en el sistema en tiempo real.
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="rounded-3xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === 2 ? null : 2)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-lg sm:text-xl font-normal text-gray-900 font-['Forum',serif]">
                  ¿Podemos ingresar tanto la novia como el novio a la vez?
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${openFaq === 2 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 2 && (
                <div className="px-6 pb-6 text-sm sm:text-base text-gray-700 leading-relaxed border-t border-gray-200/60 pt-4 font-['Poppins',sans-serif] font-light">
                  Sí. La arquitectura está diseñada para que ambos puedan trabajar simultáneamente desde computadoras, tablets o smartphones diferentes manteniendo toda la información sincronizada al instante.
                </div>
              )}
            </div>

            {/* FAQ Item 4 */}
            <div className="rounded-3xl bg-[#EBEBEB] shadow-[6px_6px_12px_#d1d1d1,-6px_-6px_12px_#ffffff] overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === 3 ? null : 3)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <span className="text-lg sm:text-xl font-normal text-gray-900 font-['Forum',serif]">
                  ¿Es necesario descargar o instalar alguna aplicación?
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${openFaq === 3 ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === 3 && (
                <div className="px-6 pb-6 text-sm sm:text-base text-gray-700 leading-relaxed border-t border-gray-200/60 pt-4 font-['Poppins',sans-serif] font-light">
                  No. Casanovia funciona 100% en la nube a través de la web. Puedes acceder desde cualquier navegador moderno con total rapidez y sin ocupar espacio en tu dispositivo.
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 12. SECCIÓN 10 — CTA PRINCIPAL */}
      <section className="py-20 md:py-32 bg-[#EBEBEB] relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="p-10 sm:p-16 rounded-[3rem] bg-[#EBEBEB] shadow-[15px_15px_30px_#c8c8c8,-15px_-15px_30px_#ffffff] text-center">
            
            <div className="w-16 h-16 rounded-full bg-[#EBEBEB] flex items-center justify-center mx-auto mb-6 shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff]">
              <img src="/n.svg" alt="N" className="w-8 h-8 object-contain" />
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-normal text-gray-900 tracking-tight leading-tight mb-4 font-['Forum',serif] uppercase">
              TU BODA MERECE UN SISTEMA A LA ALTURA.
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-widest mb-10 font-['Poppins',sans-serif] font-light">
              Organiza &middot; Coordina &middot; Comparte &middot; Controla
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto font-['Poppins',sans-serif] font-medium">
              <button
                onClick={handleOpenAuth}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#EBEBEB] text-black text-xs uppercase tracking-wider shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <span className="text-black">Acceder a Casanovia</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
              
              <button
                onClick={() => scrollToSection('solucion')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#EBEBEB] text-black text-xs uppercase tracking-wider shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] hover:shadow-[10px_10px_20px_#c8c8c8,-10px_-10px_20px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d1d1,inset_-4px_-4px_8px_#ffffff] transition-all flex items-center justify-center gap-2 cursor-pointer font-medium"
              >
                <span className="text-black">Explorar Módulos</span>
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 13. FOOTER */}
      <footer className="py-12 bg-[#EBEBEB] border-t border-gray-300/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3">
            <img src="/n.svg" alt="Casanovia" className="w-6 h-6 object-contain" />
            <img src="/casanovia.svg" alt="Casanovia" className="h-5 w-auto object-contain" />
            <span className="text-xs text-gray-500 ml-2 font-['Poppins',sans-serif] font-light">&copy; {new Date().getFullYear()} Casanovia. Todos los derechos reservados.</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-600 uppercase tracking-widest font-['Poppins',sans-serif] font-light">
            <button onClick={() => scrollToSection('problema')} className="hover:text-gray-900 transition-colors cursor-pointer">
              Problema
            </button>
            <button onClick={() => scrollToSection('solucion')} className="hover:text-gray-900 transition-colors cursor-pointer">
              Solución
            </button>
            <button onClick={() => scrollToSection('colaboracion')} className="hover:text-gray-900 transition-colors cursor-pointer">
              Novia + Novio
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-gray-900 transition-colors cursor-pointer">
              FAQ
            </button>
            <button onClick={handleOpenAuth} className="hover:text-gray-900 transition-colors cursor-pointer">
              Acceso
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
};
