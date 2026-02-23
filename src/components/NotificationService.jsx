import { base44 } from "@/api/base44Client";

export const notificationService = {
  async sendVotingStartNotification(users) {
    return this.sendBatchNotifications(users, {
      type: "voting_start",
      subject: "¡La votación ha comenzado! 🗳️",
      title: "Votación Abierta",
      message: "Ya puedes votar por tus casos favoritos en los Ophthalmology Radar Awards 2026",
    });
  },

  async sendVotingEndNotification(users) {
    return this.sendBatchNotifications(users, {
      type: "voting_end",
      subject: "⏰ Últimas horas para votar - Cierre inminente",
      title: "La Votación Está Cerrando",
      message: "No olvides emitir tu voto antes de que se cierre la votación",
    });
  },

  async sendTicketReminderNotification(users) {
    return this.sendBatchNotifications(users, {
      type: "ticket_reminder",
      subject: "Recuerda comprar tu pase para la gala 🎟️",
      title: "Compra tu Pase",
      message: "Asegúrate de tener tu entrada para disfrutar de la gala Ophthalmology Radar Awards",
    });
  },

  async sendStreamStartNotification(users) {
    return this.sendBatchNotifications(users, {
      type: "stream_start",
      subject: "¡Comienza la transmisión en vivo! 📺",
      title: "Transmisión en Vivo",
      message: "La gala está comenzando ahora. ¡Accede a la transmisión en vivo!",
    });
  },

  async sendWinnerAnnouncementNotification(data) {
    const { winner, category, users } = data;
    
    return this.sendBatchNotifications(users, {
      type: "winner_announcement",
      subject: `Ganador Anunciado: ${category}`,
      title: "Tenemos Ganador",
      message: `${winner} ha ganado la categoría de ${category}`,
      metadata: { category, winner },
    });
  },

  async sendBatchNotifications(users, notificationData) {
    if (!users || users.length === 0) return { success: 0, failed: 0 };

    let successCount = 0;
    let failedCount = 0;

    for (const user of users) {
      if (!user.notification_preferences || !user.notification_preferences[notificationData.type]) {
        continue;
      }

      try {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: notificationData.subject,
          body: this.buildEmailTemplate(user, notificationData),
        });

        await base44.entities.EmailLog.create({
          recipient: user.email,
          subject: notificationData.subject,
          template_type: notificationData.type,
          status: "sent",
          metadata: notificationData.metadata || {},
        });

        successCount++;
      } catch (error) {
        console.error(`Error sending notification to ${user.email}:`, error);
        failedCount++;

        try {
          await base44.entities.EmailLog.create({
            recipient: user.email,
            subject: notificationData.subject,
            template_type: notificationData.type,
            status: "failed",
            metadata: { error: error.message, ...notificationData.metadata },
          });
        } catch {}
      }
    }

    return { success: successCount, failed: failedCount };
  },

  buildEmailTemplate(user, notificationData) {
    const { title, message, metadata } = notificationData;
    const firstName = user.full_name?.split(" ")[0] || "Usuario";

    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0a0e1a; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .logo { font-size: 12px; color: #C9A227; margin-top: 8px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px; }
        .content p { margin: 16px 0; line-height: 1.6; }
        .highlight { color: #C9A227; font-weight: bold; }
        .cta { display: inline-block; background: #C9A227; color: black; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        .metadata { background: #fff; padding: 15px; border-left: 4px solid #C9A227; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
            <div class="logo">Ophthalmology Radar Awards 2026</div>
        </div>
        <div class="content">
            <p>Hola <span class="highlight">${firstName}</span>,</p>
            <p>${message}</p>
            ${metadata?.category ? `<div class="metadata"><strong>Categoría:</strong> ${metadata.category}<br><strong>Ganador:</strong> ${metadata.winner}</div>` : ""}
            <a href="https://ophthalmologyradar.com" class="cta">Ver Más</a>
            <div class="footer">
                <p>Esta es una notificación automática del Ophthalmology Radar Awards 2026.</p>
                <p>Puedes gestionar tus preferencias de notificaciones en tu perfil.</p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  },

  async getNotifiedUsers(preferenceKey) {
    try {
      const users = await base44.entities.User.list();
      return users.filter(u => u.notification_preferences?.[preferenceKey] === true);
    } catch (error) {
      console.error("Error fetching users for notification:", error);
      return [];
    }
  },
};