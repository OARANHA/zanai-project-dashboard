'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Brain, 
  Plus, 
  Settings, 
  Play, 
  Archive, 
  Loader2, 
  Search,
  Filter,
  Sparkles,
  Zap,
  Target,
  Code,
  Users,
  Star,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Rocket
} from 'lucide-react';
import EditAgentDialog from '@/components/agents/EditAgentDialog';
import MainLayout from '@/components/layout/MainLayout';
import ElegantCard from '@/components/ui/ElegantCard';

interface Agent {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  roleDefinition: string;
  groups: any[];
  customInstructions: string;
  workspaceId: string;
  workspace?: {
    name: string;
    description: string;
  };
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function AgentsPage() {
  const pathname = usePathname();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [newAgent, setNewAgent] = useState({
    name: '',
    description: '',
    type: 'template' as const,
    config: '',
    knowledge: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadWorkspaces(), loadAgents()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkspaces = async () => {
    try {
      console.log('Carregando workspaces...');
      const response = await fetch('/api/workspaces');
      console.log('Resposta da API de workspaces:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('Dados de workspaces recebidos:', data);
        setWorkspaces(data);
        if (data.length > 0) {
          setSelectedWorkspace(data[0].id);
        }
      } else {
        console.error('Erro na resposta da API de workspaces:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error);
    }
  };

  const loadAgents = async () => {
    try {
      console.log('Carregando agentes...');
      const response = await fetch('/api/agents');
      console.log('Resposta da API:', response.status, response.statusText);
      if (response.ok) {
        const data = await response.json();
        console.log('Dados recebidos da API:', data);
        console.log('Vamos chamar setAgents com:', data.agents || []);
        setAgents(data.agents || []);
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
    }
  };

  const createAgent = async () => {
    if (!newAgent.name || !selectedWorkspace) return;

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newAgent,
          workspaceId: selectedWorkspace,
        }),
      });

      if (response.ok) {
        await loadAgents();
        setIsCreateAgentOpen(false);
        setNewAgent({
          name: '',
          description: '',
          type: 'template',
          config: '',
          knowledge: ''
        });
      }
    } catch (error) {
      console.error('Erro ao criar agente:', error);
    }
  };

  const toggleArchiveAgent = async (agent: Agent) => {
    try {
      const response = await fetch('/api/agents/' + agent.id + '/archive', {
        method: 'PATCH',
      });

      if (response.ok) {
        await loadAgents();
      }
    } catch (error) {
      console.error('Erro ao arquivar/desarquivar agente:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'training': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'template': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'custom': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'composed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'template': return Star;
      case 'custom': return Code;
      case 'composed': return Users;
      default: return Brain;
    }
  };

  const filteredAgents = Array.isArray(agents) ? agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || agent.type === filterType;
    const matchesWorkspace = !selectedWorkspace || agent.workspaceId === selectedWorkspace;
    return matchesSearch && matchesType && matchesWorkspace;
  }) : [];

  const agentStats = {
    total: Array.isArray(agents) ? agents.length : 0,
    active: Array.isArray(agents) ? agents.filter(a => a.type === 'active').length : 0,
    templates: Array.isArray(agents) ? agents.filter(a => a.type === 'template').length : 0,
    custom: Array.isArray(agents) ? agents.filter(a => a.type === 'custom').length : 0
  };

