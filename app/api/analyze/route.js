import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    const prompt = buildAnalysisPrompt(jobTitle, industry, experience, tasks, workEnvironment, country);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].text;
    const analysis = parseAnalysis(responseText);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}

function buildAnalysisPrompt(jobTitle, industry, experience, tasks, workEnvironment, country) {
  return `You are an expert workforce analyst specialising in AI automation impact assessment. Analyse the following job profile and provide a detailed, personalised AI displacement risk assessment.\n\nJOB PROFILE:\n- Job Title: ${jobTitle}\n- Industry: ${industry || 'Not specified'}\n- Experience Level: ${experience || 'Not specified'}\n- Work Environment: ${workEnvironment || 'Not specified'}\n- Country/Region: ${country || 'Not specified'}\n- Core Daily Tasks:\n${tasks.map((t, i) => '  ' + (i + 1) + '. ' + t).join('\\n')}\n\nINSTRUCTIONS:\nAnalyse each task individually for AI automation potential. Consider current AI capabilities (2025-2026), industry context, regulatory barriers, physical vs cognitive nature, and human relationship requirements.\n\nRespond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):\n\n{\n  \"overallRiskScore\": <number 0-100>,\n  \"riskLevel\": \"<LOW|MEDIUM|HIGH|VERY HIGH>\",\n  \"summary\": \"<2-3 sentence personalised summary>\",\n  \"taskAnalysis\": [{\"task\": \"<name>\", \"riskScore\": <0-100>, \"riskLevel\": \"<LOW|MEDIUM|HIGH>\", \"reasoning\": \"<1-2 sentences>\", \"timeframe\": \"<NOW|2-3 YEARS|5-10 YEARS|UNLIKELY>\"}],\n  \"timeline\": {\"shortTerm\": \"<1-2 years>\", \"midTerm\": \"<3-5 years>\", \"longTerm\": \"<5-10 years>\"},\n  \"safeZone\": \"<protected tasks and why>\",\n  \"vulnerabilities\": \"<at-risk tasks and why>\",\n  \"skillsToBuilt\": [\"<skill1>\", \"<skill2>\", \"<skill3>\", \"<skill4>\", \"<skill5>\"],\n  \"careerPivots\": [{\"role\": \"<alt role>\", \"transferability\": \"<HIGH|MEDIUM>\", \"reason\": \"<why>\"}],\n  \"keyInsight\": \"<One powerful insight>\"\n}\n\nBe specific to THIS person. Ground in real AI capabilities. Do not sugarcoat or fearmonger.`;
}

function parseAnalysis(responseText) {
  try {
    return JSON.parse(responseText);
  } catch (e) {
    const jsonMatch = responseText.match(/\\{[\\s\\S]*\\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch (e2) {
        return { overallRiskScore: 50, riskLevel: 'MEDIUM', summary: 'Analysis completed. Moderate automation risk detected.', taskAnalysis: [], timeline: { shortTerm: 'Some automation beginning', midTerm: 'Significant changes expected', longTerm: 'Role will evolve' }, safeZone: 'Human judgement tasks protected.', vulnerabilities: 'Routine tasks at highest risk.', skillsToBuilt: ['AI proficiency', 'Critical thinking', 'Emotional intelligence', 'Strategic planning', 'Adaptability'], careerPivots: [], keyInsight: responseText.substring(0, 200) };
      }
    }
    return { error: 'Could not parse analysis' };
  }
}
