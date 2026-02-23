import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { caseData, action, projectId, repo } = await req.json();

        if (!projectId || !repo) {
            return Response.json({ error: 'Project ID and repository are required' }, { status: 400 });
        }

        const token = Deno.env.get("GITHUB_TOKEN");
        if (!token) {
            return Response.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 });
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'Base44-App'
        };

        // Map status from platform to GitHub
        const statusMap = {
            'pending': 'Pendiente',
            'in_review': 'En Revisión',
            'approved': 'Aprobado',
            'rejected': 'Rechazado',
            'finalist': 'Finalista'
        };

        if (action === 'create') {
            // Create issue first
            const issueBody = `
**Categoría:** ${caseData.category_name || 'N/A'}
**Hospital:** ${caseData.hospital || 'N/A'}
**País:** ${caseData.country || 'N/A'}
**Especialidad:** ${caseData.specialty || 'N/A'}
**Estado:** ${statusMap[caseData.status] || caseData.status}

---

${caseData.description || ''}

${caseData.video_url ? `\n🎥 [Ver Video](${caseData.video_url})` : ''}

---
*ID del caso: ${caseData.case_id || caseData.id}*
*Enviado por: ${caseData.created_by}*
`;

            const issueResponse = await fetch(`https://api.github.com/repos/${repo}/issues`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    title: `[Caso] ${caseData.title}`,
                    body: issueBody,
                    labels: ['caso', statusMap[caseData.status]?.toLowerCase() || 'pendiente']
                })
            });

            if (!issueResponse.ok) {
                const error = await issueResponse.text();
                console.error('Failed to create issue:', error);
                return Response.json({ error: 'Failed to create issue' }, { status: issueResponse.status });
            }

            const issue = await issueResponse.json();

            // Update case with GitHub info
            await base44.asServiceRole.entities.Case.update(caseData.id, {
                github_issue_number: issue.number,
                github_issue_url: issue.html_url
            });

            // Add issue to project
            const addToProjectMutation = `
                mutation($projectId: ID!, $contentId: ID!) {
                    addProjectV2ItemById(input: {
                        projectId: $projectId
                        contentId: $contentId
                    }) {
                        item {
                            id
                        }
                    }
                }
            `;

            const addResponse = await fetch('https://api.github.com/graphql', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    query: addToProjectMutation,
                    variables: {
                        projectId: projectId,
                        contentId: issue.node_id
                    }
                })
            });

            const addData = await addResponse.json();
            
            if (addData.errors) {
                console.error('GraphQL errors:', addData.errors);
            }

            const itemId = addData.data?.addProjectV2ItemById?.item?.id;

            // Get project fields to update custom fields
            if (itemId) {
                const getFieldsQuery = `
                    query($projectId: ID!) {
                        node(id: $projectId) {
                            ... on ProjectV2 {
                                fields(first: 20) {
                                    nodes {
                                        ... on ProjectV2Field {
                                            id
                                            name
                                        }
                                        ... on ProjectV2SingleSelectField {
                                            id
                                            name
                                            options {
                                                id
                                                name
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                `;

                const fieldsResponse = await fetch('https://api.github.com/graphql', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        query: getFieldsQuery,
                        variables: { projectId }
                    })
                });

                const fieldsData = await fieldsResponse.json();
                const fields = fieldsData.data?.node?.fields?.nodes || [];

                // Update Status field
                const statusField = fields.find(f => f.name === 'Estado del Caso');
                if (statusField) {
                    const statusOption = statusField.options?.find(o => o.name === statusMap[caseData.status]);
                    if (statusOption) {
                        const updateMutation = `
                            mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
                                updateProjectV2ItemFieldValue(input: {
                                    projectId: $projectId
                                    itemId: $itemId
                                    fieldId: $fieldId
                                    value: $value
                                }) {
                                    projectV2Item {
                                        id
                                    }
                                }
                            }
                        `;

                        await fetch('https://api.github.com/graphql', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({
                                query: updateMutation,
                                variables: {
                                    projectId,
                                    itemId,
                                    fieldId: statusField.id,
                                    value: { singleSelectOptionId: statusOption.id }
                                }
                            })
                        });
                    }
                }

                // Update Category field
                const categoryField = fields.find(f => f.name === 'Categoría');
                if (categoryField && caseData.category_name) {
                    const updateMutation = `
                        mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
                            updateProjectV2ItemFieldValue(input: {
                                projectId: $projectId
                                itemId: $itemId
                                fieldId: $fieldId
                                value: $value
                            }) {
                                projectV2Item {
                                    id
                                }
                            }
                        }
                    `;

                    await fetch('https://api.github.com/graphql', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            query: updateMutation,
                            variables: {
                                projectId,
                                itemId,
                                fieldId: categoryField.id,
                                value: { text: caseData.category_name }
                            }
                        })
                    });
                }

                // Update Hospital field
                const hospitalField = fields.find(f => f.name === 'Hospital');
                if (hospitalField && caseData.hospital) {
                    const updateMutation = `
                        mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
                            updateProjectV2ItemFieldValue(input: {
                                projectId: $projectId
                                itemId: $itemId
                                fieldId: $fieldId
                                value: $value
                            }) {
                                projectV2Item {
                                    id
                                }
                            }
                        }
                    `;

                    await fetch('https://api.github.com/graphql', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            query: updateMutation,
                            variables: {
                                projectId,
                                itemId,
                                fieldId: hospitalField.id,
                                value: { text: caseData.hospital }
                            }
                        })
                    });
                }
            }

            return Response.json({ 
                success: true,
                issue: {
                    number: issue.number,
                    url: issue.html_url,
                    id: issue.id
                }
            });

        } else if (action === 'update') {
            // Update existing issue
            const { issueNumber, issueId } = caseData;
            
            if (!issueNumber) {
                return Response.json({ error: 'Issue number required for update' }, { status: 400 });
            }

            // Update issue labels based on status
            const labelResponse = await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({
                    labels: ['caso', statusMap[caseData.status]?.toLowerCase() || 'pendiente']
                })
            });

            if (!labelResponse.ok) {
                console.error('Failed to update issue labels');
            }

            return Response.json({ 
                success: true,
                message: 'Issue updated'
            });
        }

        return Response.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error syncing case:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});