  return (
    <MainLayout currentPath={pathname}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="mb-6 lg:mb-0">
              <div className="flex items-center space-x-3 mb-2">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Agentes Inteligentes
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">
                    Gerencie seus agentes de IA com elegância e eficiência
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger className="w-full sm:w-64 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Selecione um workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{workspace.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Dialog open={isCreateAgentOpen} onOpenChange={setIsCreateAgentOpen}>
                <DialogTrigger asChild>
                  <Button className="h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg px-6 font-medium">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Agente
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl border-slate-200 dark:border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Criar Novo Agente</DialogTitle>
                    <DialogDescription className="text-base">
                      Crie um novo agente inteligente com configuração personalizada para potencializar seus projetos.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Nome do Agente</label>
                        <Input
                          value={newAgent.name}
                          onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                          placeholder="Ex: Analista de Negócios"
                          className="h-11"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Tipo</label>
                        <Select value={newAgent.type} onValueChange={(value: any) => setNewAgent({ ...newAgent, type: value })}>
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="template">
                              <div className="flex items-center space-x-2">
                                <Star className="w-4 h-4" />
                                <span>Template</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="custom">
                              <div className="flex items-center space-x-2">
                                <Code className="w-4 h-4" />
                                <span>Custom</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="composed">
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>Composed</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Descrição</label>
                      <Textarea
                        value={newAgent.description}
                        onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                        placeholder="Descreva as funcionalidades e especialidades do agente"
                        className="min-h-20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Configuração (YAML)</label>
                      <Textarea
                        value={newAgent.config}
                        onChange={(e) => setNewAgent({ ...newAgent, config: e.target.value })}
                        placeholder="role: Specialista\nexpertise:\n  - Análise de dados\n  - Machine Learning"
                        className="min-h-32 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Conhecimento (Markdown)</label>
                      <Textarea
                        value={newAgent.knowledge}
                        onChange={(e) => setNewAgent({ ...newAgent, knowledge: e.target.value })}
                        placeholder="# Base de Conhecimento\n## Especialidades\n- Análise de dados\n- Machine Learning"
                        className="min-h-32"
                      />
                    </div>
                    <Button onClick={createAgent} className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 font-medium">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Criar Agente
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <ElegantCard
              title="Total de Agentes"
              value={agentStats.total}
              description="Todos os agentes cadastrados"
              icon={Brain}
              iconColor="text-blue-600"
              bgColor="bg-blue-100 dark:bg-blue-900/20"
              badgeColor="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
            />
            <ElegantCard
              title="Templates"
              value={agentStats.templates}
              description="Agentes modelo pré-configurados"
              icon={Star}
              iconColor="text-purple-600"
              bgColor="bg-purple-100 dark:bg-purple-900/20"
              badgeColor="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
            />
            <ElegantCard
              title="Customizados"
              value={agentStats.custom}
              description="Agentes personalizados"
              icon={Code}
              iconColor="text-green-600"
              bgColor="bg-green-100 dark:bg-green-900/20"
              badgeColor="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
            />
            <ElegantCard
              title="Ativos"
              value={agentStats.active}
              description="Agentes em operação"
              icon={Zap}
              iconColor="text-orange-600"
              bgColor="bg-orange-100 dark:bg-orange-900/20"
              badgeColor="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700"
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar agentes por nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  <SelectItem value="template">Templates</SelectItem>
                  <SelectItem value="custom">Customizados</SelectItem>
                  <SelectItem value="composed">Compostos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="relative inline-block mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl animate-ping opacity-20"></div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Carregando agentes...</h3>
            <p className="text-muted-foreground">Aguarde enquanto carregamos seus agentes inteligentes.</p>
          </div>
        ) : (
          <>
            {filteredAgents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.map((agent) => {
                  const TypeIcon = getTypeIcon(agent.type);
                  return (
                    <Card key={agent.id} className="group relative overflow-hidden bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105 hover:-translate-y-1">
                      {/* Background gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                      
                      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 relative z-10">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`p-2 ${getTypeColor(agent.type)} rounded-lg`}>
                              <TypeIcon className="w-4 h-4" />
                            </div>
                            <Badge variant="outline" className={getTypeColor(agent.type)}>
                              {agent.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                            {agent.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                            {agent.description}
                          </CardDescription>
                        </div>
                        
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-muted-foreground">Ativo</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                              <Zap className="w-3 h-3 mr-1" />
                              Pronto
                            </Badge>
                          </div>
                        </div>
                        
                        {agent.workspace && (
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-4">
                            <Users className="w-3 h-3" />
                            <span>{agent.workspace.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" className="flex-1 h-9 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                            <Play className="w-4 h-4 mr-1" />
                            Executar
                          </Button>
                          <Button size="sm" variant="outline" className="h-9">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                      
                      {/* Subtle border animation */}
                      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all duration-300 pointer-events-none"></div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-2xl flex items-center justify-center">
                    <Brain className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <Search className="w-3 h-3 text-slate-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold mb-3">Nenhum agente encontrado</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchQuery || filterType !== 'all' 
                    ? 'Nenhum agente corresponde aos seus filtros. Tente ajustar sua busca ou filtros.'
                    : 'Crie seu primeiro agente inteligente para começar a transformar seus projetos com o poder da IA.'
                  }
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  {(searchQuery || filterType !== 'all') && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchQuery('');
                        setFilterType('all');
                      }}
                      className="h-11"
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  )}
                  <Dialog open={isCreateAgentOpen} onOpenChange={setIsCreateAgentOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg px-6">
                        <Plus className="w-5 h-5 mr-2" />
                        Criar Primeiro Agente
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}