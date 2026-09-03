import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const token = Deno.env.get("GITHUB_TOKEN");
        if (!token) {
            return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
        }

        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=50', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Base44-App'
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('GitHub API error:', error);
            return Response.json({ error: 'Failed to fetch repositories' }, { status: response.status });
        }

        const repos = await response.json();
        
        return Response.json({ 
            repos: repos.map(r => ({
                id: r.id,
                name: r.name,
                full_name: r.full_name,
                description: r.description,
                html_url: r.html_url,
                private: r.private,
                updated_at: r.updated_at,
                language: r.language,
                stargazers_count: r.stargazers_count,
                forks_count: r.forks_count,
                open_issues_count: r.open_issues_count
            }))
        });
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});