import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2, GitBranch, MessageSquare, GitCommit, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function GitHubActivity({ caseData }) {
  const { data: activity, isLoading } = useQuery({
    queryKey: ["github-activity", caseData?.github_issue_number],
    queryFn: async () => {
      if (!caseData?.github_issue_number || !caseData?.github_issue_url) return null;
      
      const repoMatch = caseData.github_issue_url.match(/github\.com\/([^/]+\/[^/]+)/);
      if (!repoMatch) return null;
      
      const { data } = await base44.functions.invoke("githubIssueActivity", {
        repo: repoMatch[1],
        issueNumber: caseData.github_issue_number
      });
      
      return data;
    },
    enabled: !!caseData?.github_issue_number,
    staleTime: 2 * 60 * 1000,
  });

  if (!caseData?.github_issue_number) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <Github className="w-5 h-5" />
          <span className="text-sm">No vinculado con GitHub</span>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando actividad...</span>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <a 
          href={caseData.github_issue_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[#C9A227] hover:text-[#E8C547] transition-colors"
        >
          <Github className="w-5 h-5" />
          <span className="text-sm font-medium">Ver en GitHub #{caseData.github_issue_number}</span>
          <ExternalLink className="w-3 h-3 ml-auto" />
        </a>
      </div>
    );
  }

  const hasActivity = activity.commits?.length > 0 || 
                      activity.comments?.length > 0 || 
                      activity.branches?.length > 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <a 
          href={caseData.github_issue_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-[#C9A227] hover:text-[#E8C547] transition-colors"
        >
          <Github className="w-5 h-5" />
          <span className="text-sm font-medium">Issue #{caseData.github_issue_number}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
        <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400 text-xs">
          {activity.issue?.state}
        </Badge>
      </div>

      {/* Activity Summary */}
      {hasActivity && (
        <div className="grid grid-cols-3 gap-2">
          {activity.commits && activity.commits.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <GitCommit className="w-3.5 h-3.5" />
              <span className="text-xs">{activity.commits.length} commits</span>
            </div>
          )}
          {activity.comments && activity.comments.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-xs">{activity.comments.length} comentarios</span>
            </div>
          )}
          {activity.branches && activity.branches.length > 0 && (
            <div className="flex items-center gap-1.5 text-gray-400">
              <GitBranch className="w-3.5 h-3.5" />
              <span className="text-xs">{activity.branches.length} branches</span>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      {hasActivity && (
        <div className="pt-2 border-t border-white/5">
          <p className="text-gray-500 text-xs mb-2">Actividad reciente:</p>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {activity.commits?.slice(0, 3).map((commit, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <GitCommit className="w-3 h-3 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 truncate">{commit.message}</p>
                  <p className="text-gray-600 text-xs">
                    {commit.author} • {format(new Date(commit.date), "d MMM", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
            {activity.comments?.slice(0, 2).map((comment, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <MessageSquare className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 truncate">{comment.body}</p>
                  <p className="text-gray-600 text-xs">
                    {comment.user} • {format(new Date(comment.created_at), "d MMM", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasActivity && (
        <p className="text-gray-500 text-xs">Sin actividad reciente</p>
      )}
    </div>
  );
}