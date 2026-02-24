import React from "react";
import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TermsOfService() {
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
            <FileText className="w-8 h-8 text-[#C9A227]" />
            <h1 className="text-3xl font-bold text-white">Términos de Servicio</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Aceptación de Términos</h2>
              <p>
                Al acceder y utilizar la plataforma Ophthalmology Radar Awards, aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguno de estos términos, no utilices la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Descripción del Servicio</h2>
              <p className="mb-3">
                Ophthalmology Radar Awards es una plataforma para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Envío y gestión de casos clínicos quirúrgicos en oftalmología</li>
                <li>Evaluación de casos por parte de un jurado especializado</li>
                <li>Votación pública de casos finalistas</li>
                <li>Venta de tickets para la gala de premios presencial y streaming</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Registro y Cuenta de Usuario</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Debes proporcionar información precisa y actualizada al registrarte</li>
                <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
                <li>Debes notificar inmediatamente cualquier uso no autorizado de tu cuenta</li>
                <li>No puedes transferir tu cuenta a terceros</li>
                <li>Debes ser mayor de 18 años o contar con autorización parental</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Envío de Casos Clínicos</h2>
              <p className="mb-3">
                Al enviar un caso clínico, declaras y garantizas que:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Eres el autor original del contenido o tienes los derechos necesarios</li>
                <li>Has obtenido el consentimiento informado del paciente (anonimizado)</li>
                <li>El contenido cumple con todas las leyes aplicables (HIPAA, GDPR, etc.)</li>
                <li>El contenido no infringe derechos de terceros</li>
                <li>Aceptas que el caso pueda ser publicado públicamente si es seleccionado como finalista</li>
                <li>Conservas los derechos de autor, pero otorgas a Ophthalmology Radar una licencia mundial, no exclusiva, libre de regalías para mostrar, reproducir y distribuir el contenido en el contexto del evento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Normas de Conducta</h2>
              <p className="mb-3">
                Está prohibido:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Enviar contenido falso, engañoso o fraudulento</li>
                <li>Manipular el sistema de votación mediante bots o cuentas falsas</li>
                <li>Acosar, intimidar o amenazar a otros usuarios</li>
                <li>Compartir información confidencial de pacientes sin anonimizar</li>
                <li>Realizar ingeniería inversa o intentar acceder de forma no autorizada al sistema</li>
                <li>Enviar spam o contenido promocional no solicitado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Votación Pública</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Cada usuario puede votar una vez por categoría durante el período de votación</li>
                <li>Nos reservamos el derecho de invalidar votos sospechosos de fraude</li>
                <li>Los votos son definitivos y no pueden modificarse una vez emitidos</li>
                <li>El resultado final combina votación pública y evaluación del jurado según criterios establecidos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Compra de Tickets</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Los tickets se procesan a través de Stripe de forma segura</li>
                <li>Los precios están sujetos a cambios hasta la confirmación de compra</li>
                <li>Las cancelaciones y reembolsos siguen nuestra política específica de reembolsos</li>
                <li>Los tickets son personales e intransferibles salvo autorización expresa</li>
                <li>Nos reservamos el derecho de rechazar el acceso por incumplimiento de estos términos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Propiedad Intelectual</h2>
              <p>
                Todo el contenido de la plataforma (diseño, código, logos, marcas) es propiedad de Ophthalmology Radar o sus licenciantes y está protegido por leyes de propiedad intelectual. No puedes copiar, modificar o distribuir ningún contenido sin autorización previa por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">9. Limitación de Responsabilidad</h2>
              <p className="mb-3">
                Ophthalmology Radar Awards:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporciona la plataforma "tal cual" sin garantías de ningún tipo</li>
                <li>No garantiza disponibilidad ininterrumpida o libre de errores</li>
                <li>No se hace responsable de pérdidas directas o indirectas derivadas del uso</li>
                <li>No valida la exactitud médica de los casos enviados</li>
                <li>No es responsable de disputas entre usuarios</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">10. Suspensión y Terminación</h2>
              <p>
                Nos reservamos el derecho de suspender o cancelar tu cuenta en cualquier momento si incumples estos términos, sin previo aviso y sin responsabilidad alguna.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">11. Modificaciones</h2>
              <p>
                Podemos modificar estos términos en cualquier momento. Los cambios sustanciales se notificarán con 30 días de antelación. El uso continuado de la plataforma tras los cambios constituye aceptación de los nuevos términos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">12. Ley Aplicable</h2>
              <p>
                Estos términos se rigen por las leyes de España. Cualquier disputa se someterá a la jurisdicción exclusiva de los tribunales de Madrid.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">13. Contacto</h2>
              <p>
                Para consultas sobre estos términos, contáctanos en:{" "}
                <a href="mailto:legal@ophthalmologyradar.com" className="text-[#C9A227] hover:underline">
                  legal@ophthalmologyradar.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}