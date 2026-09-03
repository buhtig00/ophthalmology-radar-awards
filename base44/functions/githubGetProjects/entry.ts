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

        // Get user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Base44-App'
            }
        });

        if (!userResponse.ok) {
            return Response.json({ error: 'Failed to authenticate' }, { status: userResponse.status });
        }

        const userData = await userResponse.json();

        // Get projects
        const projectsQuery = `
            query($login: String!) {
                user(login: $login) {
                    projectsV2(first: 20) {
                        nodes {
                            id
                            number
                            title
                            url
                            shortDescription
                        }
                    }
                }
            }
        `;

        const projectsResponse = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Base44-App'
            },
            body: JSON.stringify({
                query: projectsQuery,
                variables: {
                    login: userData.login
                }
            })
        });

        const projectsData = await projectsResponse.json();
        
        if (projectsData.errors) {
            console.error('GraphQL errors:', projectsData.errors);
            return Response.json({ error: 'Failed to fetch projects' }, { status: 400 });
        }

        const projects = projectsData.data?.user?.projectsV2?.nodes || [];

        return Response.json({ projects });

    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});