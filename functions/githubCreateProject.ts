import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { name, description, template } = await req.json();

        if (!name) {
            return Response.json({ error: 'Project name is required' }, { status: 400 });
        }

        const token = Deno.env.get("GITHUB_TOKEN");
        if (!token) {
            return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
        }

        // Get authenticated user info
        const userResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Base44-App'
            }
        });

        if (!userResponse.ok) {
            console.error('Failed to get user info:', await userResponse.text());
            return Response.json({ error: 'Failed to authenticate with GitHub' }, { status: userResponse.status });
        }

        const userData = await userResponse.json();

        // Create project (GitHub Projects v2)
        const createProjectMutation = `
            mutation($ownerId: ID!, $title: String!, $body: String) {
                createProjectV2(input: {
                    ownerId: $ownerId
                    title: $title
                    body: $body
                }) {
                    projectV2 {
                        id
                        number
                        title
                        url
                        shortDescription
                    }
                }
            }
        `;

        const projectResponse = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Base44-App'
            },
            body: JSON.stringify({
                query: createProjectMutation,
                variables: {
                    ownerId: userData.node_id,
                    title: name,
                    body: description || `Proyecto para gestión de ${name}`
                }
            })
        });

        if (!projectResponse.ok) {
            const error = await projectResponse.text();
            console.error('GitHub GraphQL error:', error);
            return Response.json({ error: 'Failed to create project' }, { status: projectResponse.status });
        }

        const projectData = await projectResponse.json();

        if (projectData.errors) {
            console.error('GraphQL errors:', projectData.errors);
            return Response.json({ error: projectData.errors[0].message }, { status: 400 });
        }

        const project = projectData.data.createProjectV2.projectV2;

        // Add custom fields for Awards Platform if template is specified
        if (template === 'awards') {
            const addFieldMutation = `
                mutation($projectId: ID!, $name: String!, $dataType: ProjectV2CustomFieldType!) {
                    createProjectV2Field(input: {
                        projectId: $projectId
                        name: $name
                        dataType: $dataType
                    }) {
                        projectV2Field {
                            ... on ProjectV2Field {
                                id
                                name
                            }
                        }
                    }
                }
            `;

            // Add Status field with custom options
            const statusMutation = `
                mutation($projectId: ID!, $name: String!, $options: [ProjectV2SingleSelectFieldOptionInput!]!) {
                    createProjectV2Field(input: {
                        projectId: $projectId
                        name: $name
                        dataType: SINGLE_SELECT
                        singleSelectOptions: $options
                    }) {
                        projectV2Field {
                            ... on ProjectV2SingleSelectField {
                                id
                                name
                            }
                        }
                    }
                }
            `;

            await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Base44-App'
                },
                body: JSON.stringify({
                    query: statusMutation,
                    variables: {
                        projectId: project.id,
                        name: "Estado del Caso",
                        options: [
                            { name: "Pendiente", color: "GRAY" },
                            { name: "En Revisión", color: "YELLOW" },
                            { name: "Aprobado", color: "GREEN" },
                            { name: "Rechazado", color: "RED" },
                            { name: "Finalista", color: "PURPLE" }
                        ]
                    }
                })
            });

            // Add Category field
            await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Base44-App'
                },
                body: JSON.stringify({
                    query: addFieldMutation,
                    variables: {
                        projectId: project.id,
                        name: "Categoría",
                        dataType: "TEXT"
                    }
                })
            });

            // Add Hospital field
            await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'User-Agent': 'Base44-App'
                },
                body: JSON.stringify({
                    query: addFieldMutation,
                    variables: {
                        projectId: project.id,
                        name: "Hospital",
                        dataType: "TEXT"
                    }
                })
            });
        }

        return Response.json({ 
            success: true,
            project: {
                id: project.id,
                number: project.number,
                title: project.title,
                url: project.url,
                description: project.shortDescription
            }
        });
    } catch (error) {
        console.error('Error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});