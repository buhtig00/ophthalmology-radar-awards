import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Authenticate user
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        const { timeRange = '7d', metrics = 'all' } = await req.json().catch(() => ({}));

        console.log('[Analytics] Generating advanced analytics...');

        // Calculate date range
        const now = new Date();
        const daysMap = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 };
        const days = daysMap[timeRange] || 7;
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        // Fetch all data
        const [cases, votes, users, juryScores, tickets, comments, favorites] = await Promise.all([
            base44.asServiceRole.entities.Case.list(),
            base44.asServiceRole.entities.Vote.list(),
            base44.asServiceRole.entities.User.list(),
            base44.asServiceRole.entities.JuryScore.list(),
            base44.asServiceRole.entities.Ticket.list(),
            base44.asServiceRole.entities.Comment.list(),
            base44.asServiceRole.entities.Favorite.list()
        ]);

        // Filter by date range
        const filterByDate = (items) => items.filter(item => 
            new Date(item.created_date) >= startDate
        );

        const recentCases = filterByDate(cases);
        const recentVotes = filterByDate(votes);
        const recentUsers = filterByDate(users);
        const recentTickets = filterByDate(tickets);

        // Advanced metrics
        const analytics = {
            timestamp: new Date().toISOString(),
            timeRange,
            
            // User engagement
            engagement: {
                total_users: users.length,
                new_users: recentUsers.length,
                active_users: new Set([
                    ...recentVotes.map(v => v.created_by),
                    ...recentComments.map(c => c.created_by),
                    ...recentCases.map(c => c.created_by)
                ].filter(Boolean)).size,
                user_retention: ((users.length - recentUsers.length) / users.length * 100).toFixed(1)
            },

            // Content metrics
            content: {
                total_cases: cases.length,
                new_cases: recentCases.length,
                approved_cases: cases.filter(c => c.status === 'approved').length,
                rejection_rate: (cases.filter(c => c.status === 'rejected').length / cases.length * 100).toFixed(1),
                avg_review_time: calculateAvgReviewTime(cases)
            },

            // Voting metrics
            voting: {
                total_votes: votes.length,
                new_votes: recentVotes.length,
                avg_votes_per_case: (votes.length / cases.length).toFixed(2),
                unique_voters: new Set(votes.map(v => v.created_by)).size,
                voting_rate: (new Set(votes.map(v => v.created_by)).size / users.length * 100).toFixed(1),
                votes_by_category: groupBy(votes, 'category_name')
            },

            // Jury evaluation
            jury: {
                total_evaluations: juryScores.length,
                avg_innovation_score: avg(juryScores.map(s => s.innovation_score)),
                avg_clinical_score: avg(juryScores.map(s => s.clinical_impact_score)),
                avg_presentation_score: avg(juryScores.map(s => s.presentation_quality_score)),
                avg_teaching_score: avg(juryScores.map(s => s.teaching_value_score)),
                cases_evaluated: new Set(juryScores.map(s => s.case_id)).size
            },

            // Revenue metrics
            revenue: {
                total_tickets_sold: tickets.filter(t => t.paid).length,
                total_revenue: tickets.filter(t => t.paid).reduce((sum, t) => sum + t.price, 0) / 100,
                streaming_tickets: tickets.filter(t => t.type === 'streaming' && t.paid).length,
                vip_tickets: tickets.filter(t => t.type === 'vip' && t.paid).length,
                conversion_rate: (tickets.filter(t => t.paid).length / tickets.length * 100).toFixed(1)
            },

            // Geographic distribution
            geographic: {
                countries: groupBy(cases, 'country'),
                hospitals: groupBy(cases, 'hospital'),
                top_countries: getTopN(groupBy(cases, 'country'), 5)
            },

            // Trends (daily breakdown)
            trends: {
                daily_cases: getDailyTrend(recentCases),
                daily_votes: getDailyTrend(recentVotes),
                daily_users: getDailyTrend(recentUsers)
            },

            // Performance indicators
            performance: {
                case_completion_rate: (cases.filter(c => c.status !== 'pending').length / cases.length * 100).toFixed(1),
                jury_participation_rate: (juryScores.length / (cases.filter(c => c.status === 'approved').length * 10) * 100).toFixed(1),
                user_satisfaction: calculateSatisfaction(comments, favorites)
            }
        };

        console.log('[Analytics] Analytics generated successfully');

        return Response.json({
            success: true,
            analytics
        });

    } catch (error) {
        console.error('[Analytics] Error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});

// Helper functions
function calculateAvgReviewTime(cases) {
    const reviewed = cases.filter(c => c.reviewed_at && c.created_date);
    if (reviewed.length === 0) return 0;
    const totalMs = reviewed.reduce((sum, c) => {
        return sum + (new Date(c.reviewed_at) - new Date(c.created_date));
    }, 0);
    const avgHours = (totalMs / reviewed.length) / (1000 * 60 * 60);
    return avgHours.toFixed(1);
}

function avg(arr) {
    const valid = arr.filter(n => n != null);
    return valid.length > 0 ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : 0;
}

function groupBy(arr, key) {
    const grouped = {};
    arr.forEach(item => {
        const val = item[key] || 'Sin especificar';
        grouped[val] = (grouped[val] || 0) + 1;
    });
    return grouped;
}

function getTopN(obj, n) {
    return Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .slice(0, n)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
}

function getDailyTrend(items) {
    const daily = {};
    items.forEach(item => {
        const date = new Date(item.created_date).toISOString().split('T')[0];
        daily[date] = (daily[date] || 0) + 1;
    });
    return daily;
}

function calculateSatisfaction(comments, favorites) {
    const totalInteractions = comments.length + favorites.length;
    if (totalInteractions === 0) return 0;
    // Simple heuristic: favorites weight more positively
    const score = ((favorites.length * 2 + comments.length) / (totalInteractions * 2)) * 100;
    return score.toFixed(1);
}