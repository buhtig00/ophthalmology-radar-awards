import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Github, GitBranch, Star, GitFork, AlertCircle, ExternalLink, Plus, Loader2, FolderGit2, Webhook, GitCommit, Activity, Copy, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AdminGitHub() {
    const [selectedRepo, setSelectedRepo] = useState("");
    const [issueTitle, setIssueTitle] = useState("");
    const [issueBody, setIssueBody] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [projectDialogOpen, setProjectDialogOpen] = useState(false);
    const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
    const [activityDialogOpen, setActivityDialogOpen] = useState(false);
    const [projectName, setProjectName] = useState("Óscars Ophthalmology Radar 2026");
    const [projectDescription, setProjectDescription] = useState("Gestión de casos y evaluaciones para los premios");
    const [webhookRepo, setWebhookRepo] = useState("");
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    const { data: reposData, isLoading } = useQuery({
        queryKey: ['github-repos'],
        queryFn: async () => {
            const { data } = await base44.functions.invoke('githubRepos', {});
            return data;
        }
    });

    const queryClient = useQueryClient();

    const createIssueMutation = useMutation({
        mutationFn: async (issueData) => {
            const { data } = await base44.functions.invoke('githubCreateIssue', issueData);
            return data;
        },
        onSuccess: (data) => {
            toast.success('Issue creado exitosamente', {
                description: `#${data.issue.number} - ${data.issue.title}`
            });
            setDialogOpen(false);
            setIssueTitle("");
            setIssueBody("");
            setSelectedRepo("");
        },
        onError: (error) => {
            toast.error('Error al crear issue', {
                description: error.message
            });
        }
    });

    const createProjectMutation = useMutation({
        mutationFn: async (projectData) => {
            const { data } = await base44.functions.invoke('githubCreateProject', projectData);
            return data;
        },
        onSuccess: (data) => {
            toast.success('Proyecto creado exitosamente', {
                description: `Proyecto "${data.project.title}" está listo`,
                action: {
                    label: "Ver en GitHub",
                    onClick: () => window.open(data.project.url, '_blank')
                }
            });
            setProjectDialogOpen(false);
            setProjectName("Óscars Ophthalmology Radar 2026");
            setProjectDescription("Gestión de casos y evaluaciones para los premios");
        },
        onError: (error) => {
            toast.error('Error al crear proyecto', {
                description: error.message
            });
        }
    });

    const registerWebhookMutation = useMutation({
        mutationFn: async ({ repo, webhook_url }) => {
            const { data } = await base44.functions.invoke('githubRegisterWebhook', { repo, webhook_url });
            return data;
        },
        onSuccess: (data) => {
            toast.success('Webhook registrado exitosamente', {
                description: 'Los cambios en GitHub se sincronizarán automáticamente'
            });
            setWebhookDialogOpen(false);
            setWebhookRepo("");
        },
        onError: (error) => {
            toast.error('Error al registrar webhook', {
                description: error.message
            });
        }
    });

    const { data: issueActivity, isLoading: activityLoading } = useQuery({
        queryKey: ['issue-activity', selectedIssue?.repo, selectedIssue?.number],
        queryFn: async () => {
            if (!selectedIssue) return null;
            const { data } = await base44.functions.invoke('githubIssueActivity', {
                repo: selectedIssue.repo,
                issue_number: selectedIssue.number
            });
            return data;
        },
        enabled: !!selectedIssue
    });

    const handleCreateIssue = () => {
        if (!selectedRepo || !issueTitle) {
            toast.error('Completa todos los campos requeridos');
            return;
        }
        createIssueMutation.mutate({
            repo: selectedRepo,
            title: issueTitle,
            body: issueBody,
            labels: ['from-awards-platform']
        });
    };

    const handleCreateProject = () => {
        if (!projectName) {
            toast.error('El nombre del proyecto es requerido');
            return;
        }
        createProjectMutation.mutate({
            name: projectName,
            description: projectDescription,
            template: 'awards'
        });
    };

    const handleRegisterWebhook = () => {
        if (!webhookRepo) {
            toast.error('Selecciona un repositorio');
            return;
        }
        const webhookUrl = `${window.location.origin}/api/functions/githubWebhook`;
        registerWebhookMutation.mutate({ repo: webhookRepo, webhook_url: webhookUrl });
    };

    const copyWebhookUrl = () => {
        const webhookUrl = `${window.location.origin}/api/functions/githubWebhook`;
        navigator.clipboard.writeText(webhookUrl);
        setCopiedWebhook(true);
        toast.success('URL copiada al portapapeles');
        setTimeout(() => setCopiedWebhook(false), 2000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[#c9a84c]" />
            </div>
        );
    }

    const repos = reposData?.repos || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Integración GitHub</h2>
                    <p className="text-gray-400 text-sm mt-1">Gestiona repositorios, webhooks y visualiza actividad de desarrollo</p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                <Webhook className="w-4 h-4 mr-2" />
                                Configurar Webhook
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#111827] border-white/10">
                            <DialogHeader>
                                <DialogTitle className="text-white">Configurar Webhook de GitHub</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Sincroniza automáticamente los cambios de GitHub con la plataforma
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                                    <p className="text-sm text-blue-400 mb-2">El webhook sincronizará:</p>
                                    <ul className="text-xs text-gray-400 space-y-1 ml-4 list-disc">
                                        <li>Estados de issues → Estados de casos</li>
                                        <li>Etiquetas de issues → Actualizaciones de casos</li>
                                        <li>Comentarios y actividad del proyecto</li>
                                    </ul>
                                </div>
                                <div>
                                    <Label className="text-white">URL del Webhook</Label>
                                    <div className="flex gap-2 mt-1">
                                        <Input
                                            value={`${window.location.origin}/api/functions/githubWebhook`}
                                            readOnly
                                            className="bg-[#1f2937] border-white/10 text-gray-400"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={copyWebhookUrl}
                                            className="border-white/20"
                                        >
                                            {copiedWebhook ? (
                                                <CheckCircle className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Esta URL recibirá los eventos de GitHub</p>
                                </div>
                                <div>
                                    <Label className="text-white">Repositorio *</Label>
                                    <select
                                        value={webhookRepo}
                                        onChange={(e) => setWebhookRepo(e.target.value)}
                                        className="w-full mt-1 bg-[#1f2937] border-white/10 rounded-lg px-3 py-2 text-white"
                                    >
                                        <option value="">Selecciona un repositorio</option>
                                        {repos.map(repo => (
                                            <option key={repo.id} value={repo.full_name}>
                                                {repo.full_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    onClick={handleRegisterWebhook}
                                    disabled={registerWebhookMutation.isPending}
                                    className="w-full bg-[#c9a84c] hover:bg-[#a07c2e] text-black"
                                >
                                    {registerWebhookMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Registrando...
                                        </>
                                    ) : (
                                        <>
                                            <Webhook className="w-4 h-4 mr-2" />
                                            Registrar Webhook
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                <FolderGit2 className="w-4 h-4 mr-2" />
                                Crear Proyecto
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#111827] border-white/10">
                            <DialogHeader>
                                <DialogTitle className="text-white">Crear Proyecto GitHub</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                    Crea un proyecto para gestionar casos y evaluaciones
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-white">Nombre del Proyecto *</Label>
                                    <Input
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="Óscars Ophthalmology Radar 2026"
                                        className="bg-[#1f2937] border-white/10 text-white"
                                    />
                                </div>
                                <div>
                                    <Label className="text-white">Descripción</Label>
                                    <Textarea
                                        value={projectDescription}
                                        onChange={(e) => setProjectDescription(e.target.value)}
                                        placeholder="Describe el propósito del proyecto..."
                                        className="bg-[#1f2937] border-white/10 text-white h-24"
                                    />
                                </div>
                                <div className="bg-[#1f2937] p-3 rounded-lg border border-white/5">
                                    <p className="text-sm text-gray-400 mb-2">El proyecto incluirá:</p>
                                    <ul className="text-xs text-gray-500 space-y-1 ml-4 list-disc">
                                        <li>Campo "Estado del Caso" (Pendiente, En Revisión, Aprobado, Rechazado, Finalista)</li>
                                        <li>Campo "Categoría" para clasificar casos</li>
                                        <li>Campo "Hospital" para tracking de instituciones</li>
                                    </ul>
                                </div>
                                <Button
                                    onClick={handleCreateProject}
                                    disabled={createProjectMutation.isPending}
                                    className="w-full bg-[#c9a84c] hover:bg-[#a07c2e] text-black"
                                >
                                    {createProjectMutation.isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Creando proyecto...
                                        </>
                                    ) : (
                                        <>
                                            <FolderGit2 className="w-4 h-4 mr-2" />
                                            Crear Proyecto
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#c9a84c] hover:bg-[#a07c2e] text-black">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Issue
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#111827] border-white/10">
                        <DialogHeader>
                            <DialogTitle className="text-white">Crear nuevo issue</DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Crea un issue en uno de tus repositorios
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-white">Repositorio</Label>
                                <select
                                    value={selectedRepo}
                                    onChange={(e) => setSelectedRepo(e.target.value)}
                                    className="w-full mt-1 bg-[#1f2937] border-white/10 rounded-lg px-3 py-2 text-white"
                                >
                                    <option value="">Selecciona un repositorio</option>
                                    {repos.map(repo => (
                                        <option key={repo.id} value={repo.full_name}>
                                            {repo.full_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label className="text-white">Título *</Label>
                                <Input
                                    value={issueTitle}
                                    onChange={(e) => setIssueTitle(e.target.value)}
                                    placeholder="Título del issue"
                                    className="bg-[#1f2937] border-white/10 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-white">Descripción</Label>
                                <Textarea
                                    value={issueBody}
                                    onChange={(e) => setIssueBody(e.target.value)}
                                    placeholder="Describe el problema o tarea..."
                                    className="bg-[#1f2937] border-white/10 text-white h-32"
                                />
                            </div>
                            <Button
                                onClick={handleCreateIssue}
                                disabled={createIssueMutation.isPending}
                                className="w-full bg-[#c9a84c] hover:bg-[#a07c2e] text-black"
                            >
                                {createIssueMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creando...
                                    </>
                                ) : (
                                    'Crear Issue'
                                )}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {repos.map(repo => (
                    <Card key={repo.id} className="bg-[#111827] border-white/10 hover:border-[#c9a84c]/50 transition-all">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <Github className="w-5 h-5 text-[#c9a84c]" />
                                    <CardTitle className="text-white text-base">{repo.name}</CardTitle>
                                </div>
                                {repo.private && (
                                    <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                        Privado
                                    </Badge>
                                )}
                            </div>
                            {repo.description && (
                                <CardDescription className="text-gray-400 text-sm line-clamp-2">
                                    {repo.description}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                                {repo.language && (
                                    <div className="flex items-center gap-1">
                                        <GitBranch className="w-3 h-3" />
                                        {repo.language}
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    {repo.stargazers_count}
                                </div>
                                <div className="flex items-center gap-1">
                                    <GitFork className="w-3 h-3" />
                                    {repo.forks_count}
                                </div>
                            </div>
                            {repo.open_issues_count > 0 && (
                                <div className="flex items-center gap-1 text-sm text-orange-400">
                                    <AlertCircle className="w-3 h-3" />
                                    {repo.open_issues_count} issues abiertos
                                </div>
                            )}
                            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                                <a
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#c9a84c] hover:text-[#e8d48b] flex items-center gap-1"
                                >
                                    Ver en GitHub
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                                {repo.open_issues_count > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedIssue({ repo: repo.full_name, number: null });
                                            setActivityDialogOpen(true);
                                        }}
                                        className="text-xs text-gray-400 hover:text-white"
                                    >
                                        <Activity className="w-3 h-3 mr-1" />
                                        Ver Issues
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {repos.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <Github className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>No se encontraron repositorios</p>
                </div>
            )}

            {/* Issue Activity Dialog */}
            <Dialog open={activityDialogOpen} onOpenChange={setActivityDialogOpen}>
                <DialogContent className="bg-[#111827] border-white/10 max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">Actividad del Issue</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Commits, branches y eventos relacionados
                        </DialogDescription>
                    </DialogHeader>
                    {activityLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-6 h-6 text-[#c9a84c] animate-spin" />
                        </div>
                    ) : issueActivity ? (
                        <div className="space-y-6">
                            {/* Issue Info */}
                            <Card className="bg-white/5 border-white/10">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                                    #{issueActivity.issue.number}
                                                </Badge>
                                                <Badge className={issueActivity.issue.state === 'open' ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'}>
                                                    {issueActivity.issue.state}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-white">{issueActivity.issue.title}</CardTitle>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {issueActivity.issue.labels.map(label => (
                                                    <Badge key={label} variant="outline" className="text-xs border-white/20 text-gray-400">
                                                        {label}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <a
                                            href={issueActivity.issue.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#c9a84c] hover:text-[#e8d48b]"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </CardHeader>
                            </Card>

                            <Tabs defaultValue="commits" className="w-full">
                                <TabsList className="bg-white/5 border border-white/10">
                                    <TabsTrigger value="commits">Commits ({issueActivity.commits.length})</TabsTrigger>
                                    <TabsTrigger value="branches">Branches ({issueActivity.branches.length})</TabsTrigger>
                                    <TabsTrigger value="events">Eventos ({issueActivity.events.length})</TabsTrigger>
                                </TabsList>

                                <TabsContent value="commits" className="space-y-3 mt-4">
                                    {issueActivity.commits.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-6">No hay commits relacionados</p>
                                    ) : (
                                        issueActivity.commits.map((commit, idx) => (
                                            <Card key={idx} className="bg-white/5 border-white/10">
                                                <CardContent className="pt-4">
                                                    <div className="flex items-start gap-3">
                                                        <GitCommit className="w-4 h-4 text-[#c9a84c] mt-1" />
                                                        <div className="flex-1">
                                                            <p className="text-white text-sm font-medium">{commit.message}</p>
                                                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                                <span>{commit.author}</span>
                                                                <span>•</span>
                                                                <span>{commit.date ? format(new Date(commit.date), 'dd/MM/yyyy HH:mm') : ''}</span>
                                                                <span>•</span>
                                                                <code className="text-[#c9a84c]">{commit.sha?.substring(0, 7)}</code>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>

                                <TabsContent value="branches" className="space-y-3 mt-4">
                                    {issueActivity.branches.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-6">No se encontraron referencias a branches</p>
                                    ) : (
                                        issueActivity.branches.map((branch, idx) => (
                                            <Card key={idx} className="bg-white/5 border-white/10">
                                                <CardContent className="pt-4">
                                                    <div className="flex items-center gap-3">
                                                        <GitBranch className="w-4 h-4 text-green-400" />
                                                        <code className="text-white text-sm">{branch}</code>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>

                                <TabsContent value="events" className="space-y-3 mt-4">
                                    {issueActivity.events.length === 0 ? (
                                        <p className="text-gray-400 text-sm text-center py-6">No hay eventos recientes</p>
                                    ) : (
                                        issueActivity.events.map((event, idx) => (
                                            <Card key={idx} className="bg-white/5 border-white/10">
                                                <CardContent className="pt-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Activity className="w-4 h-4 text-blue-400" />
                                                            <span className="text-white text-sm">{event.type}</span>
                                                            {event.label && (
                                                                <Badge variant="outline" className="text-xs border-white/20">
                                                                    {event.label}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {event.actor} • {format(new Date(event.created_at), 'dd/MM/yyyy HH:mm')}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <p className="text-gray-400 text-center py-6">Selecciona un issue para ver su actividad</p>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}