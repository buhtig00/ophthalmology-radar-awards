import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CommentSection({ caseId }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", caseId],
    queryFn: () => base44.entities.Comment.filter({ case_id: caseId }),
    enabled: !!caseId,
  });

  const postMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Comment.create({
        case_id: caseId,
        user_name: user.full_name || user.email,
        content: comment,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", caseId] });
      setComment("");
      toast.success("Comentario publicado");
    },
  });

  if (!caseId) return null;

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#C9A227]" />
        Comentarios ({comments.length})
      </h2>

      {user && (
        <div className="mb-6">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="bg-white/5 border-white/10 text-white mb-3"
            rows={3}
          />
          <Button
            onClick={() => postMutation.mutate()}
            disabled={!comment.trim() || postMutation.isPending}
            className="bg-[#C9A227] hover:bg-[#E8C547] text-black"
          >
            {postMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Publicar
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 text-[#C9A227] animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No hay comentarios aún</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium text-sm">{c.user_name}</span>
                <span className="text-gray-500 text-xs">
                  {format(new Date(c.created_date), "d MMM yyyy")}
                </span>
              </div>
              <p className="text-gray-300 text-sm">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}