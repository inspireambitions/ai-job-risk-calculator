'use client';

export default function ExampleResult() {
  const tasks = [
    { name: 'Scheduling meetings & calendar management', score: 88, color: 'bg-red-500', label: '1-2 yrs' },
    { name: 'Drafting routine correspondence', score: 72, color: 'bg-orange-500', label: '2-3 yrs' },
    { name: 'Stakeholder relationship management', score: 18, color: 'bg-green-500', label: '10+ yrs' },
  ];

  return (
    <div className="mb-8 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Example Result: Marketing Manager, Dubai
      </p>

      <div className="flex items-center gap-4 mb-4">
        {/* Mini Score Circle */}
        <div className="flex-shrink-0 w-16 h-16 rounded-full border-4 border-yellow-300 flex items-center justify-center">
          <span className="text-xl font-bold text-yellow-600">47%</span>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">Moderate Risk</p>
          <p className="text-xs text-gray-500">
            Routine tasks face near-term automation. Strategy and relationship tasks remain safe for 10+ years.
          </p>
        </div>
      </div>

      {/* Sample Task Bars */}
      <div className="space-y-2.5">
        {tasks.map((task, i) => (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-700">{task.name}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-gray-400">{task.label}</span>
                <span className="text-xs font-semibold text-gray-600">{task.score}%</span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${task.color}`}
                style={{ width: `${task.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-400 mt-3 text-center">
        This is a sample. Your analysis will be personalised to your actual tasks and region.
      </p>
    </div>
  );
}
