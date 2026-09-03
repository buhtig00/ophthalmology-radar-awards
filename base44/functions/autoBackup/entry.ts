import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        console.log('[Backup] Starting automatic backup process...');

        const timestamp = new Date().toISOString().split('T')[0];
        const backupData = {
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        // Backup all entities
        const entities = [
            'Case', 'Category', 'Comment', 'EmailLog', 'EventConfig', 
            'Favorite', 'Finalist', 'Jury', 'JuryScore', 'Partner', 
            'Ticket', 'User', 'Vote'
        ];

        for (const entityName of entities) {
            try {
                const data = await base44.asServiceRole.entities[entityName].list();
                backupData[entityName] = data;
                console.log(`[Backup] ${entityName}: ${data.length} records`);
            } catch (error) {
                console.error(`[Backup] Error backing up ${entityName}:`, error.message);
                backupData[entityName] = { error: error.message };
            }
        }

        // Create backup file
        const backupJson = JSON.stringify(backupData, null, 2);
        const backupBlob = new Blob([backupJson], { type: 'application/json' });
        
        // Upload to storage
        const fileName = `backup-${timestamp}.json`;
        const formData = new FormData();
        formData.append('file', backupBlob, fileName);

        const uploadResponse = await base44.asServiceRole.integrations.Core.UploadPrivateFile({
            file: backupBlob
        });

        console.log('[Backup] Backup completed successfully:', uploadResponse.file_uri);

        // Log backup in EmailLog for tracking
        await base44.asServiceRole.entities.EmailLog.create({
            recipient: 'system@backup',
            subject: `Backup automático - ${timestamp}`,
            template_type: 'digest_daily',
            status: 'sent',
            metadata: {
                type: 'backup',
                file_uri: uploadResponse.file_uri,
                entities_count: Object.keys(backupData).length - 2,
                total_records: Object.values(backupData)
                    .filter(v => Array.isArray(v))
                    .reduce((sum, arr) => sum + arr.length, 0)
            }
        });

        return Response.json({
            success: true,
            message: 'Backup completed successfully',
            file_uri: uploadResponse.file_uri,
            timestamp: backupData.timestamp,
            entities: entities.length,
            total_records: Object.values(backupData)
                .filter(v => Array.isArray(v))
                .reduce((sum, arr) => sum + arr.length, 0)
        });

    } catch (error) {
        console.error('[Backup] Fatal error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});