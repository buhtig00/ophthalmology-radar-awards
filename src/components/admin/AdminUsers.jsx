import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, Search, Mail, Calendar, Shield, UserCog, Loader2, Plus, X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(ROLES.USER);
  const [isInviting, setIsInviting] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: () => base44.entities.User.list("-created_date"),
  });

  const { data: cases = [] } = useQuery({
    queryKey: ["cases"],
    queryFn: () => base44.entities.Case.list(),
  });

  const { data: votes = [] } = useQuery({
    queryKey: ["votes"],
    queryFn: () => base44.entities.Vote.list(),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, role }) => base44.entities.User.update(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("Usuario actualizado");
    },
    onError: () => toast.error("Error al actualizar usuario"),
  });

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail, inviteRole);
      toast.success(`Invitación enviada a ${inviteEmail}`);
      setInviteDialogOpen(false);
      setInviteEmail("");
      setInviteRole("user");
    } catch (error) {
      toast.error("Error al enviar invitación");
    } finally {
      setIsInviting(false);
    }
  };

  const getUserStats = (userEmail) => {
    const userCases = cases.filter(c => c.created_by === userEmail);
    const userVotes = votes.filter(v => v.created_by === userEmail);
    return { cases: userCases.length, votes: userVotes.length };
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = searchQuery === "" || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-[#c9a84c]" />
          <h2 className="text-xl font-bold text-white">Usuarios</h2>
          <Badge variant="outline" className="bg-white/5 border-white/10 text-gray-400">
            {filteredUsers.length} usuarios
          </Badge>
        </div>
        <Button
          onClick={() => setInviteDialogOpen(true)}
          size="sm"
          className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Invitar usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">Usuario</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        {filteredUsers.map((user) => {
          const stats = getUserStats(user.email);
          return (
            <div
              key={user.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center flex-shrink-0">
                    <UserCog className="w-5 h-5 text-[#c9a84c]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium truncate">
                        {user.full_name || user.email}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          user.role === "admin"
                            ? "bg-[#c9a84c]/10 border-[#c9a84c]/20 text-[#c9a84c]"
                            : "bg-white/5 border-white/10 text-gray-400"
                        }
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(user.created_date), "d MMM yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="text-gray-400">
                        <span className="text-[#c9a84c] font-medium">{stats.cases}</span> casos
                      </span>
                      <span className="text-gray-400">
                        <span className="text-[#c9a84c] font-medium">{stats.votes}</span> votos
                      </span>
                    </div>
                  </div>
                </div>
                <Select
                  value={user.role}
                  onValueChange={(role) => updateUserMutation.mutate({ userId: user.id, role })}
                >
                  <SelectTrigger className="w-[120px] bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No se encontraron usuarios</p>
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="bg-[#0a0e1a] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Invitar usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-400">Email</Label>
              <Input
                type="email"
                placeholder="usuario@ejemplo.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white mt-2"
              />
            </div>
            <div>
              <Label className="text-gray-400">Rol</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">Usuario</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialogOpen(false)}
              className="border-white/10 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || isInviting}
              className="bg-[#c9a84c] hover:bg-[#a07c2e] text-[#0a0e1a]"
            >
              {isInviting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar invitación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}