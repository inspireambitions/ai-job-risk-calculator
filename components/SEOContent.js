'use client';

import { useState } from 'react';

export default function SEOContent() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mt-12 border-t border-gray-200 pt-8">
      <div className="max-w-3xl mx-auto">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How the AI Job Risk Calculator Works</h3>
        <p className="text-sm text-gray-600 mb-4">
          Most AI risk tools score your job title. That tells you nothing. Two HR Managers do completely different
          tasks depending on their company, industry, and seniority. This calculator analyses what you actually do
          each day, task by task, and measures how exposed each activity is to current and near-future AI capabilities.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          The analysis considers three factors for each task: whether AI can technically perform it today, whether
          businesses have economic incentive to automate it, and whether regulatory or social barriers slow adoption
          in your country and industry. Your overall score is a weighted average across all tasks.
        </p>

        <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">What Determines Your AI Risk Score</h3>
        <p className="text-sm text-gray-600 mb-3">
          Tasks that are rule-based, repetitive, and data-driven score highest for automation risk. Payroll
          processing, data entry, basic report generation, and scheduling are already being handled by AI systems
          in many organisations. Tasks that require emotional intelligence, complex judgement, physical presence,
          creative problem-solving, or deep cultural understanding score lowest.
        </p>
        <p className="text-sm text-gray-600 mb-4">
          Your experience level matters. Senior professionals who spend most of their time on strategy, relationship
          management, and complex decision-making face lower displacement risk than entry-level workers doing
          primarily administrative or data-processing tasks.
        </p>

        {expanded && (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">Key Statistics on AI and Jobs</h3>
            <p className="text-sm text-gray-600 mb-3">
              The World Economic Forum estimates that 23% of global jobs will change significantly by 2027 through
              AI and automation. Goldman Sachs research suggests AI could automate the equivalent of 300 million
              full-time jobs globally, with administrative and legal roles facing the highest exposure. McKinsey
              Global Institute projects that by 2030, up to 30% of hours currently worked could be automated.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Oxford University researchers found that 47% of US employment is at high risk of automation, though
              this figure has been revised downward as experts recognise that most jobs contain a mix of automatable
              and non-automatable tasks. The consensus view: AI replaces tasks within jobs, not entire jobs.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">Frequently Asked Questions</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Will AI take my job completely?</h4>
                <p className="text-sm text-gray-600">
                  For most roles, no. AI automates specific tasks within a job, not the entire position. Even
                  highly exposed roles like data entry or basic accounting still have components that require
                  human oversight. The question is not whether AI takes your job, but how much of your current
                  work it absorbs and whether you adapt to higher-value tasks.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">How accurate is this calculator?</h4>
                <p className="text-sm text-gray-600">
                  This tool provides a directional assessment based on current AI capabilities and published
                  research. It is not a prediction. AI development is not linear, regulatory environments vary,
                  and adoption rates differ by industry and region. Use your score as a starting point for
                  career planning, not as a definitive forecast.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">What should I do if my score is high?</h4>
                <p className="text-sm text-gray-600">
                  A high score means your current task mix has significant overlap with AI capabilities. Focus on
                  building skills in areas where AI struggles: complex stakeholder management, creative strategy,
                  cross-cultural communication, and AI tool oversight. The professionals who thrive will be those
                  who use AI to amplify their human capabilities, not those who compete against it.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-1">Is this tool specific to the UAE and GCC?</h4>
                <p className="text-sm text-gray-600">
                  The calculator works for any country. When you select your region, the analysis factors in local
                  regulatory environments, AI adoption rates, and labour market dynamics. GCC countries have specific
                  nationalisation policies and labour structures that affect AI adoption timelines.
                </p>
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          {expanded ? 'Show less' : 'Read more: Key statistics and FAQ'}
        </button>
      </div>
    </div>
  );
                    }
