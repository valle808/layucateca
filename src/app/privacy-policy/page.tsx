import React from "react";
import Link from "next/link";
import { Shield, Eye, Lock, FileKey, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy || Política de Privacidad — La Yucateca",
  description: "Política de Privacidad oficial detallando el procesamiento transparente de datos y la telemetría del ecosistema La Yucateca.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#050508] text-white p-6 md:p-12 relative overflow-hidden flex flex-col justify-between">
      {/* Background Orbs */}
      <div className="absolute top-[-25%] left-[-10%] w-[500px] h-[500px] bg-[#ff5500]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#ff5500]/5 rounded-full blur-[100px] pointer-events-none" />

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
              <Shield className="w-4 h-4" />
              CONFIDENCIALIDAD & TRANSPARENCIA
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Política de Privacidad</h1>
            <p className="text-sm text-white/50 mt-1">Última actualización: 21 de Mayo, 2026</p>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/5 shrink-0 flex items-center gap-3">
            <Lock className="w-8 h-8 text-[#ff5500]" />
            <div className="text-left font-mono">
              <div className="text-[10px] text-white/40 uppercase">Estatus</div>
              <div className="text-sm font-bold text-emerald-400">ACTIVO / SECURE</div>
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="p-8 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-8 text-white/80 text-sm leading-relaxed">
          
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              1. Identidad del Responsable del Tratamiento
            </h2>
            <p>
              En cumplimiento con la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong> de los Estados Unidos Mexicanos, se hace constar que <strong>La Yucateca S.A.S. de C.V.</strong>, con domicilio convencional en la Ciudad de Mérida, Yucatán, es el único y legítimo responsable del tratamiento, resguardo, confidencialidad y salvaguarda de sus Datos Personales recopilados a través de las interacciones en el ecosistema digital.
            </p>
            <p className="text-xs text-white/40 italic">
              In accordance with Mexican Federal Law (LFPDPPP), La Yucateca S.A.S. de C.V., located in Merida, Yucatan, is the registered data controller for all personal information processed inside this ecosystem.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              2. Datos Recopilados y Telemetría Interna
            </h2>
            <p>
              Para garantizar el correcto funcionamiento del portal, la personalización inteligente de noticias locales, el enrutamiento logístico del mercado comercial y la seguridad de la red contra ciberataques, recopilamos los siguientes datos de forma pasiva y activa:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/70">
              <li>
                <strong>Datos de Registro:</strong> Nombre de usuario, correo electrónico, avatar opcional e historial de credenciales cifradas para la autenticación biométrica y OAuth.
              </li>
              <li>
                <strong>Geo-Posicionamiento:</strong> En el módulo de <em>Citizen Report</em>, se procesan coordenadas geográficas (latitud y longitud) con el consentimiento explícito del usuario para clasificar las alertas comunitarias de manera geográfica.
              </li>
              <li>
                <strong>Telemetría de Red y Sistemas:</strong> Registramos de forma silenciosa metadatos de las interacciones, incluyendo la dirección IP encriptada, el agente del navegador, las transacciones M2M, los errores lógicos del servidor y las mutaciones de datos en nuestra base central para auditar la salud general del ecosistema.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              3. Finalidad del Procesamiento de Datos
            </h2>
            <p>
              El tratamiento de sus datos se efectúa bajo los principios de licitud, consentimiento, información y lealtad. Sus datos personales no serán compartidos, transferidos, vendidos o arrendados bajo ningún concepto a terceros con fines publicitarios invasivos o marketing no solicitado. El fin exclusivo de la recopilación es el mantenimiento operativo, la optimización UX y el soporte a la moderación inteligente contra fraudes y desinformación.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              4. Transferencias de Datos Limitadas
            </h2>
            <p>
              Para garantizar que los servicios SaaS de <em>Soluciones Digitales</em> y la pasarela del <em>Marketplace</em> funcionen sin contratiempos, nos apoyamos exclusivamente en infraestructura de nube segura provista por **Supabase (PostgreSQL)** y **Firebase (Google Cloud)** ubicadas en servidores con redundancia extrema. Estas transferencias técnicas están estrictamente limitadas a las API técnicas requeridas para procesar las solicitudes solicitadas directamente por el usuario.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              5. Medidas de Seguridad y Cifrado
            </h2>
            <p>
              Implementamos protocolos de seguridad técnica, administrativa y física del más alto nivel para prevenir cualquier pérdida de datos, acceso no autorizado, alteración o filtración accidental. Todos los tráficos HTTP son forzados a través de conexiones SSL seguras de 256 bits, las contraseñas se almacenan empleando hash criptográfico de un solo sentido y las bases de datos de telemetría están protegidas detrás de firewalls restrictivos.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              6. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p>
              Como titular legítimo de sus datos personales, usted ostenta el derecho inalienable de **Acceder** a sus registros, solicitar su **Rectificación** si se encuentran desactualizados, exigir su **Cancelación** de nuestras bases de datos automatizadas u **Oponerse** al procesamiento de ciertos datos específicos. Para ejercer cualquiera de sus derechos ARCO, bastará con enviar una solicitud formal por escrito al correo de soporte técnico o abrir un reporte de incidencia interna.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ff5500] rounded" />
              7. Cambios en esta Política de Privacidad
            </h2>
            <p>
              Nos reservamos la facultad de modificar, adicionar o actualizar esta Política de Privacidad en cualquier momento de manera unilateral para reflejar reformas legales o adecuaciones de nuestra infraestructura de Inteligencia Artificial. Cualquier cambio sustancial será notificado oportunamente a través de un aviso destacado en nuestro panel principal de noticias.
            </p>
          </section>
        </div>

        {/* Footer Card */}
        <div className="mt-8 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50 font-mono">
          <div className="flex items-center gap-2">
            <FileKey className="w-4 h-4 text-[#ff5500]" />
            Certificado SSL válido. Tratamiento estricto bajo Ley Federal de Datos LFPDPPP.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms-and-conditions" className="text-[#ff5500] hover:underline font-semibold">
              Términos y Condiciones
            </Link>
            <span>•</span>
            <span>La Yucateca S.A.S. de C.V.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
