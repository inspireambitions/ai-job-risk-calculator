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
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
      return message.content[0].text;
    } catch (error) {
      lastError = error;
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
        { error: 'Job title and tasks are required' },
        { status: 400 }
      );
    }

    const prompt = buildAnalysisPrompt(jobTitle, industry, experience, tasks, workEnvironment, country);

    const responseText = await callClaudeWithRetry(prompt);
    const analysis = parseAnalysis(responseText);

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error.message },
      { status: 500 }
    );
  }
}


function buildAnalysisPrompt(jobTitle, industry, experience, tasks, workEnvironment, country) {
  return `You are an expert workforce analyst specialising in AI automation impact assessment. You draw on published research from the World Economic Forum Future of Jobs Report 2025, Goldman Sachs ("The Potentially Large Effects of AI on Economic Growth", 2023), McKinsey Global Institute ("A New Future of Work", 2023-2025), and Oxford University's Frey & Osborne automation probability studies.

Analyse the following job profile and provide a detailed, personalised AI displacement risk assessment.

JOB PROFILE:
- Job Title: ${jobTitle}
- Industry: ${industry || 'Not specified'}
- Experience Level: ${experience || 'Not specified'}
- Work Environment: ${workEnvironment || 'Not specified'}
- Country/Region: ${country || 'Not specified'}
- Core Daily Tasks:
${tasks.map((t, i) => `  ${i + 1}. ${t}`).join('\n')}

INSTRUCTIONS: Analyse each task individually for AI automation potential. Consider:
1. Current AI capabilities (as of 2025-2026)
2. The specific industry context and regional labour market dynamics
3. Regulatory and trust barriers in their country/region
4. Physical vs cognitive nature of each task
5. Human relationship and judgement requirements
6. Published automation probability data for similar occupations

You MUST respond in EXACTLY this JSON format (no markdown, no code blocks, just raw JSON):
{
  "overallRiskScore": <number 0-100>,
  "protectionScore": <number 0-100, how protected this person is based on their human-centric, creative, strategic, or physical tasks that AI cannot replicate>,
  "riskLevel": "<LOW|MEDIUM|HIGH|VERY HIGH>",
  "displacementYear": <number, the estimated year by which AI could automate 50% or more of this person's current tasks, e.g. 2029, 2032, 2040. Base this on realistic AI capability timelines, not hype>,
  "summary": "<2-3 sentence personalised summary of their situation>",
  "taskAnalysis": [
    {
      "task": "<task name>",
      "riskScore": <0-100>,
      "timelineYears": <1-20>,
      "reasoning": "<specific reasoning>",
      "automationBarriers": ["<barrier1>", "<barrier2>"]
    }
  ],
  "timeline": {
    "immediateRisk": "<roles/tasks at risk within 2 years>",
    "mediumTermRisk": "<3-5 year outlook>",
    "longTermRisk": "<5-10 year outlook>"
  },
  "skillsToBuilt": ["<skill1>", "<skill2>", "<skill3>", "<skill4>", "<skill5>"],
  "careerPivots": [
    {
      "role": "<pivot role>",
      "reason": "<why this is a good pivot>"
    }
  ],
  "keyInsight": "<One powerful, memorable insight about their specific situation>",
  "researchContext": [
    {
      "source": "<e.g. World Economic Forum, 2025>",
      "finding": "<One sentence summarising a relevant finding from this source that applies to this person's role>"
    },
    {
      "source": "<e.g. Goldman Sachs, 2023>",
      "finding": "<One sentence relevant finding>"
    },
    {
      "source": "<e.g. McKinsey Global Institute, 2024>",
      "finding": "<One sentence relevant finding>"
    }
  ]
}

RULES:
- Be specific to THIS person's tasks, not generic. Ground every assessment in what AI can actually do today and what is on the near horizon.
- Do not sugarcoat but do not fearmonger. Be precise and evidence-based.
- The protectionScore measures how much of their work requires uniquely human capabilities (empathy, physical presence, creative judgement, complex negotiation, ethical reasoning). A high protectionScore means they have strong natural defences against AI displacement.
- The displacementYear must be realistic. For roles heavy in routine cognitive tasks, it could be 2027-2030. For highly protected roles, it could be 2035-2045+. Do not default to a single year for all roles.
- researchContext must cite real published research. Do not fabricate citations. Use findings you actually know from WEF, Goldman Sachs, McKinsey, Oxford, Gartner, or OECD reports.
- Do NOT include any URLs, links, or website addresses in your response. No blog links, no article links, no resource links. Only return the raw JSON data as specified above.`;
}


function parseAnalysis(responseText) {
  try {
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (e) {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        return {
          overallRiskScore: 50,
          protectionScore: 50,
          riskLevel: "MEDIUM",
          displacementYear: 2032,
          summary: "Analysis completed but formatting was imperfect. The AI assessment suggests moderate automation risk for this role.",
          taskAnalysis: [],
          timeline: {
            immediateRisk: "Unable to determine",
            mediumTermRisk: "Unable to determine",
            longTermRisk: "Unable to determine"
          },
          skillsToBuilt: ["AI tool proficiency", "Critical thinking", "Emotional intelligence", "Strategic planning", "Adaptability"],
          careerPivots: [],
          keyInsight: responseText.substring(0, 200),
          researchContext: [],
          rawResponse: responseText
        };
      }
    }
    return {
      overallRiskScore: 50,
      protectionScore: 50,
      riskLevel: "MEDIUM",
      displacementYear: 2032,
      summary: "Analysis completed but could not be parsed. Please try again.",
      taskAnalysis: [],
      timeline: {
        immediateRisk: "Unable to determine",
        mediumTermRisk: "Unable to determine",
        longTermRisk: "Unable to determine"
      },
      skillsToBuilt: ["AI tool proficiency", "Critical thinking", "Emotional intelligence", "Strategic planning", "Adaptability"],
      careerPivots: [],
      keyInsight: "Analysis unavailable",
      researchContext: [],
      rawResponse: responseText
    };
  }
}
