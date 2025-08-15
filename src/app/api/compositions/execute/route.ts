import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { collectAgentExecutionMetric } from '@/lib/metrics-middleware';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { compositionId, input } = await request.json();

    if (!compositionId || !input) {
      return NextResponse.json(
        { error: 'Composition ID e input são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar a composição com seus agentes
    const composition = await db.composition.findUnique({
      where: { id: compositionId },
      include: {
        agents: true,
        workspace: true
      }
    });

    if (!composition) {
      return NextResponse.json(
        { error: 'Composição não encontrada' },
        { status: 404 }
      );
    }

    if (composition.status !== 'active') {
      return NextResponse.json(
        { error: 'Composição não está ativa' },
        { status: 400 }
      );
    }

    if (composition.agents.length === 0) {
      return NextResponse.json(
        { error: 'Composição não possui agentes' },
        { status: 400 }
      );
    }

    // Inicializar ZAI SDK
    const zai = await ZAI.create();

    // Executar cada agente na composição
    const results = [];
    const executionStartTime = Date.now();
    
    for (const agent of composition.agents) {
      const agentStartTime = Date.now();
      
      try {
        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: `Você é um agente especializado chamado ${agent.name}. ${agent.description || ''}`
            },
            {
              role: 'user',
              content: input
            }
          ],
          model: 'glm-4.5-flash',
          temperature: 0.7,
          max_tokens: 1000
        });

        const agentEndTime = Date.now();
        const agentExecutionTime = agentEndTime - agentStartTime;
        
        const result = {
          agentId: agent.id,
          agentName: agent.name,
          result: completion.choices[0]?.message?.content || 'Sem resposta',
          executionTime: agentExecutionTime
        };
        
        results.push(result);

        // Coletar métricas para este agente
        await collectAgentExecutionMetric({
          agentId: agent.id,
          executionTime: agentExecutionTime,
          success: true,
          inputLength: input.length,
          outputLength: result.result.length
        });

      } catch (error) {
        const agentEndTime = Date.now();
        const agentExecutionTime = agentEndTime - agentStartTime;
        
        console.error(`Erro ao executar agente ${agent.name}:`, error);
        
        const errorResult = {
          agentId: agent.id,
          agentName: agent.name,
          error: error.message || 'Erro ao executar agente',
          executionTime: agentExecutionTime
        };
        
        results.push(errorResult);

        // Coletar métricas de erro para este agente
        await collectAgentExecutionMetric({
          agentId: agent.id,
          executionTime: agentExecutionTime,
          success: false,
          inputLength: input.length,
          error: error.message
        });
      }
    }

    const totalExecutionTime = Date.now() - executionStartTime;

    // Criar registro de execução
    await db.execution.create({
      data: {
        compositionId: composition.id,
        input,
        results: JSON.stringify(results),
        status: 'completed'
      }
    });

    // Coletar métricas para a composição como um todo
    for (const agent of composition.agents) {
      await collectAgentExecutionMetric({
        agentId: agent.id,
        executionTime: totalExecutionTime / composition.agents.length, // média por agente
        success: true,
        inputLength: input.length,
        outputLength: JSON.stringify(results).length,
        tags: {
          compositionId: composition.id,
          compositionName: composition.name,
          agentCount: composition.agents.length
        }
      });
    }

    return NextResponse.json({
      compositionId,
      input,
      results,
      totalExecutionTime,
      executedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao executar composição:', error);
    return NextResponse.json(
      { error: 'Erro ao executar composição' },
      { status: 500 }
    );
  }
}