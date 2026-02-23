import { base44 } from "@/api/base44Client";

// Helper to log emails sent
const logEmail = async (recipient, subject, templateType, status = "sent", metadata = {}) => {
  try {
    await base44.entities.EmailLog.create({
      recipient,
      subject,
      template_type: templateType,
      status,
      metadata,
    });
  } catch (error) {
    console.error("Error logging email:", error);
  }
};

// Email templates
const EMAIL_TEMPLATES = {
  case_approved: (caseName, caseId) => ({
    subject: "¡Tu caso ha sido aprobado! - Ophthalmology Radar Awards",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c9a84c; margin: 0;">Ophthalmology Radar Awards 2026</h1>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.2); border-radius: 12px; padding: 30px;">
          <h2 style="color: #c9a84c; margin-top: 0;">¡Enhorabuena! 🎉</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Tu caso clínico <strong style="color: #ffffff;">"${caseName}"</strong> (ID: ${caseId}) ha sido revisado y <strong style="color: #4ade80;">aprobado</strong> por nuestro equipo.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Tu contribución es valiosa para la comunidad médica y estamos emocionados de incluirlo en nuestra plataforma.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${window.location.origin}" style="display: inline-block; background: #c9a84c; color: #0a0e1a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Ver mi caso
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
          Ophthalmology Radar Awards 2026 - Celebrando la excelencia en oftalmología
        </p>
      </div>
    `,
  }),

  case_rejected: (caseName, caseId, reason) => ({
    subject: "Actualización sobre tu caso - Ophthalmology Radar Awards",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c9a84c; margin: 0;">Ophthalmology Radar Awards 2026</h1>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(239,68,68,0.2); border-radius: 12px; padding: 30px;">
          <h2 style="color: #ef4444; margin-top: 0;">Actualización de tu caso</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Tu caso clínico <strong style="color: #ffffff;">"${caseName}"</strong> (ID: ${caseId}) ha sido revisado por nuestro equipo.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Lamentablemente, en esta ocasión no puede ser incluido por el siguiente motivo:
          </p>
          <div style="background: rgba(239,68,68,0.1); border-left: 3px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; color: #fca5a5; font-style: italic;">${reason}</p>
          </div>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Te invitamos a revisar los requisitos y enviar un nuevo caso. ¡No te desanimes!
          </p>
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
          Ophthalmology Radar Awards 2026
        </p>
      </div>
    `,
  }),

  voting_reminder: (userName, categoriesPending) => ({
    subject: "¡No olvides votar! - Ophthalmology Radar Awards",
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c9a84c; margin: 0;">Ophthalmology Radar Awards 2026</h1>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.2); border-radius: 12px; padding: 30px;">
          <h2 style="color: #c9a84c; margin-top: 0;">¡Tu voto cuenta! 🗳️</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Hola ${userName},
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Aún tienes <strong style="color: #c9a84c;">${categoriesPending} ${categoriesPending === 1 ? 'categoría' : 'categorías'}</strong> pendientes por votar en los Ophthalmology Radar Awards 2026.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Tu opinión es importante para reconocer la excelencia en nuestra comunidad médica.
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${window.location.origin}" style="display: inline-block; background: #c9a84c; color: #0a0e1a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Ir a votar ahora
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
          Ophthalmology Radar Awards 2026
        </p>
      </div>
    `,
  }),

  finalist_announcement: (finalistName, categoryName) => ({
    subject: `Nuevo finalista anunciado: ${finalistName} - Ophthalmology Radar Awards`,
    body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #ffffff; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #c9a84c; margin: 0;">Ophthalmology Radar Awards 2026</h1>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(201,168,76,0.2); border-radius: 12px; padding: 30px;">
          <h2 style="color: #c9a84c; margin-top: 0;">¡Nuevo finalista anunciado! 🏆</h2>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            Nos complace anunciar que <strong style="color: #ffffff;">${finalistName}</strong> ha sido seleccionado como finalista en la categoría <strong style="color: #c9a84c;">${categoryName}</strong>.
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #e5e7eb;">
            ¡No te pierdas la oportunidad de conocer más sobre este destacado profesional y emitir tu voto!
          </p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${window.location.origin}" style="display: inline-block; background: #c9a84c; color: #0a0e1a; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Ver finalista
            </a>
          </div>
        </div>
        
        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px;">
          Ophthalmology Radar Awards 2026
        </p>
      </div>
    `,
  }),
};

// Send email with template
export const sendTemplatedEmail = async (to, templateType, templateData) => {
  try {
    const template = EMAIL_TEMPLATES[templateType];
    if (!template) {
      throw new Error(`Template ${templateType} not found`);
    }

    const { subject, body } = template(...Object.values(templateData));

    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body,
    });

    await logEmail(to, subject, templateType, "sent", templateData);
    return { success: true };
  } catch (error) {
    await logEmail(to, "Email failed", templateType, "failed", { error: error.message });
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

export default { sendTemplatedEmail, EMAIL_TEMPLATES };