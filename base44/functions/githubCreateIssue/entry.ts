import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { repo, title, body, labels } = await req.json();

        if (!repo || !title) {
            return Response.json({ error: 'repo and title are required' }, { status: 400 });
        }

        const token = Deno.env.get("GITHUB_TOKEN");
        if (!token) {
            return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
        }

        const response = await fetch(`https://api.github.com/repos/${repo}/issues`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Base44-App'
            },
            body: JSON.stringify({
                title,
                body: body || '',
                labels: labels || []
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('GitHub API error:', error);
            return Response.json({ error: 'Failed to create issue' }, { status: response.status });
        }

        const issue = await response.json();
        
        return Response.json({ 
            success: true,
            issue: {
                id: issue.id,
                number: issue.number,
                title: issue.title,
                html_url: issue.html_url,
                state: issue.state,
                created_at: issue.created_at
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});