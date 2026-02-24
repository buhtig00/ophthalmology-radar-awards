import React from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0f1320] p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("Home")}>
          <Button variant="ghost" className="mb-6 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-[#C9A227]" />
            <h1 className="text-3xl font-bold text-white">Política de Privacidad</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Información que Recopilamos</h2>
              <p className="mb-3">
                En Ophthalmology Radar Awards recopilamos la siguiente información:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Datos de registro:</strong> Nombre completo, email, país, hospital/institución, especialidad médica</li>
                <li><strong>Casos clínicos:</strong> Videos, imágenes, documentos PDF, descripciones de casos quirúrgicos</li>
                <li><strong>Datos de votación:</strong> Votos emitidos, dirección IP (para prevención de fraude)</li>
                <li><strong>Datos de pago:</strong> Procesados de forma segura a través de Stripe (no almacenamos datos de tarjetas)</li>
                <li><strong>Cookies y analíticas:</strong> Información de navegación para mejorar la experiencia del usuario</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Uso de la Información</h2>
              <p className="mb-3">
                Utilizamos tu información para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gestionar tu participación en los premios</li>
                <li>Procesar y evaluar casos clínicos enviados</li>
                <li>Facilitar el sistema de votación pública</li>
                <li>Enviar notificaciones sobre el estado de tus casos</li>
                <li>Procesar pagos de tickets para la gala</li>
                <li>Generar estadísticas y analíticas del evento</li>
                <li>Comunicaciones relacionadas con el evento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Compartir Información</h2>
              <p className="mb-3">
                No vendemos tu información personal. Podemos compartirla con:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Jurado:</strong> Los casos aprobados son visibles para el panel de jurados</li>
                <li><strong>Público:</strong> Los casos finalistas son visibles públicamente para votación</li>
                <li><strong>Proveedores de servicios:</strong> Stripe para procesamiento de pagos, servicios de hosting</li>
                <li><strong>Cumplimiento legal:</strong> Cuando sea requerido por ley</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Seguridad de Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o alteración. Los datos se almacenan en servidores seguros y las transmisiones están cifradas mediante SSL/TLS.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Tus Derechos</h2>
              <p className="mb-3">
                De acuerdo con el RGPD, tienes derecho a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acceder a tus datos personales</li>
                <li>Rectificar datos incorrectos</li>
                <li>Solicitar la eliminación de tus datos</li>
                <li>Limitar el procesamiento de tus datos</li>
                <li>Portabilidad de datos</li>
                <li>Oponerte al procesamiento</li>
                <li>Retirar el consentimiento en cualquier momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Retención de Datos</h2>
              <p>
                Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos o según lo requiera la ley. Los casos clínicos enviados se conservan para archivo histórico del evento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Cookies</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento del sitio y cookies analíticas para mejorar la experiencia del usuario. Puedes configurar tu navegador para rechazar cookies, aunque esto puede limitar algunas funcionalidades.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Contacto</h2>
              <p>
                Para ejercer tus derechos o resolver dudas sobre privacidad, contáctanos en:{" "}
                <a href="mailto:privacy@ophthalmologyradar.com" className="text-[#C9A227] hover:underline">
                  privacy@ophthalmologyradar.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Cambios en esta Política</h2>
              <p>
                Nos reservamos el derecho de actualizar esta política de privacidad. Los cambios significativos serán notificados por email o mediante aviso destacado en el sitio web.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}