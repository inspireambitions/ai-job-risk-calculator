'use client';

import { useState } from 'react';
import { computeDeterministicScores } from '../../lib/scoring';
import { trackToolEvent } from '../../components/analytics';

const empty = { title: '', tasks: '' };

function RoleInput({ label, value, onChange }) {
  return <fieldset className="border border-gray-200 bg-white p-5"><legend className="px-2 font-bold">{label}</legend><label className="mt-2 block text-sm font-semibold">Job title<input className="mt-1 w-full border border-gray-300 p-3 text-base" value={value.title} onChange={(event) => onChange({ ...value, title: event.target.value })} /></label><label className="mt-4 block text-sm font-semibold">Daily tasks, one per line<textarea className="mt-1 min-h-40 w-full border border-gray-300 p-3 text-base" value={value.tasks} onChange={(event) => onChange({ ...value, tasks: event.target.value })} /></label></fieldset>;
}

export default function CompareClient() {
  const [first, setFirst] = useState(empty);
  const [second, setSecond] = useState(empty);
  const [results, setResults] = useState(null);
  const compare = () => {
    const score = (role) => computeDeterministicScores({ tasks: role.tasks.split('\n').map((task) => task.trim()).filter(Boolean), country: '', experience: '', workEnvironment: '' });
    if (!first.title || !second.title || !first.tasks.trim() || !second.tasks.trim()) return;
    setResults([score(first), score(second)]);
    trackToolEvent('job_compare_run', { surface: 'compare' });
  };
  return <div><div className="grid gap-5 md:grid-cols-2"><RoleInput label="Role one" value={first} onChange={setFirst} /><RoleInput label="Role two" value={second} onChange={setSecond} /></div><button type="button" onClick={compare} className="mt-5 bg-brand-600 px-6 py-3 font-semibold text-white">Compare roles</button>{results && <div className="mt-8 grid gap-5 md:grid-cols-2">{results.map((result, index) => <section key={index} className="border border-gray-200 bg-white p-5"><h2 className="text-xl font-bold">{index === 0 ? first.title : second.title}</h2><dl className="mt-4 grid grid-cols-3 gap-3 text-center"><div><dt className="text-xs text-gray-500">Risk</dt><dd className="text-2xl font-bold">{result.overallRiskScore}%</dd></div><div><dt className="text-xs text-gray-500">Protection</dt><dd className="text-2xl font-bold">{result.protectionScore}%</dd></div><div><dt className="text-xs text-gray-500">Leverage</dt><dd className="text-2xl font-bold">{result.leverageScore}%</dd></div></dl><p className="mt-5 text-sm text-gray-600">Horizon: {result.displacementRange ? `~${result.displacementYear} (${result.displacementRange.earliest}-${result.displacementRange.latest})` : '10+ years'}</p></section>)}</div>}</div>;
}
