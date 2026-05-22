import React from "react";
import Link from "next/link";
import { Shield, Scale, ScrollText, Calendar, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms and Conditions || Términos y Condiciones — La Yucateca",
  description: "Términos y condiciones de uso oficiales del canal de noticias, SaaS y ecosistema digital La Yucateca.",
};

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white p-6 md:p-12 relative overflow-hidden flex flex-col justify-between">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#ff5500]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] bg-[#ff5500]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-4xl mx-auto w-full z-10 relative py-8">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-all mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Inicio / Return Home
        </Link>

        {/* Header Glass Card */}
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#ff5500] uppercase mb-2">
              <Scale className="w-4 h-4" />
              MARCO LEGAL Y OPERATIVO
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Términos y Condiciones</h1>
            <p className="text-sm text-white/50 mt-1">Última actualización: 21 de Mayo, 2026</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 shrink-0 flex items-center gap-3">
            <ScrollText className="w-8 h-8 text-[#ff5500]" />
            <div className="text-left font-mono">
              <div className="text-[10px] text-white/40 uppercase">Versión</div>
              <div className="text-sm font-bold text-white">v3.4.2-MX</div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-8 text-white/80 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              1. Aceptación del Acuerdo
            </h2>
            <p>
              Bienvenido a <strong>La Yucateca</strong> (el "Portal", "Sitio", o "Ecosistema"). Al acceder, navegar o utilizar este sitio web, incluyendo todas sus páginas secundarias, SaaS corporativo y API automatizadas, usted acepta de manera absoluta cumplir y estar legalmente obligado por los presentes Términos y Condiciones de Uso. Si usted no está de acuerdo con cualquiera de estas cláusulas, deberá abstenerse de utilizar el ecosistema de inmediato.
            </p>
            <p className="text-xs text-white/40 italic">
              Welcome to La Yucateca. By accessing, browsing, or using this digital ecosystem, including all news rooms, SaaS solutions, and automated APIs, you fully agree to comply with and be bound by these Terms & Conditions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              2. Servicios del Ecosistema y Licencia de Uso
            </h2>
            <p>
              La Yucateca proporciona una plataforma integral que combina periodismo digital independiente, herramientas de reportes ciudadanos descentralizados, foros comunitarios en tiempo real interactuando con moderadores inteligentes, mercado electrónico local alimentado por lógica autónoma y soluciones B2B premium. Se le otorga una licencia limitada, no exclusiva, revocable e intransferible para acceder al contenido bajo el principio de buena fe.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              3. Reportes de Ciudadanos y Normas Comunitarias
            </h2>
            <p>
              Al utilizar el canal de <em>Citizen Report</em> para enviar reportes geo-referenciados de forma anónima o registrada, usted garantiza que toda la información provista es verídica, precisa y no infringe derechos de terceros. Nos reservamos el derecho absoluto de auditar, indexar y moderar las publicaciones en foros y reportes públicos a través de nuestros sistemas autónomos de Inteligencia Artificial para salvaguardar la veracidad e integridad comunitaria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              4. Transacciones Comerciales y Marketplace
            </h2>
            <p>
              El área comercial (<em>Marketplace</em>) sirve de canal digital interactivo para conectar vendedores regionales con compradores finales. La Yucateca no se hace responsable de disputas de entrega física, calidad de insumos gastronómicos o desacuerdos contractuales entre particulares, aunque provee la telemetría del enrutamiento de transacciones para garantizar la máxima transparencia posible en el flujo digital.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              5. Derechos de Autor y Propiedad Intelectual
            </h2>
            <p>
              Todos los logotipos, diseños visuales del estándar <em>obsidian-glass</em>, códigos del framework de Next.js, algoritmos de enrutamiento autónomo, metodologías del idioma auxiliar Muna y contenidos periodísticos originales de La Yucateca están protegidos por las leyes internacionales de propiedad intelectual y los registros correspondientes ante el Instituto Mexicano de la Propiedad Industrial (IMPI).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              6. Limitación de Responsabilidad
            </h2>
            <p>
              El ecosistema digital y sus servicios autónomos se proporcionan "tal cual" y "según disponibilidad". La Yucateca no asume ninguna responsabilidad derivada de interrupciones de telecomunicaciones ajenas, latencias de red, errores imprevistos en algoritmos de traducción Muna o fallos temporales en el almacenamiento seguro de tokens criptográficos en el cliente.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              7. Jurisdicción y Ley Aplicable
            </h2>
            <p>
              Cualquier controversia relacionada con los presentes términos se regirá e interpretará de acuerdo con las leyes federales de los Estados Unidos Mexicanos, sometiéndose formalmente a la jurisdicción exclusiva de los tribunales competentes ubicados en la ciudad de <strong>Mérida, Yucatán, México</strong>, renunciando expresamente a cualquier otro fuero que pudiere corresponderles por razón de sus domicilios presentes o futuros.
            </p>
          </section>
        </div>

        {/* Footer Card */}
        <div className="mt-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-mono">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#ff5500]" />
            Ecosistema Protegido por SSL de 256 bits y Cifrado Simétrico.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy-policy" className="text-[#ff5500] hover:underline font-semibold">
              Política de Privacidad
            </Link>
            <span>•</span>
            <span>La Yucateca S.A.S. de C.V.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
