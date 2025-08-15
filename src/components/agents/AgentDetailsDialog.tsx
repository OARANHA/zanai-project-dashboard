'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Settings, Play, FileText, Code, Download, Eye, EyeOff, Loader2 } from 'lucide-react';
import AgentExecutionDialog from './AgentExecutionDialog';
import EditAgentDialog from './EditAgentDialog';

interface Agent {
  id: string;
  name: string;
  description: string;
  type: 'template' | 'custom' | 'composed';
  status: 'active' | 'inactive' | 'training';
  config: string;
  knowledge?: string;
  createdAt: string;
  workspace?: {
    id: string;
    name: string;
  };
}

interface AgentDetailsDialogProps {
  agent: Agent;
  children: React.ReactNode;
}

export default function AgentDetailsDialog({ agent, children }: AgentDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExecuteOpen, setIsExecuteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'yaml' | 'markdown'>('json');
  const [exportContent, setExportContent] = useState('');

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

  const formatConfig = (config: string) => {
    if (!config || config.trim() === '') {
      return 'Nenhuma configuração definida';
    }
    return config;
  };

  // Load execution history
  const loadExecutionHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/executions?agentId=${agent.id}`);
      if (response.ok) {
        const data = await response.json();
        setExecutionHistory(data);
      }
    } catch (error) {
      console.error('Error loading execution history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Generate export content based on format
  const generateExportContent = () => {
    const agentData = {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      type: agent.type,
      status: agent.status,
      config: agent.config,
      knowledge: agent.knowledge,
      workspace: agent.workspace,
      createdAt: agent.createdAt,
      exportedAt: new Date().toISOString()
    };

    switch (exportFormat) {
      case 'json':
        setExportContent(JSON.stringify(agentData, null, 2));
        break;
      case 'yaml':
        // Simple YAML conversion
        setExportContent(`name: ${agentData.name}
description: ${agentData.description}
type: ${agentData.type}
status: ${agentData.status}
config: |
  ${agentData.config || 'N/A'}
${agentData.knowledge ? `knowledge: |\n  ${agentData.knowledge}` : ''}
workspace: ${agentData.workspace?.name || 'N/A'}
created_at: ${agentData.createdAt}
exported_at: ${agentData.exportedAt}`);
        break;
      case 'markdown':
        setExportContent(`# ${agent.name}

## Descrição
${agent.description}

## Tipo
${agent.type}

## Status
${agent.status}

## Configuração
\`\`\`yaml
${agentData.config || 'N/A'}
\`\`\`

${agentData.knowledge ? `## Base de Conhecimento
\`\`\`markdown
${agentData.knowledge}
\`\`\`
` : ''}

## Workspace
${agentData.workspace?.name || 'N/A'}

## Metadados
- **Criado em:** ${new Date(agentData.createdAt).toLocaleDateString()}
- **Exportado em:** ${new Date(agentData.exportedAt).toLocaleDateString()}
`);
        break;
    }
  };

  // Download exported content
  const downloadExport = () => {
    if (!exportContent) return;
    
    const blob = new Blob([exportContent], { 
      type: exportFormat === 'json' ? 'application/json' : 'text/plain' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${agent.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${exportFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle export dialog open
  const handleExportOpen = () => {
    generateExportContent();
    setIsExportOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{agent.name}</DialogTitle>
              <DialogDescription className="mt-2">
                {agent.description}
              </DialogDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
              <Badge className={getTypeColor(agent.type)}>
                {agent.type}
              </Badge>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="knowledge">Conhecimento</TabsTrigger>
            <TabsTrigger value="actions">Ações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Status</h4>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                  <span className="capitalize">{agent.status}</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Tipo</h4>
                <Badge className={getTypeColor(agent.type)}>
                  {agent.type}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Workspace</h4>
                <p>{agent.workspace?.name || 'N/A'}</p>
              </div>
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">Criado em</h4>
                <p>{new Date(agent.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="config" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Configuração YAML</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/50">
                <pre className="text-sm whitespace-pre-wrap">
                  {formatConfig(agent.config)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="knowledge" className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Base de Conhecimento</h4>
              <ScrollArea className="h-64 w-full border rounded-md p-4 bg-muted/50">
                {agent.knowledge ? (
                  <div className="prose prose-sm max-w-none">
                    <pre className="text-sm whitespace-pre-wrap">
                      {agent.knowledge}
                    </pre>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    Nenhuma base de conhecimento definida para este agente.
                  </p>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
          
          <TabsContent value="actions" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <AgentExecutionDialog agent={agent}>
                <Button className="w-full justify-start" size="lg">
                  <Play className="w-4 h-4 mr-2" />
                  Executar Agente
                </Button>
              </AgentExecutionDialog>
              
              <EditAgentDialog agent={agent} onAgentUpdated={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  Editar Configuração
                </Button>
              </EditAgentDialog>
              
              <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" size="lg" onClick={loadExecutionHistory}>
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Histórico de Execuções
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Histórico de Execuções</DialogTitle>
                    <DialogDescription>
                      Histórico de execuções do agente {agent.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {loadingHistory ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Carregando histórico...</span>
                      </div>
                    ) : executionHistory.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma execução encontrada para este agente.</p>
                      </div>
                    ) : (
                      <ScrollArea className="h-64 w-full border rounded-md">
                        <div className="p-4 space-y-3">
                          {executionHistory.map((execution, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  Execução #{index + 1}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(execution.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <p><strong>Status:</strong> {execution.status}</p>
                                <p><strong>Input:</strong> {execution.input?.substring(0, 100)}...</p>
                                {execution.output && (
                                  <p><strong>Output:</strong> {execution.output?.substring(0, 100)}...</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start" size="lg" onClick={handleExportOpen}>
                    <Code className="w-4 h-4 mr-2" />
                    Exportar Configuração
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Exportar Configuração</DialogTitle>
                    <DialogDescription>
                      Exporte a configuração do agente {agent.name} em diferentes formatos
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="export-format">Formato de Exportação</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button
                          type="button"
                          variant={exportFormat === 'json' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setExportFormat('json')}
                        >
                          JSON
                        </Button>
                        <Button
                          type="button"
                          variant={exportFormat === 'yaml' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setExportFormat('yaml')}
                        >
                          YAML
                        </Button>
                        <Button
                          type="button"
                          variant={exportFormat === 'markdown' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setExportFormat('markdown')}
                        >
                          Markdown
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="export-content">Conteúdo Exportado</Label>
                      <ScrollArea className="h-64 w-full border rounded-md mt-2">
                        <pre className="p-4 text-sm whitespace-pre-wrap">
                          {exportContent}
                        </pre>
                      </ScrollArea>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsExportOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={downloadExport} disabled={!exportContent}>
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}