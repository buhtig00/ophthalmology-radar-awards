import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send, User, Loader2 } from "lucide-react";
import { toast } from "sonner";
import moment from "moment";

export default function CommentSection({ finalistId, caseId }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const filterQuery = finalistId ? { finalist_id: finalistId } : { case_id: caseId };

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", finalistId || caseId],
    queryFn: () => base44.entities.Comment.filter(filterQuery, "-created_date"),
  });

  const createCommentMutation = useMutation({
    mutationFn: async (content) => {
      const commentData = {
        content,
        user_name: user.full_name || user.email,
      };
      
      if (finalistId) commentData.finalist_id = finalistId;
      if (caseId) commentData.case_id = caseId;

      await base44.entities.Comment.create(commentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", finalistId || caseId] });
      setNewComment("");
      toast.success("Comentario publicado");
    },
    onError: () => {
      toast.error("Error al publicar comentario");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (!newComment.trim()) return;
    createCommentMutation.mutate(newComment);
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-[#c9a84c]" />
        <h3 className="text-white font-semibold text-lg">
          Comentarios ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Comparte tu opinión..." : "Inicia sesión para comentar"}
          className="mb-3 bg-white/5 border-white/10 text-white placeholder:text-gray-500 min-h-[100px]"
          disabled={!user || createCommentMutation.isPending}
        />
        <Button
          type="submit"
          disabled={!user || !newComment.trim() || createCommentMutation.isPending}
          className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a] font-semibold"
        >
          {createCommentMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          Publicar
        </Button>
      </form>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No hay comentarios aún. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-[#c9a84c]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium text-sm">
                      {comment.user_name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {moment(comment.created_date).fromNow()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}