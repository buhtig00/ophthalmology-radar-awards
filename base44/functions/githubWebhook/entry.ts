import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createHmac } from "node:crypto";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const body = await req.text();
        const signature = req.headers.get('x-hub-signature-256');
        const event = req.headers.get('x-github-event');

        // Verify webhook signature
        const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET');
        if (!secret) {
            console.error('GITHUB_WEBHOOK_SECRET not configured');
            return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        const hmac = createHmac('sha256', secret);
        hmac.update(body);
        const calculatedSignature = 'sha256=' + hmac.digest('hex');

        if (signature !== calculatedSignature) {
            console.error('Invalid webhook signature');
            return Response.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const payload = JSON.parse(body);
        console.log(`Received GitHub webhook event: ${event}`, { action: payload.action });

        // Handle issue events
        if (event === 'issues') {
            const issue = payload.issue;
            const action = payload.action;

            // Find the case associated with this issue
            const cases = await base44.asServiceRole.entities.Case.list();
            const linkedCase = cases.find(c => c.github_issue_number === issue.number);

            if (!linkedCase) {
                console.log(`No case linked to issue #${issue.number}`);
                return Response.json({ message: 'No linked case found' }, { status: 200 });
            }

            console.log(`Found linked case: ${linkedCase.id} (${linkedCase.title})`);

            // Map GitHub issue state/labels to case status
            let newStatus = linkedCase.status;

            if (action === 'closed') {
                // Check if closed as completed or rejected based on labels
                const labels = issue.labels.map(l => l.name);
                if (labels.includes('rejected')) {
                    newStatus = 'rejected';
                } else {
                    newStatus = 'approved';
                }
            } else if (action === 'reopened') {
                newStatus = 'in_review';
            } else if (action === 'labeled' || action === 'unlabeled') {
                const labels = issue.labels.map(l => l.name);
                
                if (labels.includes('finalist')) {
                    newStatus = 'finalist';
                } else if (labels.includes('approved')) {
                    newStatus = 'approved';
                } else if (labels.includes('rejected')) {
                    newStatus = 'rejected';
                } else if (labels.includes('in-review')) {
                    newStatus = 'in_review';
                }
            }

            // Update case if status changed
            if (newStatus !== linkedCase.status) {
                await base44.asServiceRole.entities.Case.update(linkedCase.id, {
                    status: newStatus,
                    reviewed_at: new Date().toISOString(),
                    reviewed_by: 'GitHub Webhook'
                });

                console.log(`Updated case ${linkedCase.id} status: ${linkedCase.status} → ${newStatus}`);

                return Response.json({
                    message: 'Case status updated',
                    case_id: linkedCase.id,
                    old_status: linkedCase.status,
                    new_status: newStatus
                }, { status: 200 });
            }
        }

        // Handle project card events
        if (event === 'project_card') {
            console.log(`Project card event: ${payload.action}`);
            // Could extend to handle project board movements
        }

        return Response.json({ message: 'Webhook processed', event }, { status: 200 });

    } catch (error) {
        console.error('GitHub webhook error:', error);
        return Response.json({ 
            error: 'Internal server error',
            message: error.message 
        }, { status: 500 });
    }
});