import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { repo, webhook_url } = await req.json();

        if (!repo || !webhook_url) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const token = Deno.env.get('GITHUB_TOKEN');
        const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET');

        if (!token) {
            return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        if (!webhookSecret) {
            return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'Base44-Awards-Platform'
        };

        // Create webhook
        const webhookData = {
            name: 'web',
            active: true,
            events: ['issues', 'issue_comment', 'project_card', 'label'],
            config: {
                url: webhook_url,
                content_type: 'json',
                secret: webhookSecret,
                insecure_ssl: '0'
            }
        };

        const response = await fetch(
            `https://api.github.com/repos/${repo}/hooks`,
            {
                method: 'POST',
                headers,
                body: JSON.stringify(webhookData)
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('GitHub API error:', error);
            throw new Error(error.message || 'Failed to create webhook');
        }

        const webhook = await response.json();

        console.log(`Webhook registered for ${repo}: ${webhook.id}`);

        return Response.json({
            message: 'Webhook registered successfully',
            webhook: {
                id: webhook.id,
                url: webhook.config.url,
                events: webhook.events,
                active: webhook.active
            }
        }, { status: 200 });

    } catch (error) {
        console.error('Error registering webhook:', error);
        return Response.json({ 
            error: 'Failed to register webhook',
            message: error.message 
        }, { status: 500 });
    }
});