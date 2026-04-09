<<<<<<< HEAD
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Box } from "lucide-react";
import { apiGet, apiPost } from "../../api/http";
=======
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Box, Settings2, HelpCircle, Sparkles, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useFormContext, useFieldArray } from "react-hook-form";
>>>>>>> target/main

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
<<<<<<< HEAD
  onPayloadChange: (payload: WdtPayload | null) => void;
  focusSection?: "core" | "support" | null;
}

interface DepartmentObj {
  _id: string;
  code?: string;
  name?: string;
}

interface MeResponse {
  department?: DepartmentObj | string | null;
}

interface ActivityNode {
  _id: string;
  name: string;
}

interface ProcessNode {
  _id: string;
  name: string;
  activities: ActivityNode[];
}

interface TowerNode {
  _id: string;
  name: string;
  processes: ProcessNode[];
}

interface ProcessRowData {
  id: number;
  towerId: string;
  processId: string;
  activityId: string;
  towerQuery: string;
  processQuery: string;
  activityQuery: string;
  frequency: string;
  vol: string;
  hrs: string;
  appUsed: string;
}

interface MiscTaskData {
  id: number;
  description: string;
  vol: string;
  hrs: string;
  suggestionName?: string;
  suggestionActivityId?: string;
  confidence?: number;
  mappingLoading?: boolean;
}

interface WdtPayload {
  department: string;
  month: number;
  year: number;
  overtimeHours: number;
  activities: Array<{
    activity?: string;
    isCustom?: boolean;
    customText?: string;
    aiMappedActivity?: string;
    mappingAccepted?: boolean;
    volumeMonthly: number;
    timePerTransaction: number;
  }>;
}

interface MySubmission {
  month: number;
  year: number;
  activities?: Array<{
    activity?: { _id?: string; name?: string };
    customText?: string;
    isCustom?: boolean;
    volumeMonthly?: number;
    timePerTransaction?: number;
    totalHoursMonth?: number;
    aiMappedActivity?: string;
  }>;
}

interface ValidationResult {
  ok: boolean;
  errors: string[];
}

const makeProcessRow = (): ProcessRowData => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  towerId: "",
  processId: "",
  activityId: "",
  towerQuery: "",
  processQuery: "",
  activityQuery: "",
  frequency: "",
  vol: "",
  hrs: "",
  appUsed: "",
});

const makeMiscRow = (): MiscTaskData => ({
  id: Date.now() + Math.floor(Math.random() * 1000),
  description: "",
  vol: "",
  hrs: "",
});

const parseNum = (value: string): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

