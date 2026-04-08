import { useState, useEffect } from "react";
import { Filter, Save, RotateCcw, ChevronDown } from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import toast from 'react-hot-toast';

type Rating = "H" | "M" | "L" | "";

interface ActivityRow {
  id: number;
  name: string;
  tower: string;
  // Performance (H=good)
  multipleLocns: Rating;
  routine: Rating;
  volumes: Rating;
  manpower: Rating;
  sops: Rating;
  erpTechnology: Rating;
  // Characteristic (L=good)
  sensitivity: Rating;
  criticality: Rating;
  controls: Rating;
  proximity: Rating;
  regulatory: Rating;
  skill: Rating;
  comments: string;
}

// const INITIAL_ROWS: ActivityRow[] = [...] - REMOVED - now API driven

function calcScore(row: ActivityRow): { perf: number; char: number; total: number; consolidate: boolean } {
  const perfKeys: (keyof ActivityRow)[] = ["multipleLocns", "routine", "volumes", "manpower", "sops", "erpTechnology"];
  const charKeys: (keyof ActivityRow)[] = ["sensitivity", "criticality", "controls", "proximity", "regulatory", "skill"];
  const perf = perfKeys.filter(k => row[k] === "H").length;
  const char = charKeys.filter(k => row[k] === "L").length;
  const total = perf + char;
  return { perf, char, total, consolidate: total >= 7 };
}

const RatingCell = ({
  value, onChange, onlyH = false
}: { value: Rating; onChange: (v: Rating) => void; onlyH?: boolean }) => (
  <select
    className="w-16 bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-bold text-slate-700 outline-none focus:border-corporateBlue appearance-none text-center cursor-pointer"
    value={value}
    onChange={e => onChange(e.target.value as Rating)}
  >
    <option value="">—</option>
    <option value="H">H</option>
    <option value="M">M</option>
    <option value="L">L</option>
  </select>
);

