'use client';

import { useState, useEffect } from 'react';
import { findMatchingTasks, industries, experienceLevels, workEnvironments, countries } from '../lib/job-tasks';

export default function JobForm({ onSubmit, initialData }) {
  const [jobTitle, setJobTitle] = useState(initialData?.jobTitle || '');
  const [industry, setIndustry] = useState(initialData?.industry || '');
  const [experience, setExperience] = useState(initialData?.experience || '');
  const [workEnvironment, setWorkEnvironment] = useState(initialData?.workEnvironment || '');
  const [country, setCountry] = useState(initialData?.country || '');
  const [tasks, setTasks] = useState(initialData?.tasks || []);
  const [customTask, setCustomTask] = useState('');
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Auto-suggest tasks when job title changes
  useEffect(() => {
    if (jobTitle.length >= 3) {
      const matches = findMatchingTasks(jobTitle);
      if (matches) {
        setSuggestedTasks(matches);
        setShowSuggestions(true);
      } else {
        setSuggestedTasks([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestedTasks([]);
      setShowSuggestions(false);
    }
  }, [jobTitle]);

  const addTask = (task) => {
    if (task && tasks.length < 8 && !tasks.includes(task)) {
      setTasks([...tasks, task]);
    }
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleAddCustomTask = () => {
    if (customTask.trim()) {
      addTask(customTask.trim());
      setCustomTask('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobTitle || tasks.length === 0) return;
    onSubmit({ jobTitle, industry, experience, tasks, workEnvironment, country });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Title */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Your Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. HR Manager, Software Engineer, Accountant"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-base"
          required
        />
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Your Daily Tasks <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select or type the tasks you actually do every day. This is what makes the analysis personal to you.
        </p>

        {/* Suggested Tasks */}
        {showSuggestions && suggestedTasks.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Common tasks for {jobTitle} - click to add:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedTasks.map((task, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addTask(task)}
                  disabled={tasks.includes(task)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                    tasks.includes(task)
                      ? 'bg-brand-50 border-brand-200 text-brand-600 cursor-default'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-brand-50 hover:border-brand-300 cursor-pointer'
                  }`}
                >
                  {tasks.includes(task) ? '+ ' : '+ '}{task}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Task Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={customTask}
            onChange={(e) => setCustomTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomTask();
              }
            }}
            placeholder="Type a task and press Enter"
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
          />
          <button
            type="button"
            onClick={handleAddCustomTask}
            className="px-4 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
          >
            Add
          </button>
        </div>

        {/* Selected Tasks */}
        {tasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Your tasks ({tasks.length}/8):
            </p>
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200"
              >
                <span className="text-sm text-gray-700">{task}</span>
                <button
                  type="button"
                  onClick={() => removeTask(idx)}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-3 text-lg leading-none"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        {tasks.length === 0 && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3 border border-amber-200">
            Add at least one task to get your personalised risk analysis.
          </p>
        )}
      </div>

      {/* Additional Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-4">Additional Details (optional but improves accuracy)</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Industry */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Industry</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
            >
              <option value="">Select industry</option>
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Experience Level</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
            >
              <option value="">Select experience</option>
              {experienceLevels.map((exp) => (
                <option key={exp.value} value={exp.value}>{exp.label}</option>
              ))}
            </select>
          </div>

          {/* Work Environment */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Work Environment</label>
            <select
              value={workEnvironment}
              onChange={(e) => setWorkEnvironment(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
            >
              <option value="">Select environment</option>
              {workEnvironments.map((env) => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Country/Region</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white"
            >
              <option value="">Select country</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!jobTitle || tasks.length === 0}
        className={`w-full py-4 rounded-xl text-base font-semibold transition-all ${
          jobTitle && tasks.length > 0
            ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-200'
            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
        }`}
      >
        Analyse My AI Risk
      </button>

      <p className="text-xs text-center text-gray-400">
        Your data is not stored. Analysis is generated in real time and discarded.
      </p>
    </form>
  );
}