export function Step2({ onNext, onPrev, onPayloadChange, focusSection = null }: StepProps) {
  const [departmentId, setDepartmentId] = useState<string>("");
  const [hierarchy, setHierarchy] = useState<TowerNode[]>([]);
  const [processRows, setProcessRows] = useState<ProcessRowData[]>([makeProcessRow()]);
  const [miscRows, setMiscRows] = useState<MiscTaskData[]>([makeMiscRow()]);
  const [standardHours, setStandardHours] = useState<number>(160);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [footerPulse, setFooterPulse] = useState(false);

  const mapTimers = useRef<Record<number, number>>({});
  const processSectionRef = useRef<HTMLDivElement | null>(null);
  const supportSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await apiGet<MeResponse>("/auth/me");
        const dept = typeof me.department === "string" ? me.department : me.department?._id || "";
        setDepartmentId(dept);

        const [settings, submissions] = await Promise.all([
          apiGet<{ value: number }>("/eper/settings/standardHours"),
          apiGet<MySubmission[]>("/eper/wdt/my"),
        ]);

        setStandardHours(settings?.value || 160);

        if (dept) {
          const activityTree = await apiGet<TowerNode[]>(`/eper/activities/by-department/${dept}`);
          setHierarchy(activityTree || []);

          const latest = submissions?.[0];
          if (latest?.activities?.length) {
            const processMapped: ProcessRowData[] = [];
            const miscMapped: MiscTaskData[] = [];

            latest.activities.forEach((entry, idx) => {
              if (entry.isCustom) {
                miscMapped.push({
                  id: idx + 1000,
                  description: entry.customText || "",
                  vol: String(entry.volumeMonthly || ""),
                  hrs: String(entry.totalHoursMonth || ""),
                });
                return;
              }

              const matched = findByActivityName(activityTree || [], entry.activity?.name || "");
              processMapped.push({
                id: idx + 1,
                towerId: matched?.towerId || "",
                processId: matched?.processId || "",
                activityId: matched?.activityId || entry.activity?._id || "",
                towerQuery: matched?.towerName || "",
                processQuery: matched?.processName || "",
                activityQuery: entry.activity?.name || matched?.activityName || "",
                frequency: "Monthly",
                vol: String(entry.volumeMonthly || ""),
                hrs: String(entry.totalHoursMonth || ""),
                appUsed: "",
              });
            });

            if (processMapped.length) {
              setProcessRows(processMapped);
            }
            if (miscMapped.length) {
              setMiscRows(miscMapped);
            }
          }
        }
      } catch {
        setStandardHours(160);
      }
    };

    void load();
  }, []);

  const totalProcessHours = useMemo(
    () => processRows.reduce((acc, row) => acc + parseNum(row.hrs), 0),
    [processRows]
  );
  const totalMiscHours = useMemo(
    () => miscRows.reduce((acc, row) => acc + parseNum(row.hrs), 0),
    [miscRows]
  );
  const aggregateMonthlyEffort = totalProcessHours + totalMiscHours;
  const utilization = standardHours > 0 ? (aggregateMonthlyEffort / standardHours) * 100 : 0;
  const utilizationBand = utilization > 100 ? "over" : utilization > 80 ? "healthy" : "under";
  const utilizationLabel = utilizationBand === "over" ? "Over capacity" : utilizationBand === "healthy" ? "On track" : "Below target";

  useEffect(() => {
    if (!departmentId) {
      onPayloadChange(null);
      return;
    }

    const payload = buildPayload(departmentId, processRows, miscRows);
    onPayloadChange(payload);
  }, [departmentId, processRows, miscRows, onPayloadChange]);

  useEffect(() => {
    setFooterPulse(true);
    const timer = window.setTimeout(() => setFooterPulse(false), 450);
    return () => window.clearTimeout(timer);
  }, [processRows, miscRows]);

  useEffect(() => {
    if (focusSection === "core") {
      processSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (focusSection === "support") {
      supportSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focusSection]);

  const addProcessRow = () => {
    setProcessRows((prev) => {
      const next = makeProcessRow();
      const last = prev[prev.length - 1];
      if (last?.towerId) {
        const tower = hierarchy.find((item) => item._id === last.towerId);
        next.towerId = last.towerId;
        next.towerQuery = tower?.name || "";
      }
      return [...prev, next];
    });
  };

  const removeProcessRow = (id: number) => {
    setProcessRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateProcessRow = (id: number, field: keyof ProcessRowData, value: string) => {
    setProcessRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        if (field === "towerId") {
          return { ...row, towerId: value, processId: "", activityId: "", processQuery: "", activityQuery: "" };
        }
        if (field === "processId") {
          return { ...row, processId: value, activityId: "", activityQuery: "" };
        }
        return { ...row, [field]: value };
      })
    );
  };

  const updateTowerQuery = (id: number, value: string) => {
    setProcessRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const selectedTower = hierarchy.find((tower) => tower.name.toLowerCase() === value.trim().toLowerCase());
        return {
          ...row,
          towerQuery: value,
          towerId: selectedTower?._id || "",
          processId: "",
          activityId: "",
          processQuery: "",
          activityQuery: "",
        };
      })
    );
  };

  const updateProcessQuery = (id: number, value: string) => {
    setProcessRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const selectedTower = hierarchy.find((tower) => tower._id === row.towerId);
        const process = (selectedTower?.processes || []).find(
          (item) => item.name.toLowerCase() === value.trim().toLowerCase()
        );

        return {
          ...row,
          processQuery: value,
          processId: process?._id || "",
          activityId: "",
          activityQuery: "",
        };
      })
    );
  };

  const updateActivityQuery = (id: number, value: string) => {
    setProcessRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;

        const selectedTower = hierarchy.find((tower) => tower._id === row.towerId);
        const process = (selectedTower?.processes || []).find((item) => item._id === row.processId);
        const activity = (process?.activities || []).find(
          (item) => item.name.toLowerCase() === value.trim().toLowerCase()
        );

        return {
          ...row,
          activityQuery: value,
          activityId: activity?._id || "",
        };
      })
    );
  };

  const addMiscRow = () => {
    setMiscRows((prev) => [...prev, makeMiscRow()]);
  };

  const removeMiscRow = (id: number) => {
    setMiscRows((prev) => prev.filter((r) => r.id !== id));
  };

  const updateMiscRow = (id: number, field: keyof MiscTaskData, value: string) => {
    setMiscRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );

    if (field === "description") {
      const currentTimer = mapTimers.current[id];
      if (currentTimer) {
        window.clearTimeout(currentTimer);
      }

      mapTimers.current[id] = window.setTimeout(() => {
        void runAiMapping(id, value);
      }, 700);
    }
  };

  const runAiMapping = async (rowId: number, customText: string) => {
    if (!departmentId || customText.trim().length < 3) return;

    setMiscRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, mappingLoading: true } : row))
    );

    try {
      const mapped = await apiPost<{
        mappedActivityId?: string;
        mappedActivityName?: string;
        confidence?: number;
      }>("/eper/ai/map-activity", {
        customText,
        departmentId,
      });

      setMiscRows((prev) =>
        prev.map((row) => {
          if (row.id !== rowId) return row;
          return {
            ...row,
            suggestionActivityId: mapped?.mappedActivityId,
            suggestionName: mapped?.mappedActivityName,
            confidence: mapped?.confidence,
            mappingLoading: false,
          };
        })
      );
    } catch {
      setMiscRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, mappingLoading: false } : row))
      );
    }
  };

  const handleNext = () => {
    const validation = validateRows(processRows, miscRows);
    setValidationErrors(validation.errors);

    if (!validation.ok) return;
    onNext();
  };

  return (
    <div className="bg-white rounded-b-md border-x border-b border-slate-200 shadow-sm font-sans flex flex-col">
      <div className="p-8 sm:p-10 flex-1">
        <div className="mb-8 max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 mb-2">Process inventory</p>
          <h2 className="text-3xl font-semibold text-slate-900 mb-2 tracking-tight">Record every workflow with table precision</h2>
          <p className="text-sm text-slate-500 leading-relaxed">Enter operational workflows, monthly volumes, and time requirements using a condensed table layout.</p>
        </div>

        {validationErrors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {validationErrors.map((err) => (
              <p key={err}>{err}</p>
            ))}
          </div>
        )}

        <div ref={processSectionRef} className="w-full mb-6 rounded-md border border-slate-200 bg-white overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[980px]">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 tracking-[0.18em] uppercase border-y border-slate-200">
                    <th className="py-3 px-3 w-[18%]">Tower</th>
                    <th className="py-3 px-3 w-[20%]">Process</th>
                    <th className="py-3 px-3 w-[22%]">Activity</th>
                    <th className="py-3 px-3 w-32">Frequency</th>
                    <th className="py-3 px-3 text-center w-24">Vol/Mo</th>
                    <th className="py-3 px-3 text-center w-24">Hrs/Mo</th>
                    <th className="py-3 px-3 w-40">App Used</th>
                    <th className="py-3 pr-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {processRows.map((row) => {
                  const selectedTower = hierarchy.find((tower) => tower._id === row.towerId);
                  const processes = selectedTower?.processes || [];
                  const selectedProcess = processes.find((proc) => proc._id === row.processId);
                  const activities = selectedProcess?.activities || [];

                  return (
                    <tr key={row.id} className="border-b border-slate-100 last:border-0 align-top">
                      <td className="py-3 px-2">
                        <input
                          list={`tower-options-${row.id}`}
                          className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                          placeholder="Select tower..."
                          value={row.towerQuery}
                          onChange={(e) => updateTowerQuery(row.id, e.target.value)}
                        />
                        <datalist id={`tower-options-${row.id}`}>
                          {hierarchy.map((tower) => (
                            <option key={tower._id} value={tower.name} />
                          ))}
                        </datalist>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          list={`process-options-${row.id}`}
                          className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                          placeholder="Select process..."
                          value={row.processQuery}
                          onChange={(e) => updateProcessQuery(row.id, e.target.value)}
                          disabled={!row.towerId}
                        />
                        <datalist id={`process-options-${row.id}`}>
                          {processes.map((proc) => (
                            <option key={proc._id} value={proc.name} />
                          ))}
                        </datalist>
                      </td>
                      <td className="py-3 px-2">
                        <input
                          list={`activity-options-${row.id}`}
                          className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                          placeholder="Select activity..."
                          value={row.activityQuery}
                          onChange={(e) => updateActivityQuery(row.id, e.target.value)}
                          disabled={!row.processId}
                        />
                        <datalist id={`activity-options-${row.id}`}>
                          {activities.map((activity) => (
                            <option key={activity._id} value={activity.name} />
                          ))}
                        </datalist>
                      </td>
                      <td className="py-3 px-2">
                        <select
                          className={`w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm outline-none focus:border-corporateBlue appearance-none ${row.frequency ? "text-slate-700" : "text-slate-400 italic"}`}
                          value={row.frequency}
                          onChange={(e) => updateProcessRow(row.id, "frequency", e.target.value)}
                        >
                          <option value="" disabled>
                            Select frequency...
                          </option>
                          <option>Daily</option>
                          <option>Weekly</option>
                          <option>Monthly</option>
                        </select>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-center text-sm text-slate-700 outline-none focus:border-corporateBlue font-mono tabular-nums"
                          value={row.vol}
                          onChange={(e) => updateProcessRow(row.id, "vol", e.target.value)}
                        />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-center text-sm font-medium text-slate-900 outline-none focus:border-corporateBlue font-mono tabular-nums"
                          value={row.hrs}
                          onChange={(e) => updateProcessRow(row.id, "hrs", e.target.value)}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <input
                          type="text"
                          className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                          placeholder="e.g. Workday"
                          value={row.appUsed}
                          onChange={(e) => updateProcessRow(row.id, "appUsed", e.target.value)}
                        />
                      </td>
                      <td className="py-3 pl-2 text-right">
                        <button onClick={() => removeProcessRow(row.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 lg:hidden p-4 pt-0">
            {processRows.map((row, index) => {
              const selectedTower = hierarchy.find((tower) => tower._id === row.towerId);
              const processes = selectedTower?.processes || [];
              const selectedProcess = processes.find((proc) => proc._id === row.processId);
              const activities = selectedProcess?.activities || [];

              return (
                <div key={row.id} className="border border-slate-200 rounded-md p-4 bg-slate-50/70">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Process Row {index + 1}</p>
                    <button onClick={() => removeProcessRow(row.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      list={`tower-options-mobile-${row.id}`}
                      className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                      placeholder="Select tower..."
                      value={row.towerQuery}
                      onChange={(e) => updateTowerQuery(row.id, e.target.value)}
                    />
                    <datalist id={`tower-options-mobile-${row.id}`}>
                      {hierarchy.map((tower) => (
                        <option key={tower._id} value={tower.name} />
                      ))}
                    </datalist>

                    <input
                      list={`process-options-mobile-${row.id}`}
                      className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                      placeholder="Select process..."
                      value={row.processQuery}
                      onChange={(e) => updateProcessQuery(row.id, e.target.value)}
                      disabled={!row.towerId}
                    />
                    <datalist id={`process-options-mobile-${row.id}`}>
                      {processes.map((proc) => (
                        <option key={proc._id} value={proc.name} />
                      ))}
                    </datalist>

                    <input
                      list={`activity-options-mobile-${row.id}`}
                      className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                      placeholder="Select activity..."
                      value={row.activityQuery}
                      onChange={(e) => updateActivityQuery(row.id, e.target.value)}
                      disabled={!row.processId}
                    />
                    <datalist id={`activity-options-mobile-${row.id}`}>
                      {activities.map((activity) => (
                        <option key={activity._id} value={activity.name} />
                      ))}
                    </datalist>

                    <select
                      className={`w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm outline-none focus:border-corporateBlue appearance-none ${row.frequency ? "text-slate-700" : "text-slate-400 italic"}`}
                      value={row.frequency}
                      onChange={(e) => updateProcessRow(row.id, "frequency", e.target.value)}
                    >
                      <option value="" disabled>
                        Select frequency...
                      </option>
=======
}

export function Step2({ onNext, onPrev }: StepProps) {
  const { user } = useAuth();
  const { control, register, setValue, watch } = useFormContext();

  const { fields: processRows, append: appendProcess, remove: removeProcess } = useFieldArray({
    control,
    name: "processRows"
  });

  const { fields: miscRows, append: appendMisc, remove: removeMisc } = useFieldArray({
    control,
    name: "miscRows"
  });

  const [standardHours, setStandardHours] = useState<number>(160);
  const [isEditingStd, setIsEditingStd] = useState(false);

  useEffect(() => {
    // Optionally fetch std hours here
  }, []);

  const watchProcessRows = watch("processRows", []);
  const watchMiscRows = watch("miscRows", []);

  const totalProcessHours = watchProcessRows.reduce((acc: number, row: any) => acc + (Number(row.hrs) || 0), 0);
  const totalMiscHours = watchMiscRows.reduce((acc: number, row: any) => acc + (Number(row.hrs) || 0), 0);
  const aggregateMonthlyEffort = totalProcessHours + totalMiscHours;
  const utilization = standardHours > 0 ? (aggregateMonthlyEffort / standardHours) * 100 : 0;

  const addProcessRow = () => {
    appendProcess({ majorProcess: 'Select...', process: 'Select...', subProcess: 'Select...', frequency: 'Daily', vol: 0, hrs: 0, appUsed: '' });
  };

  const addMiscRow = () => {
    appendMisc({ description: '', hrs: 0, isMapping: false, aiSuggestion: null });
  };

  const mapActivityWithAI = async (index: number, description: string) => {
    if (!description.trim() || !user?.department?._id) return;
    
    setValue(`miscRows.${index}.isMapping`, true);
    try {
      const res = await axios.post("/api/eper/ai/map-activity", {
        customText: description,
        departmentId: user?.department?._id
      });
      setValue(`miscRows.${index}.aiSuggestion`, res.data);
    } catch (err) {
      console.error("AI mapping error");
    } finally {
      setValue(`miscRows.${index}.isMapping`, false);
    }
  };

  const acceptAiSuggestion = (index: number, matchedName: string) => {
    const desc = watchMiscRows[index].description;
    setValue(`miscRows.${index}.description`, `[AI Mapped: ${matchedName}] - ${desc}`);
    setValue(`miscRows.${index}.aiSuggestion`, null);
  };

  return (
    <div className="bg-white rounded-b-xl border-x border-b border-slate-200 shadow-sm font-sans flex flex-col">
      <div className="p-10 flex-1">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Process Inventory</h2>
          <p className="text-slate-500">Specify operational workflows, monthly volumes, and time requirements for each process.</p>
        </div>

        {/* Process Table */}
        <div className="w-full mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b-2 border-slate-100">
                <th className="pb-4 px-3 w-[15%]">MAJOR PROCESS</th>
                <th className="pb-4 px-3 w-[15%]">PROCESS</th>
                <th className="pb-4 px-3 w-[15%]">SUB PROCESS</th>
                <th className="pb-4 px-3 w-32">FREQUENCY</th>
                <th className="pb-4 px-3 text-center w-24">VOL/MO</th>
                <th className="pb-4 px-3 text-center w-24">HRS/MO</th>
                <th className="pb-4 px-3 w-40">APP USED</th>
                <th className="pb-4 pr-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {processRows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 px-2">
                      <SelectField name={`processRows.${index}.majorProcess`} label="Major Process" options={departments} />
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                      {...register(`processRows.${index}.process`)}
                    >
                      <option>Select...</option>
                      <option>Underwriting</option>
                      <option>Inbound Querie</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                      {...register(`processRows.${index}.subProcess`)}
                    >
                      <option>Select...</option>
                      <option>Risk Assessmen</option>
                      <option>Technical Help</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                      {...register(`processRows.${index}.frequency`)}
                    >
>>>>>>> target/main
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
<<<<<<< HEAD

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-center text-sm text-slate-700 outline-none focus:border-corporateBlue font-mono tabular-nums"
                        placeholder="Vol/Mo"
                        value={row.vol}
                        onChange={(e) => updateProcessRow(row.id, "vol", e.target.value)}
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-center text-sm font-medium text-slate-900 outline-none focus:border-corporateBlue font-mono tabular-nums"
                        placeholder="Hrs/Mo"
                        value={row.hrs}
                        onChange={(e) => updateProcessRow(row.id, "hrs", e.target.value)}
                      />
                    </div>

                    <input
                      type="text"
                      className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue placeholder:text-slate-400 placeholder:italic"
                      placeholder="App used"
                      value={row.appUsed}
                      onChange={(e) => updateProcessRow(row.id, "appUsed", e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mb-10">
          <button
            onClick={addProcessRow}
            className="text-corporateBlue font-semibold text-sm bg-transparent border border-slate-200 py-2.5 px-5 rounded-md hover:border-corporateBlue hover:text-corporateBlue-dark transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Row
          </button>
        </div>

        <div ref={supportSectionRef} className="bg-slate-50/70 p-8 rounded-md border border-slate-200 mb-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
=======
                  </td>
                  <td className="py-4 px-2 text-center">
                      <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-center text-sm text-slate-700 outline-none focus:border-corporateBlue [&:invalid]:border-red-300 [&:invalid]:bg-red-50" 
                      {...register(`processRows.${index}.vol`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-4 px-2 text-center">
                      <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-center text-sm font-bold text-corporateBlue outline-none focus:border-corporateBlue [&:invalid]:border-red-300 [&:invalid]:bg-red-50" 
                      {...register(`processRows.${index}.hrs`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-4 px-2">
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue" 
                      placeholder="e.g. Workday"
                      {...register(`processRows.${index}.appUsed`)}
                    />
                  </td>
                  <td className="py-4 pl-2 text-right">
                    <button onClick={() => removeProcess(index)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="flex justify-center mb-10">
          <button 
            onClick={addProcessRow}
            className="text-corporateBlue font-bold text-sm bg-blue-50 border border-dashed border-blue-200 py-3 px-8 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add New Process Row
          </button>
        </div>

        {/* Miscellaneous Tasks Section */}
        <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 mb-4">
>>>>>>> target/main
          <div className="flex items-center gap-3 mb-6">
            <div className="text-corporateBlue"><Box size={20} className="fill-corporateBlue/20" /></div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-widest uppercase">Miscellaneous Activities</h3>
          </div>
<<<<<<< HEAD

          <div className="w-full mb-6">
            <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_6rem_10rem_auto] text-[11px] font-semibold text-slate-500 tracking-[0.18em] uppercase mb-3 px-2 gap-3">
              <div>Activity Description</div>
              <div className="text-center">Vol/Mo</div>
              <div className="text-center">Time Taken (Hrs/Month)</div>
              <div className="text-right pr-1">Action</div>
            </div>

            <div className="space-y-3">
              {miscRows.map((row) => (
                <div key={row.id} className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_6rem_10rem_auto] gap-3 md:gap-4 items-end md:items-center border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                  <div className="flex-1">
                    <p className="md:hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Activity Description</p>
                    <textarea
                      className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue resize-none h-16 placeholder:text-slate-400 placeholder:italic"
                      placeholder="Ad-hoc meetings, administrative filing, or unique seasonal tasks..."
                      value={row.description}
                      onChange={(e) => updateMiscRow(row.id, "description", e.target.value)}
                    ></textarea>
                    {(row.suggestionName || row.mappingLoading) && (
                      <p className="text-xs mt-1 text-slate-500">
                        {row.mappingLoading ? "Analyzing activity..." : `Suggested: ${row.suggestionName} (${Math.round((row.confidence || 0) * 100)}% confidence)`}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="md:hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Vol/Mo</p>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm text-center text-slate-700 outline-none focus:border-corporateBlue font-mono tabular-nums"
                      value={row.vol}
                      onChange={(e) => updateMiscRow(row.id, "vol", e.target.value)}
                    />
                  </div>
                  <div>
                    <p className="md:hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-1">Time Taken (Hrs/Month)</p>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-full bg-transparent border-0 border-b border-slate-200 rounded-none px-0 py-2.5 text-sm font-medium text-center text-slate-900 outline-none focus:border-corporateBlue font-mono tabular-nums"
                      value={row.hrs}
                      onChange={(e) => updateMiscRow(row.id, "hrs", e.target.value)}
                    />
                  </div>
                  <div className="flex md:justify-center md:pt-5">
                    <button onClick={() => removeMiscRow(row.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1 shrink-0" aria-label="Remove miscellaneous activity row">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={addMiscRow}
            className="text-corporateBlue hover:text-corporateBlue-dark transition-colors font-semibold text-sm flex items-center gap-1.5 px-2"
          >
            <Plus size={16} strokeWidth={2.5} /> Add Miscellaneous Activity
          </button>
        </div>
      </div>

      <div className={`bg-slate-950 text-white border-t border-slate-800 p-5 sm:p-6 flex flex-col gap-6 rounded-b-md shadow-[0_-10px_30px_-15px_rgba(15,23,42,0.35)] transition-all ${footerPulse ? "ring-1 ring-corporateBlue/40" : ""}`}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_0.9fr] gap-5 items-center">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Total monthly effort</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-semibold leading-none tabular-nums ${aggregateMonthlyEffort > standardHours * 1.05 || aggregateMonthlyEffort < standardHours * 0.8 ? "text-amber-300" : "text-white"}`}>
                {aggregateMonthlyEffort.toFixed(2)}
              </span>
              <span className="text-sm text-slate-400">hrs / month</span>
            </div>
            <p className={`text-xs ${aggregateMonthlyEffort > standardHours * 1.05 || aggregateMonthlyEffort < standardHours * 0.8 ? "text-amber-300" : "text-slate-400"}`}>
              {aggregateMonthlyEffort > standardHours * 1.05
                ? `Above standard by ${(aggregateMonthlyEffort - standardHours).toFixed(1)}h`
                : aggregateMonthlyEffort < standardHours * 0.8
                  ? `Below standard by ${(standardHours - aggregateMonthlyEffort).toFixed(1)}h`
                  : "Within expected range"}
            </p>
          </div>

          <div className="flex items-center justify-start gap-3 rounded-md border border-slate-800 bg-slate-900/80 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Summary bar</p>
              <p className="text-sm font-medium text-slate-100">Live calculation active and standard hours locked to {standardHours} hrs.</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900/80 px-4 py-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-1">Utilization</p>
              <div className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${utilizationBand === "over" ? "bg-amber-500/15 text-amber-300" : utilizationBand === "healthy" ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-200"}`}>
                {utilizationLabel}
              </div>
            </div>
            <div
              className="relative flex h-14 w-14 items-center justify-center"
              style={{
                background: `conic-gradient(${utilizationBand === "over" ? "#F59E0B" : utilizationBand === "healthy" ? "#10B981" : "#475569"} ${Math.min(utilization, 100)}%, rgba(148,163,184,0.2) 0)`
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-[11px] font-semibold tabular-nums text-white">
                {utilization.toFixed(0)}%
              </div>
=======
          
          <div className="w-full mb-6">
            <div className="flex text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-3 px-2">
              <div className="flex-1">Activity Description</div>
              <div className="w-48 text-center pr-12">Time Taken (Hrs/Month)</div>
            </div>
            
            <div className="space-y-3">
              {miscRows.map((row, index) => {
                const currentRow = watchMiscRows[index] || {};
                return (
                  <div key={row.id} className="flex flex-col gap-2 mb-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 relative">
                        <textarea 
                            className="w-full bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-700 outline-none focus:border-corporateBlue resize-none shadow-sm h-16"
                            placeholder="Ad-hoc meetings, administrative filing, or unique seasonal tasks... (Click outside to AI Map)"
                            {...register(`miscRows.${index}.description`)}
                            onBlur={(e) => mapActivityWithAI(index, e.target.value)}
                        ></textarea>
                        {currentRow.isMapping && (
                          <div className="absolute top-4 right-4 text-corporateBlue bg-blue-50 px-2 py-1 rounded animate-pulse flex items-center gap-1 text-xs font-bold">
                            <Sparkles size={14} /> Analyzing...
                          </div>
                        )}
                      </div>
                      <div className="w-48 flex items-start gap-4">
                        <div className="relative w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-corporateBlue opacity-50">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <input 
                              type="number" 
                              className="w-full bg-white border border-slate-200 rounded-lg p-4 pl-12 text-lg font-bold text-slate-900 outline-none focus:border-corporateBlue shadow-sm h-16" 
                              {...register(`miscRows.${index}.hrs`, { valueAsNumber: true })}
                            />
                        </div>
                        <button onClick={() => removeMisc(index)} className="text-slate-400 hover:text-red-500 transition-colors mt-5 p-1 shrink-0">
                            <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    {/* AI Suggestion UI */}
                    {currentRow.aiSuggestion && currentRow.aiSuggestion.matchedActivity && (
                      <div className="ml-1 flex items-start gap-3 bg-indigo-50 border border-indigo-100 p-3 rounded-lg mr-[14rem]">
                        <Sparkles size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-indigo-900">AI Suggested Mapping:</span>
                            <span className="text-sm font-semibold text-indigo-700">{currentRow.aiSuggestion.matchedActivity.name}</span>
                            {currentRow.aiSuggestion.confidence === 'high' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">High Match</span>}
                            {currentRow.aiSuggestion.confidence === 'medium' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Med Match</span>}
                            {currentRow.aiSuggestion.confidence === 'low' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Low Match</span>}
                          </div>
                          <p className="text-xs text-indigo-600 mb-2">{currentRow.aiSuggestion.reason}</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => acceptAiSuggestion(index, currentRow.aiSuggestion!.matchedActivity!.name)} className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition">Accept Suggestion</button>
                            <button onClick={() => setValue(`miscRows.${index}.aiSuggestion`, null)} className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-50 transition">Dismiss</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {currentRow.aiSuggestion && !currentRow.aiSuggestion.matchedActivity && (
                      <div className="ml-1 flex items-center gap-2 text-xs font-medium text-slate-500 mr-[14rem] px-3 py-1">
                        <Sparkles size={12} /> No strong AI matches found in standard inventory.
                        <button onClick={() => setValue(`miscRows.${index}.aiSuggestion`, null)} className="ml-2 hover:text-slate-700"><X size={12}/></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
             onClick={addMiscRow}
             className="text-corporateBlue hover:text-corporateBlue-dark transition-colors font-bold text-sm flex items-center gap-1.5 px-2"
          >
             <Plus size={16} strokeWidth={3} /> Add Miscellaneous Activity
          </button>
        </div>

      </div>

      {/* Modern Calculation Footer Anchor */}
      <div className="bg-white border-t border-slate-200 p-6 px-10 flex items-center justify-between rounded-b-xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-8 border-r border-slate-200 pr-8">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Monthly Effort</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-corporateBlue leading-none">{aggregateMonthlyEffort.toFixed(2)}</span>
              <span className="text-sm font-bold text-slate-500 mb-0.5">hrs / month</span>
>>>>>>> target/main
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end">
          <button
            onClick={onPrev}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={handleNext}
            className="bg-corporateBlue hover:bg-corporateBlue-dark text-white font-semibold py-3 px-6 rounded-md shadow-md transition-colors flex items-center gap-2"
=======
        <div className="flex-1 px-8 flex items-center gap-6">
           <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full inline-flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-extrabold uppercase tracking-widest">Live Calculation Active</span>
           </div>

           <div className="flex flex-col items-center border-l border-slate-100 pl-6">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mb-1">Utilization Score</p>
              <div className={`text-xl font-black ${utilization > 100 ? 'text-amber-500' : utilization > 80 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {utilization.toFixed(1)}%
              </div>
           </div>

           <div className="flex flex-col items-start border-l border-slate-100 pl-6 group relative">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Standard Hours</p>
                <HelpCircle size={10} className="text-slate-300" />
              </div>
              <div className="flex items-center gap-2">
                {isEditingStd ? (
                  <input 
                    type="number"
                    autoFocus
                    className="w-16 bg-slate-50 border border-slate-300 rounded text-sm font-bold text-slate-900 px-1 py-0.5 outline-none focus:border-corporateBlue"
                    value={standardHours}
                    onChange={(e) => setStandardHours(Number(e.target.value))}
                    onBlur={() => setIsEditingStd(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingStd(false)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{standardHours} hrs</span>
                    <button 
                      onClick={() => setIsEditingStd(true)}
                      className="text-slate-300 hover:text-corporateBlue transition-colors"
                      title="Edit Standard Hours (Admin Only)"
                    >
                      <Settings2 size={12} />
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onPrev}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button 
            onClick={onNext}
            className="bg-corporateBlue hover:bg-corporateBlue-dark text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
>>>>>>> target/main
          >
            Next: Review & Submit <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
<<<<<<< HEAD

function buildPayload(departmentId: string, processRows: ProcessRowData[], miscRows: MiscTaskData[]): WdtPayload {
  const now = new Date();

  const processActivities = processRows
    .filter((row) => row.activityId && parseNum(row.vol) > 0 && parseNum(row.hrs) > 0)
    .map((row) => ({
      activity: row.activityId,
      volumeMonthly: parseNum(row.vol),
      timePerTransaction: (parseNum(row.hrs) * 60) / parseNum(row.vol),
    }));

  const customActivities = miscRows
    .filter((row) => row.description.trim() && parseNum(row.vol) > 0 && parseNum(row.hrs) > 0)
    .map((row) => ({
      isCustom: true,
      customText: row.description.trim(),
      aiMappedActivity: row.suggestionActivityId,
      mappingAccepted: Boolean(row.suggestionActivityId),
      volumeMonthly: parseNum(row.vol),
      timePerTransaction: (parseNum(row.hrs) * 60) / parseNum(row.vol),
    }));

  return {
    department: departmentId,
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    overtimeHours: 0,
    activities: [...processActivities, ...customActivities],
  };
}

function validateRows(processRows: ProcessRowData[], miscRows: MiscTaskData[]): ValidationResult {
  const errors: string[] = [];

  processRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    if (!row.towerId || !row.processId || !row.activityId) {
      errors.push(`Process row ${rowNum}: tower, process and activity are required.`);
    }

    const vol = parseNum(row.vol);
    const hrs = parseNum(row.hrs);
    if (!Number.isFinite(vol) || !Number.isFinite(hrs)) {
      errors.push(`Process row ${rowNum}: volume and hours must be numeric.`);
    }
    if (vol <= 0 || hrs <= 0) {
      errors.push(`Process row ${rowNum}: volume and hours must be greater than 0.`);
    }
  });

  miscRows.forEach((row, idx) => {
    const rowNum = idx + 1;
    const hasAny = row.description.trim() || row.vol || row.hrs;
    if (!hasAny) return;

    if (!row.description.trim()) {
      errors.push(`Misc row ${rowNum}: description is required.`);
    }

    const vol = parseNum(row.vol);
    const hrs = parseNum(row.hrs);
    if (!Number.isFinite(vol) || !Number.isFinite(hrs)) {
      errors.push(`Misc row ${rowNum}: volume and hours must be numeric.`);
    }
    if (vol <= 0 || hrs <= 0) {
      errors.push(`Misc row ${rowNum}: volume and hours must be greater than 0.`);
    }
  });

  return { ok: errors.length === 0, errors };
}

function findByActivityName(
  tree: TowerNode[],
  activityName: string
): { towerId: string; processId: string; activityId: string; towerName: string; processName: string; activityName: string } | null {
  const normalized = activityName.trim().toLowerCase();
  if (!normalized) return null;

  for (const tower of tree) {
    for (const process of tower.processes || []) {
      const activity = (process.activities || []).find((a) => a.name.trim().toLowerCase() === normalized);
      if (activity) {
        return {
          towerId: tower._id,
          processId: process._id,
          activityId: activity._id,
          towerName: tower.name,
          processName: process.name,
          activityName: activity.name,
        };
      }
    }
  }

  return null;
}
=======
>>>>>>> target/main
