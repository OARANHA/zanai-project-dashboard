'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Play, Archive, Clock, Settings, Zap, Filter, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ElegantCard from '@/components/ui/ElegantCard';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  config: string;
  knowledge?: string;
  status: 'active' | 'inactive' | 'training';
  workspaceId: string;
  workspace?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Composition {
  id: string;
  name: string;
  description: string;
  agents: string[];
  status: 'active' | 'inactive';
  workspaceId: string;
  createdAt: string;
  lastExecuted?: string;
  executionCount?: number;
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function CompositionsPage() {
  const pathname = usePathname();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [isCreateCompositionOpen, setIsCreateCompositionOpen] = useState(false);
  const [newComposition, setNewComposition] = useState({
    name: '',
    description: '',
    agents: [] as string[]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created' | 'lastExecuted'>('created');
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
    loadAgents();
    loadCompositions();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        if (data.length > 0) {
          setSelectedWorkspace(data[0].id);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        // The API returns { agents: [...] } so we need to extract the agents array
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      // Set empty array on error to prevent filter errors
      setAgents([]);
    }
  };

  const loadCompositions = async () => {
    try {
      const response = await fetch('/api/compositions');
      if (response.ok) {
        const data = await response.json();
        setCompositions(data);
      }
    } catch (error) {
      console.error('Erro ao carregar composições:', error);
    }
  };

  const createComposition = async () => {
    if (!newComposition.name || !selectedWorkspace) return;

    try {
      const response = await fetch('/api/compositions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newComposition,
          workspaceId: selectedWorkspace,
        }),
      });

      if (response.ok) {
        await loadCompositions();
        setIsCreateCompositionOpen(false);
        setNewComposition({
          name: '',
          description: '',
          agents: []
        });
      }
    } catch (error) {
      console.error('Erro ao criar composição:', error);
    }
  };

  const executeComposition = async (composition: Composition) => {
    setIsExecuting(composition.id);
    try {
      const response = await fetch('/api/compositions/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compositionId: composition.id,
          input: 'Executar composição'
        }),
      });

      const result = await response.json();
      console.log('Resultado da composição:', result);
      
      // Update composition with execution info
      setCompositions(prev => prev.map(c => 
        c.id === composition.id 
          ? { 
              ...c, 
              lastExecuted: new Date().toISOString(),
              executionCount: (c.executionCount || 0) + 1
            }
          : c
      ));
    } catch (error) {
      console.error('Erro ao executar composição:', error);
    } finally {
      setIsExecuting(null);
    }
  };

  const toggleArchiveComposition = async (composition: Composition) => {
    try {
      const response = await fetch('/api/compositions/' + composition.id + '/archive', {
        method: 'PATCH',
      });

      if (response.ok) {
        await loadCompositions();
      }
    } catch (error) {
      console.error('Erro ao arquivar/desarquivar composição:', error);
    }
  };

  // Filter and sort compositions
  const filteredCompositions = compositions
    .filter(composition => {
      const matchesSearch = composition.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           composition.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || composition.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastExecuted':
          if (!a.lastExecuted && !b.lastExecuted) return 0;
          if (!a.lastExecuted) return 1;
          if (!b.lastExecuted) return -1;
          return new Date(b.lastExecuted).getTime() - new Date(a.lastExecuted).getTime();
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <MainLayout currentPath={pathname}>
      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ElegantCard
            title="Total Composições"
            description="Fluxos criados"
            icon={Users}
            iconColor="text-blue-600"
            bgColor="bg-blue-100 dark:bg-blue-900/20"
            value={compositions.length}
            badge={compositions.length > 0 ? "Configuradas" : undefined}
            badgeColor="bg-blue-50 text-blue-700 border-blue-200"
          />
          
          <ElegantCard
            title="Composições Ativas"
            description="Em operação"
            icon={Zap}
            iconColor="text-green-600"
            bgColor="bg-green-100 dark:bg-green-900/20"
            value={compositions.filter(c => c.status === 'active').length}
            badge={compositions.length > 0 ? `${Math.round((compositions.filter(c => c.status === 'active').length / compositions.length) * 100)}% ativas` : undefined}
            badgeColor="bg-green-50 text-green-700 border-green-200"
          />
          
          <ElegantCard
            title="Execuções Totais"
            description="Processamentos realizados"
            icon={Play}
            iconColor="text-purple-600"
            bgColor="bg-purple-100 dark:bg-purple-900/20"
            value={compositions.reduce((sum, c) => sum + (c.executionCount || 0), 0)}
            badge="Histórico completo"
            badgeColor="bg-purple-50 text-purple-700 border-purple-200"
          />
          
          <ElegantCard
            title="Agentes Disponíveis"
            description="Para composição"
            icon={Settings}
            iconColor="text-orange-600"
            bgColor="bg-orange-100 dark:bg-orange-900/20"
            value={Array.isArray(agents) ? agents.filter(agent => agent.status === 'active').length : 0}
            badge={Array.isArray(agents) && agents.length > 0 ? "Prontos para uso" : undefined}
            badgeColor="bg-orange-50 text-orange-700 border-orange-200"
          />
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Composição de Agentes</h1>
            <p className="text-lg text-muted-foreground">
              Combine múltiplos agentes para criar fluxos de trabalho complexos
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione um workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isCreateCompositionOpen} onOpenChange={setIsCreateCompositionOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Composição
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Composição</DialogTitle>
                  <DialogDescription>
                    Combine múltiplos agentes para criar fluxos de trabalho complexos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={newComposition.name}
                      onChange={(e) => setNewComposition({ ...newComposition, name: e.target.value })}
                      placeholder="Nome da composição"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={newComposition.description}
                      onChange={(e) => setNewComposition({ ...newComposition, description: e.target.value })}
                      placeholder="Descrição da composição"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Agentes Disponíveis</label>
                    <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                      {Array.isArray(agents) && agents.filter(agent => agent.status === 'active').map((agent) => (
                        <div key={agent.id} className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50">
                          <input
                            type="checkbox"
                            id={'agent-' + agent.id}
                            checked={newComposition.agents.includes(agent.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewComposition({
                                  ...newComposition,
                                  agents: [...newComposition.agents, agent.id]
                                });
                              } else {
                                setNewComposition({
                                  ...newComposition,
                                  agents: newComposition.agents.filter(id => id !== agent.id)
                                });
                              }
                            }}
                          />
                          <label htmlFor={'agent-' + agent.id} className="text-sm cursor-pointer flex-1">
                            <div className="font-medium">{agent.name}</div>
                            <div className="text-muted-foreground text-xs">{agent.description}</div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button onClick={createComposition} className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Criar Composição
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar composições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="inactive">Inativas</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: 'name' | 'created' | 'lastExecuted') => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="created">Data Criação</SelectItem>
                <SelectItem value="lastExecuted">Última Execução</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompositions.map((composition) => (
            <ElegantCard
              key={composition.id}
              title={composition.name}
              description={composition.description}
              icon={Users}
              iconColor={composition.status === 'active' ? 'text-green-600' : 'text-gray-600'}
              bgColor={composition.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 'bg-gray-100 dark:bg-gray-900/20'}
              badge={composition.status === 'active' ? 'Ativa' : 'Inativa'}
              badgeColor={composition.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Agentes na composição:</p>
                  <div className="flex flex-wrap gap-1">
                    {composition.agents.map((agentId) => {
                      const agent = agents.find(a => a.id === agentId);
                      return agent ? (
                        <Badge key={agentId} variant="outline" className="text-xs">
                          {agent.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                
                {/* Execution Stats */}
                <div className="text-xs text-muted-foreground space-y-1">
                  {composition.executionCount && composition.executionCount > 0 && (
                    <div className="flex items-center space-x-1">
                      <Play className="w-3 h-3" />
                      <span>{composition.executionCount} execuções</span>
                    </div>
                  )}
                  {composition.lastExecuted && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Executada {new Date(composition.lastExecuted).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => executeComposition(composition)}
                    disabled={isExecuting === composition.id}
                  >
                    {isExecuting === composition.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-1" />
                    )}
                    Executar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => toggleArchiveComposition(composition)}
                    title={composition.status === 'active' ? "Arquivar composição" : "Ativar composição"}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </ElegantCard>
          ))}
        </div>

        {filteredCompositions.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {compositions.length === 0 ? "Nenhuma composição encontrada" : "Nenhuma composição corresponde aos filtros"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {compositions.length === 0 
                ? "Crie sua primeira composição combinando múltiplos agentes para fluxos de trabalho complexos."
                : "Tente ajustar seus filtros para encontrar composições."
              }
            </p>
            {compositions.length === 0 && (
              <Dialog open={isCreateCompositionOpen} onOpenChange={setIsCreateCompositionOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Criar Primeira Composição
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}