export function SixBySixScoring() {
  const [rows, setRows] = useState<ActivityRow[]>([]);

  const { data: apiRows } = useQuery({
    queryKey: ['sixBySix'],
    queryFn: () => api.get('/api/eper/sixbysix/scores').then(res => res.data)
  });

  useEffect(() => {
    if (apiRows) setRows(apiRows);
  }, [apiRows]);
  const [selected, setSelected] = useState<number[]>([]);
  const [bulkVal, setBulkVal] = useState<Rating>("L");
  const [saved, setSaved] = useState(false);

  const updateRow = (id: number, field: keyof ActivityRow, value: string) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
    setSaved(false);
  };

  const toggleSelect = (id: number) => {
    setSelected(sel => sel.includes(id) ? sel.filter(s => s !== id) : [...sel, id]);
  };

  const applyBulk = () => {
    const perfKeys: (keyof ActivityRow)[] = ["multipleLocns", "routine", "volumes", "manpower", "sops", "erpTechnology"];
    const charKeys: (keyof ActivityRow)[] = ["sensitivity", "criticality", "controls", "proximity", "regulatory", "skill"];
    setRows(rows.map(r => {
      if (!selected.includes(r.id)) return r;
      const updates: Partial<ActivityRow> = {};
      [...perfKeys, ...charKeys].forEach(k => { (updates as Record<string, string>)[k as string] = bulkVal; });
      return { ...r, ...updates };
    }));
    setSaved(false);
  };

  const queryClient = useQueryClient();
  const handleSave = async () => {
    try {
      await api.post('/api/eper/sixbysix/save', { rows });
      toast.success('Scores saved!');
      queryClient.invalidateQueries({ queryKey: ['sixBySix'] });
    } catch (err) {
      toast.error('Save failed');
    }
  };

  const scored = rows.filter(r => calcScore(r).total > 0).length;
  const consolidatable = rows.filter(r => calcScore(r).consolidate).length;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-start justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">6×6 Scoring Grid</h1>
          <p className="text-sm text-slate-500 mt-0.5">Multi-parameter workforce activity evaluation ledger.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Department</span>
            <div className="relative">
              <select className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 py-2 pl-3 pr-8 rounded-lg appearance-none outline-none">
                <option>Finance &amp; Accounts</option>
                <option>Human Resources</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Tower</span>
            <div className="relative">
              <select className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 py-2 pl-3 pr-8 rounded-lg appearance-none outline-none">
                <option>All Towers</option>
                <option>P2P Payments</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <button className="bg-corporateBlue hover:bg-corporateBlue-dark text-white text-sm font-bold py-2 px-5 rounded-lg flex items-center gap-2 shadow-sm">
            <Filter size={15} /> Load Activities
          </button>
        </div>
      </div>

      {/* Stat strips */}
      <div className="grid grid-cols-4 gap-4 px-8 py-4 bg-white border-b border-slate-100">
        {[
          { label: "TOTAL ROWS", value: rows.length, icon: "≡", color: "text-slate-600" },
          { label: "PENDING", value: rows.length - scored, icon: "⏳", color: "text-amber-600" },
          { label: "SCORED", value: scored, icon: "✓", color: "text-green-600" },
          { label: "CONSOLIDATABLE", value: consolidatable, icon: "★", color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`text-lg ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 tracking-widest">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk actions */}
      <div className="px-8 py-3 bg-white border-b border-slate-100 flex items-center gap-4">
        <span className="text-[11px] font-extrabold text-slate-500 tracking-widest uppercase flex items-center gap-2">
          ⚡ BULK ACTIONS
        </span>
        <span className="text-xs font-bold text-slate-500">SET ALL COLS</span>
        {(["L", "M", "H"] as Rating[]).map(v => (
          <button
            key={v}
            onClick={() => setBulkVal(v)}
            className={`w-8 h-8 rounded-full text-xs font-black border-2 transition-all ${bulkVal === v ? "bg-corporateBlue text-white border-corporateBlue" : "border-slate-300 text-slate-600 hover:border-corporateBlue"}`}
          >
            {v}
          </button>
        ))}
        <button
          onClick={applyBulk}
          disabled={selected.length === 0}
          className="bg-corporateBlue disabled:opacity-40 hover:bg-corporateBlue-dark text-white text-xs font-bold py-1.5 px-4 rounded-lg"
        >
          Apply to Selected ({selected.length})
        </button>
        <button onClick={() => setSelected([])} className="text-xs font-bold text-slate-500 hover:text-slate-800 ml-1">
          Reset Selection
        </button>
      </div>

      {/* Scrollable grid */}
      <div className="flex-1 overflow-auto px-8 py-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="text-xs whitespace-nowrap border-collapse">
            <thead>
              <tr className="bg-slate-50">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-r border-slate-200 min-w-[40px]"></th>
                <th className="sticky left-10 z-10 bg-slate-50 px-4 py-3 text-left text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-r border-slate-200 min-w-[220px]">Activity Name</th>
                {/* Performance group header */}
                <th colSpan={6} className="px-4 py-1.5 text-[9px] font-extrabold text-blue-600 tracking-widest uppercase border-b border-slate-200 text-center bg-blue-50">
                  ── Process Performance Group (H = Good) ──
                </th>
                {/* Characteristic group header */}
                <th colSpan={6} className="px-4 py-1.5 text-[9px] font-extrabold text-amber-700 tracking-widest uppercase border-b border-slate-200 text-center bg-amber-50">
                  ── Process Characteristic Group (L = Good) ──
                </th>
                <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-200 text-center">Score</th>
                <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-200 text-center">Consolidate</th>
                <th className="px-4 py-3 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-200 min-w-[140px]">Comments</th>
              </tr>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="sticky left-0 z-10 bg-slate-50 px-4 py-2 border-r border-slate-200"></th>
                <th className="sticky left-10 z-10 bg-slate-50 px-4 py-2 border-r border-slate-200"></th>
                {["Locations", "Routine", "Volumes", "Manpower", "SOPs", "ERP/Tech"].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-extrabold text-blue-500 tracking-wider uppercase text-center bg-blue-50/50">{h}</th>
                ))}
                {["Sensitivity", "Criticality", "Controls", "Proximity", "Regulatory", "Skill"].map(h => (
                  <th key={h} className="px-3 py-2 text-[9px] font-extrabold text-amber-600 tracking-wider uppercase text-center bg-amber-50/50">{h}</th>
                ))}
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2"></th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const { total, consolidate } = calcScore(row);
                const isSelected = selected.includes(row.id);
                return (
                  <tr key={row.id} className={`border-b border-slate-100 hover:bg-slate-50/50 ${isSelected ? "bg-blue-50/30" : ""}`}>
                    <td className="sticky left-0 z-10 bg-white border-r border-slate-100 px-4 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(row.id)} className="rounded border-slate-300 text-corporateBlue" />
                    </td>
                    <td className="sticky left-10 z-10 bg-white border-r border-slate-100 px-4 py-3 min-w-[220px]">
                      <p className="font-semibold text-slate-900 text-xs">{row.name}</p>
                      <p className="text-[10px] text-slate-400">{row.tower}</p>
                    </td>
                    {/* Performance */}
                    {(["multipleLocns", "routine", "volumes", "manpower", "sops", "erpTechnology"] as (keyof ActivityRow)[]).map(k => (
                      <td key={k} className="px-2 py-3 text-center">
                        <RatingCell value={row[k] as Rating} onChange={(v) => updateRow(row.id, k, v)} />
                      </td>
                    ))}
                    {/* Characteristic */}
                    {(["sensitivity", "criticality", "controls", "proximity", "regulatory", "skill"] as (keyof ActivityRow)[]).map(k => (
                      <td key={k} className="px-2 py-3 text-center">
                        <RatingCell value={row[k] as Rating} onChange={(v) => updateRow(row.id, k, v)} />
                      </td>
                    ))}
                    {/* Total Score */}
                    <td className="px-4 py-3 text-center">
                      <span className={`text-base font-extrabold ${total >= 7 ? "text-green-600" : total >= 4 ? "text-amber-600" : "text-slate-500"}`}>{total}</span>
                      <span className="text-[9px] text-slate-400">/12</span>
                    </td>
                    {/* Consolidate badge */}
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${consolidate ? "bg-green-100 text-green-700" : "bg-red-50 text-red-600"}`}>
                        {consolidate ? "YES" : "NO"}
                      </span>
                    </td>
                    {/* Comment */}
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        placeholder="Add comment..."
                        value={row.comments}
                        onChange={(e) => updateRow(row.id, "comments", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs outline-none focus:border-corporateBlue"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500 font-medium px-1">
          <p>Showing 1–{rows.length} of {rows.length} activities · <span className="text-blue-600 font-bold">Primary Tower: Finance &amp; Accounts</span></p>
          <div className="flex gap-2">
            <button className="border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50">Previous</button>
            <button className="border border-slate-200 rounded px-3 py-1.5 hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          Last saved 4 minutes ago by System
        </div>
        <div className="flex gap-3">
          <button onClick={() => setRows(INITIAL_ROWS)} className="border border-slate-200 text-slate-600 text-sm font-semibold py-2.5 px-5 rounded-lg hover:bg-slate-50 flex items-center gap-2">
            <RotateCcw size={15} /> Discard Changes
          </button>
          <button onClick={handleSave} className={`text-white text-sm font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 shadow-sm transition-all ${saved ? "bg-green-600" : "bg-corporateBlue hover:bg-corporateBlue-dark"}`}>
            <Save size={15} /> {saved ? "Saved!" : "Save Scores to Ledger"}
          </button>
        </div>
      </div>
    </div>
  );
}
