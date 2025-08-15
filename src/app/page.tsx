'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BookOpen, Brain, Building, Loader2, Plus, Shield, Sparkles, Target, TrendingUp, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
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

interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface SpecialistCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SpecialistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  skills: string[];
  useCases: string[];
  created: string;
}

interface Composition {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  agents?: any[];
}

export default function Home() {
  const [pathname, setPathname] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [specialists, setSpecialists] = useState<SpecialistTemplate[]>([]);
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Garantir que o código só execute no cliente
  useEffect(() => {
    setIsClient(true);
    // Only get pathname on client side
    setPathname(window.location.pathname);
  }, []);

  // Só carregar dados se estiver no cliente
  useEffect(() => {
    if (isClient) {
      loadData();
    }
  }, [isClient]);

  // Remover logs de debug em produção
  // useEffect(() => {
  //   if (isClient) {
  //     console.log('Component state:', {
  //       agents: agents.length,
  //       workspaces: workspaces.length,
  //       specialists: specialists.length,
  //       compositions: compositions.length,
  //       loading,
  //       error
  //     });
  //   }
  // }, [agents, workspaces, specialists, compositions, loading, error, isClient]);

  // Funções de carregamento de dados
  const loadWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        setWorkspaces(data);
        return data;
      } else {
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar workspaces:', error);
      // Fallback para dados de teste
      const fallbackData = [{
        id: 'test-workspace',
        name: 'Workspace Principal',
        description: 'Ambiente de trabalho principal',
        createdAt: new Date().toISOString()
      }];
      setWorkspaces(fallbackData);
      return fallbackData;
    }
  };

  const loadAgents = async () => {
    try {
      const response = await fetch('/api/agents');
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
        return data.agents || [];
      } else {
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar agentes:', error);
      // Fallback para dados de teste
      const fallbackData = [{
        id: 'test-agent',
        name: 'Agente de Teste',
        description: 'Agente para demonstração',
        type: 'template' as const,
        config: '',
        status: 'active' as const,
        workspaceId: 'test-workspace',
        createdAt: new Date().toISOString()
      }];
      setAgents(fallbackData);
      return fallbackData;
    }
  };

  const loadCompositions = async () => {
    try {
      const response = await fetch('/api/compositions');
      if (response.ok) {
        const data = await response.json();
        // Mapear os dados para o formato esperado
        const mappedCompositions = (data.compositions || data).map((comp: any) => ({
          id: comp.id,
          name: comp.name,
          description: comp.description,
          status: comp.status,
          createdAt: comp.createdAt,
          updatedAt: comp.updatedAt,
          workspaceId: comp.workspaceId,
          agents: comp.agents || []
        }));
        setCompositions(mappedCompositions);
        return mappedCompositions;
      } else {
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar composições:', error);
      // Fallback para dados de teste
      const fallbackData = [{
        id: 'test-comp-1',
        name: 'Pipeline de Desenvolvimento',
        description: 'Fluxo completo para análise e desenvolvimento',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        workspaceId: 'test-workspace',
        agents: []
      }];
      setCompositions(fallbackData);
      return fallbackData;
    }
  };

  const loadSpecialists = async () => {
    try {
      const response = await fetch('/api/specialists');
      if (response.ok) {
        const data = await response.json();
        setSpecialists(data.templates || []);
        return data.templates || [];
      } else {
        throw new Error(`API response: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao carregar especialistas:', error);
      // Fallback para dados de teste
      const fallbackData = [
        {
          id: 'test-1',
          name: 'Business Analyst',
          description: 'Especialista em análise de negócios',
          category: 'business',
          skills: ['Análise de Dados', 'Gestão de Projetos', 'Consultoria'],
          useCases: ['Planejamento Estratégico', 'Análise de Mercado', 'Otimização de Processos'],
          created: new Date().toISOString()
        },
        {
          id: 'test-2',
          name: 'Technical Specialist',
          description: 'Especialista em integrações técnicas',
          category: 'technical',
          skills: ['API Integration', 'Security', 'Risk Management'],
          useCases: ['Payment Integration', 'Security Audits', 'System Architecture'],
          created: new Date().toISOString()
        }
      ];
      setSpecialists(fallbackData);
      return fallbackData;
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Carregar todos os dados em paralelo
      const [workspacesData, agentsData, specialistsData, compositionsData] = await Promise.all([
        loadWorkspaces(),
        loadAgents(),
        loadSpecialists(),
        loadCompositions()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Remover logs de debug em produção
  // useEffect(() => {
  //   if (isClient) {
  //     console.log('Data updated:', {
  //       agents: agents.length,
  //       workspaces: workspaces.length,
  //       specialists: specialists.length,
  //       compositions: compositions.length
  //     });
  //     console.log('Actual data:', {
  //       agents,
  //       workspaces,
  //       specialists,
  //       compositions
  //     });
  //   }
  // }, [agents, workspaces, specialists, compositions, isClient]);

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
      case 'template': return 'bg-blue-100 text-blue-800';
      case 'custom': return 'bg-purple-100 text-purple-800';
      case 'composed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompositionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeAgents = Array.isArray(agents) ? agents.filter(agent => agent.status === 'active').length : 0;
  const totalAgents = Array.isArray(agents) ? agents.length : 0;
  const activeCompositions = Array.isArray(compositions) ? compositions.filter(comp => comp.status === 'active').length : 0;
  const totalCompositions = Array.isArray(compositions) ? compositions.length : 0;

  // Remover logs de debug em produção
  // console.log('Calculated values:', {
  //   activeAgents,
  //   totalAgents,
  //   activeCompositions,
  //   totalCompositions
  // });

  // Loading state component
  const LoadingCard = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );

  // Error state component
  const ErrorState = () => (
    <div className="text-center py-12">
      <div className="text-red-500 mb-4">
        <Shield className="w-12 h-12 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Erro ao Carregar Dados</h3>
      <p className="text-muted-foreground mb-4">{error}</p>
      <Button onClick={loadData} variant="outline">
        <Loader2 className="w-4 h-4 mr-2" />
        Tentar Novamente
      </Button>
    </div>
  );

  return (
    <MainLayout currentPath={pathname}>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo ao Zanai Project
          </h2>
          <p className="text-lg text-muted-foreground">
            Gerencie seus agentes de IA, especialistas e composições em um único lugar
          </p>
        </div>

        {/* Stats Overview */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800 shadow-md">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <ErrorState />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ElegantCard
              title="Total de Agentes"
              description="Agentes cadastrados"
              icon={Brain}
              iconColor="text-blue-600"
              bgColor="bg-blue-100 dark:bg-blue-900/20"
              value={totalAgents}
              badge={totalAgents > 0 ? `${activeAgents} ativos` : undefined}
              badgeColor="bg-green-50 text-green-700 border-green-200"
            />
            
            <ElegantCard
              title="Agentes Ativos"
              description="Em operação"
              icon={Activity}
              iconColor="text-green-600"
              bgColor="bg-green-100 dark:bg-green-900/20"
              value={activeAgents}
              badge={totalAgents > 0 ? `${Math.round((activeAgents / totalAgents) * 100)}% eficiência` : undefined}
              badgeColor="bg-blue-50 text-blue-700 border-blue-200"
            />
            
            <ElegantCard
              title="Composições"
              description="Fluxos criados"
              icon={Users}
              iconColor="text-purple-600"
              bgColor="bg-purple-100 dark:bg-purple-900/20"
              value={totalCompositions}
              badge={totalCompositions > 0 ? `${activeCompositions} ativas` : undefined}
              badgeColor="bg-green-50 text-green-700 border-green-200"
            />

            <ElegantCard
              title="Especialistas"
              description="Templates disponíveis"
              icon={Sparkles}
              iconColor="text-orange-600"
              bgColor="bg-orange-100 dark:bg-orange-900/20"
              value={specialists.length}
              badge={specialists.length > 0 ? "Prontos para uso" : undefined}
              badgeColor="bg-purple-50 text-purple-700 border-purple-200"
            />
          </div>
        )}

        {/* Main Navigation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white dark:bg-slate-800 p-1 rounded-xl shadow-lg border">
            <TabsTrigger value="overview" className="flex items-center space-x-2 data-[state=active]:bg-blue-100 dark:data-[state=active]:bg-blue-900 rounded-lg transition-all">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Visão</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2 data-[state=active]:bg-green-100 dark:data-[state=active]:bg-green-900 rounded-lg transition-all">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Agentes</span>
              <span className="sm:hidden">IA</span>
            </TabsTrigger>
            <TabsTrigger value="specialists" className="flex items-center space-x-2 data-[state=active]:bg-purple-100 dark:data-[state=active]:bg-purple-900 rounded-lg transition-all">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Especialistas</span>
              <span className="sm:hidden">Esp</span>
            </TabsTrigger>
            <TabsTrigger value="composition" className="flex items-center space-x-2 data-[state=active]:bg-orange-100 dark:data-[state=active]:bg-orange-900 rounded-lg transition-all">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Composição</span>
              <span className="sm:hidden">Comp</span>
            </TabsTrigger>
            <TabsTrigger value="studio" className="flex items-center space-x-2 data-[state=active]:bg-red-100 dark:data-[state=active]:bg-red-900 rounded-lg transition-all">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Studio</span>
              <span className="sm:hidden">Dev</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bem-vindo ao Zanai Project
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Sistema completo de gestão de agentes de IA para automação de processos, 
                geração de especialistas e composição de fluxos de trabalho complexos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/agents">
                <ElegantCard
                  title="Agentes Inteligentes"
                  description="Gerencie seus agentes de IA com configurações avançadas"
                  icon={Brain}
                  iconColor="text-blue-600"
                  bgColor="bg-blue-100 dark:bg-blue-900/20"
                  badge={`${totalAgents} agentes`}
                  badgeColor="bg-blue-50 text-blue-700 border-blue-200"
                />
              </Link>

              <Link href="/specialists">
                <ElegantCard
                  title="Gerador de Especialistas"
                  description="Crie especialistas personalizados usando IA para diversas áreas"
                  icon={Sparkles}
                  iconColor="text-purple-600"
                  bgColor="bg-purple-100 dark:bg-purple-900/20"
                  badge="IA Powered"
                  badgeColor="bg-purple-50 text-purple-700 border-purple-200"
                />
              </Link>

              <Link href="/compositions">
                <ElegantCard
                  title="Composição de Agentes"
                  description="Combine múltiplos agentes para fluxos de trabalho complexos"
                  icon={Users}
                  iconColor="text-green-600"
                  bgColor="bg-green-100 dark:bg-green-900/20"
                  badge="Workflow"
                  badgeColor="bg-green-50 text-green-700 border-green-200"
                />
              </Link>

              <Link href="/learning">
                <ElegantCard
                  title="Sistema de Aprendizado"
                  description="Acompanhe o desempenho e evolução dos seus agentes de IA"
                  icon={BookOpen}
                  iconColor="text-orange-600"
                  bgColor="bg-orange-100 dark:bg-orange-900/20"
                  badge="Analytics"
                  badgeColor="bg-orange-50 text-orange-700 border-orange-200"
                />
              </Link>

              <Link href="/studio">
                <ElegantCard
                  title="Visual Studio"
                  description="Ambiente de desenvolvimento integrado com agentes de IA"
                  icon={Target}
                  iconColor="text-red-600"
                  bgColor="bg-red-100 dark:bg-red-900/20"
                  badge="Development"
                  badgeColor="bg-red-50 text-red-700 border-red-200"
                />
              </Link>

              <ElegantCard
                title="Workspaces"
                description="Ambientes de trabalho organizados para seus projetos"
                icon={Building}
                iconColor="text-indigo-600"
                bgColor="bg-indigo-100 dark:bg-indigo-900/20"
                badge={`${workspaces.length} ativos`}
                badgeColor="bg-indigo-50 text-indigo-700 border-indigo-200"
              />
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Agentes Inteligentes</h3>
              <p className="text-muted-foreground">Gerencie seus agentes de IA e suas configurações</p>
            </div>
            <div className="text-center py-12">
              <Brain className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gerenciamento de Agentes</h3>
              <p className="text-muted-foreground mb-6">
                Acesse a página completa de agentes para criar, editar e gerenciar seus agentes de IA
              </p>
              <Link href="/agents">
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  <Brain className="w-5 h-5 mr-2" />
                  Gerenciar Agentes
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Specialists Tab */}
          <TabsContent value="specialists" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Gerador de Especialistas</h3>
              <p className="text-muted-foreground">Crie especialistas personalizados usando IA</p>
            </div>
            <div className="text-center py-12">
              <Sparkles className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Especialistas IA</h3>
              <p className="text-muted-foreground mb-6">
                Gere especialistas personalizados para diversas áreas de negócio usando inteligência artificial
              </p>
              <Link href="/specialists">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Gerar Especialistas
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Composition Tab */}
          <TabsContent value="composition" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Composição de Agentes</h3>
              <p className="text-muted-foreground">Combine múltiplos agentes para fluxos complexos</p>
            </div>
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Fluxos de Trabalho</h3>
              <p className="text-muted-foreground mb-6">
                Crie composições de agentes para automatizar fluxos de trabalho complexos
              </p>
              <Link href="/compositions">
                <Button size="lg" className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  <Users className="w-5 h-5 mr-2" />
                  Criar Composições
                </Button>
              </Link>
            </div>
          </TabsContent>

          {/* Studio Tab */}
          <TabsContent value="studio" className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Visual Studio</h3>
              <p className="text-muted-foreground">Ambiente de desenvolvimento integrado</p>
            </div>
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Desenvolvimento Amplificado por IA</h3>
              <p className="text-muted-foreground mb-4">
                Ambiente de desenvolvimento integrado com assistentes de IA inteligentes
              </p>
              <Link href="/studio">
                <Button size="lg" className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                  <Target className="w-5 h-5 mr-2" />
                  Abrir Ambiente de Trabalho
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}