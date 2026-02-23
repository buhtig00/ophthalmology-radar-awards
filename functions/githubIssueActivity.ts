import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { repo, issue_number } = await req.json();

        if (!repo || !issue_number) {
            return Response.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const token = Deno.env.get('GITHUB_TOKEN');
        if (!token) {
            return Response.json({ error: 'GitHub token not configured' }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Base44-Awards-Platform'
        };

        // Fetch issue details with timeline
        const issueResponse = await fetch(
            `https://api.github.com/repos/${repo}/issues/${issue_number}`,
            { headers }
        );

        if (!issueResponse.ok) {
            throw new Error(`GitHub API error: ${issueResponse.status}`);
        }

        const issue = await issueResponse.json();

        // Fetch issue timeline (includes commits, branch references, etc.)
        const timelineResponse = await fetch(
            `https://api.github.com/repos/${repo}/issues/${issue_number}/timeline`,
            { 
                headers: {
                    ...headers,
                    'Accept': 'application/vnd.github.mockingbird-preview+json'
                }
            }
        );

        let timeline = [];
        if (timelineResponse.ok) {
            timeline = await timelineResponse.json();
        }

        // Fetch issue comments
        const commentsResponse = await fetch(
            `https://api.github.com/repos/${repo}/issues/${issue_number}/comments`,
            { headers }
        );

        let comments = [];
        if (commentsResponse.ok) {
            comments = await commentsResponse.json();
        }

        // Extract commits from timeline
        const commits = timeline
            .filter(event => event.event === 'committed')
            .map(event => ({
                sha: event.sha,
                message: event.message,
                author: event.author?.name || event.committer?.name,
                date: event.author?.date || event.committer?.date,
                url: event.html_url
            }));

        // Extract cross-referenced events (PRs, branches)
        const crossReferences = timeline
            .filter(event => event.event === 'cross-referenced')
            .map(event => ({
                type: event.source?.type,
                title: event.source?.issue?.title,
                number: event.source?.issue?.number,
                state: event.source?.issue?.state,
                url: event.source?.issue?.html_url,
                created_at: event.created_at
            }));

        // Extract branch references from issue body and comments
        const branchPattern = /\b([a-zA-Z0-9\/_-]+\/[a-zA-Z0-9\/_-]+)\b/g;
        const branches = new Set();
        
        const allText = [
            issue.body || '',
            ...comments.map(c => c.body || '')
        ].join(' ');
        
        const matches = allText.match(branchPattern);
        if (matches) {
            matches.forEach(match => {
                if (match.includes('/') && !match.startsWith('http')) {
                    branches.add(match);
                }
            });
        }

        // Get recent issue events
        const eventsResponse = await fetch(
            `https://api.github.com/repos/${repo}/issues/${issue_number}/events`,
            { headers }
        );

        let events = [];
        if (eventsResponse.ok) {
            const allEvents = await eventsResponse.json();
            events = allEvents.slice(0, 10).map(event => ({
                type: event.event,
                actor: event.actor?.login,
                created_at: event.created_at,
                label: event.label?.name
            }));
        }

        return Response.json({
            issue: {
                number: issue.number,
                title: issue.title,
                state: issue.state,
                labels: issue.labels.map(l => l.name),
                created_at: issue.created_at,
                updated_at: issue.updated_at,
                closed_at: issue.closed_at,
                html_url: issue.html_url
            },
            commits,
            crossReferences,
            branches: Array.from(branches),
            events,
            comments: comments.slice(0, 5).map(c => ({
                author: c.user?.login,
                body: c.body?.substring(0, 200) + (c.body?.length > 200 ? '...' : ''),
                created_at: c.created_at,
                html_url: c.html_url
            }))
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching issue activity:', error);
        return Response.json({ 
            error: 'Failed to fetch issue activity',
            message: error.message 
        }, { status: 500 });
    }
});