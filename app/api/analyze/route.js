import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function callClaudeWithRetry(prompt, maxRetries = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return message.content[0].text;
    } catch (err) {
      lastError = err;
      console.error(`Attempt ${attempt}/${maxRetries} failed:`, err.message || err);

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobTitle, industry, experience, tasks, workEnvironment, country } = body;

    if (!jobTitle || !tasks || tasks.length === 0) {
      return NextResponse.json(
        { error: 'Job title and at least one task are required.' },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'Service configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    const prompt = buildAnalysisPrompt(jobTitle, industry, experience, tasks, workEnvironment, country);

    const responseText = await callClaudeWithRetry(prompt);

    // Parse the structured response
    const analysis = parseAnalysis(responseText);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error?.message || error);

    let userMessage = 'Our servers are busy right now. Please wait a moment and try again.';

    if (error?.status === 401 || error?.message?.includes('auth')) {
      userMessage = 'Service configuration error. Please try again later.';
    } else if (error?.status === 429 || error?.message?.includes('rate')) {
      userMessage = 'High demand right now. Please wait 30 seconds and try again.';
    } else if (error?.status === 529 || error?.message?.includes('overloaded')) {
      userMessage = 'Our AI engine is under heavy load. Please try again in a minute.';
    }

    return NextResponse.json(
      { error: userMessage, retryable: true },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(jobTitle, industry, experience, tasks, workEnvironment, country) {
  return `You are an expert workforce analyst specialising in AI automation impact assessment. Analyse the following job profile and provide a detailed, personalised AI displacement risk assessment.

JOB PROFILE:
- Job Title: ${jobTitle}
- Industry: ${industry || 'Not specified'}
- Experience Level: ${experience || 'Not specified'}
- Work Environment: ${workEnvironment || 'Not specified'}
- Country/Region: ${country || 'Not specified'}
- Core Daily Tasks:
${tasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}

INSTRUCTIONS:
Analyse each task individually for AI automation potential. Consider:
1. Current AI capabilities (as of 2025-2026)
2. The specific industry context
3. Regulatory and trust barriers
4. Physical vs cognitive nature of each task
5. Human relationship and judgement requirements

You MUST respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):

{
  "overallRiskScore": <number 0-100>,
  "riskLevel": "<LOW|MEDIUM|HIGH|VERY HIGH>",
  "summary": "<2-3 sentence personalised summary of their situation>",
  "taskAnalysis": [
    {
      "task": "<task name>",
      "riskScore": <number 0-100>,
      "riskLevel": "<LOW|MEDIUM|HIGH>",
      "reasoning": "<1-2 sentences explaining why>",
      "timeframe": "<NOW|2-3 YEARS|5-10 YEARS|UNLIKELY>"
    }
  ],
  "timeline": {
    "shortTerm": "<What changes in 1-2 years>",
    "midTerm": "<What changes in 3-5 years>",
    "longTerm": "<What changes in 5-10 years>"
  },
  "safeZone": "<Which of their tasks are most protected and why>",
  "vulnerabilities": "<Which tasks are most at risk and why>",
  "skillsToBuilt": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "careerPivots": [
    {
      "role": "<alternative role>",
      "transferability": "<HIGH|MEDIUM>",
      "reason": "<why this is a good pivot>"
    }
  ],
  "keyInsight": "<One powerful, memorable insight about their specific situation>"
}

Be specific to THIS person's tasks, not generic. Ground every assessment in what AI can actually do today and what is on the near horizon. Do not sugarcoat but do not fearmonger. Be precise and evidence-based.`;
}

function parseAnalysis(responseText) {
  try {
    // Try direct JSON parse first
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (e) {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        // Return a structured error response
        return {
          overallRiskScore: 50,
          riskLevel: "MEDIUM",
          summary: "Analysis completed but formatting was imperfect. The AI assessment suggests moderate automation risk for this role.",
          taskAnalysis: [],
          timeline: {
            shortTerm: "Some task automation beginning",
            midTerm: "Significant workflow changes expected",
            longTerm: "Role will evolve substantially"
          },
          safeZone: "Tasks requiring human judgement and relationships remain protected.",
          vulnerabilities: "Routine, repetitive tasks face highest displacement risk.",
          skillsToBuilt: ["AI tool proficiency", "Critical thinking", "Emotional intelligence", "Strategic planning", "Adaptability"],
          careerPivots: [],
          keyInsight: responseText.substring(0, 200),
          rawResponse: responseText
        };
      }
    }
    return { error: "Could not parse analysis", rawResponse: responseText };
  }
}

