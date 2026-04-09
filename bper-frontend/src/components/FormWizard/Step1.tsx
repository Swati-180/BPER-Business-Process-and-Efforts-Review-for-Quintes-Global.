<<<<<<< HEAD
import { useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, AlertTriangle } from "lucide-react";
import { apiGet } from "../../api/http";
=======
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
>>>>>>> target/main

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function Step1({ onNext, onPrev }: StepProps) {
<<<<<<< HEAD
  const [me, setMe] = useState<{
    _id: string;
    name: string;
    email: string;
    grade?: string;
    title?: string;
    location?: string;
    tower?: string;
    managerName?: string;
    managerTitle?: string;
    department?: { name?: string } | string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<{
          _id: string;
          name: string;
          email: string;
          grade?: string;
          title?: string;
          location?: string;
          tower?: string;
          managerName?: string;
          managerTitle?: string;
          department?: { name?: string } | string;
        }>("/auth/me");
        setMe(data);
      } catch {
        setMe(null);
      }
    };
    void load();
  }, []);

  const fieldClass = "space-y-1.5";
  const labelClass = "text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500";
  const valueClass = "text-[15px] font-medium text-slate-900";
  const employeeIdValue = me?._id ? me._id.toUpperCase() : "-";

  return (
    <div className="bg-white rounded-b-md border-x border-b border-slate-200 shadow-sm p-8 sm:p-10 font-sans">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 mb-2">Verified profile snapshot</p>
          <h2 className="text-2xl font-semibold text-slate-900">Employee Verification</h2>
        </div>
        <p className="max-w-2xl text-sm text-slate-500 leading-relaxed">
          Review your read-only profile before entering process data. These fields are pulled from master records and should match your institutional profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-10 gap-y-7 mb-10">
        <div className={fieldClass}>
          <p className={labelClass}>Employee ID</p>
          <p className={`${valueClass} font-mono tabular-nums break-all`}>{employeeIdValue}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Name</p>
          <p className={valueClass}>{me?.name || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Institutional Email</p>
          <p className={valueClass}>{me?.email || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Title</p>
          <p className={valueClass}>{me?.title || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Department</p>
          <p className={valueClass}>{typeof me?.department === "string" ? me.department : me?.department?.name || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Primary Location</p>
          <p className={valueClass}>{me?.location || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Primary Tower / Function</p>
          <p className={valueClass}>{me?.tower || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Pay Band / Grade</p>
          <p className={`${valueClass} font-mono tabular-nums`}>{me?.grade ? `Grade ${me.grade}` : "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Supervisor Name</p>
          <p className={valueClass}>{me?.managerName || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Supervisor Title</p>
          <p className={valueClass}>{me?.managerTitle || "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Employee Type</p>
          <p className={`${valueClass} text-corporateBlue`}>{me ? "From employee profile" : "-"}</p>
        </div>
        <div className={fieldClass}>
          <p className={labelClass}>Assigned Client</p>
          <p className={valueClass}>{typeof me?.department === "string" ? me.department : me?.department?.name || "-"}</p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="mailto:bper-support@company.com?subject=BPER%20Profile%20Discrepancy"
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800"
        >
          <AlertTriangle size={16} /> Report a discrepancy
        </a>
=======
  const { user } = useAuth();
  return (
    <div className="bg-white rounded-b-xl border-x border-b border-slate-200 shadow-sm p-10 font-sans">
      <div className="mb-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Employee Verification</h2>
        <p className="text-slate-500 max-w-3xl leading-relaxed">
          Confirm the institutional identity of the resource being audited. These details are pulled from the Sovereign Ledger core records and are read-only for this filing session.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-16 mb-12">
        {/* ROW 1 */}
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Employee ID</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">🛡️</div>
            <p className="font-bold text-lg text-slate-900">BPER-{user?._id?.slice(-4)?.toUpperCase() || '7729'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Name</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">👤</div>
            <p className="font-bold text-lg text-slate-900">{user?.name || 'Jonathan Vance-Sterling'}</p>
          </div>
        </div>

        {/* ROW 2 */}
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Institutional Email</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">@</div>
            <p className="font-bold text-lg text-slate-900">{user?.email || 'j.sterling@sovereign-ledger.int'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Title</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">💼</div>
            <p className="font-bold text-lg text-slate-900">{(user as any)?.title || 'Sr. Workforce Strategist'}</p>
          </div>
        </div>

        {/* ROW 3 */}
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Assigned Client</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">🏢</div>
            <p className="font-bold text-lg text-slate-900">BPER Bank (Global)</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Primary Location</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">📍</div>
            <p className="font-bold text-lg text-slate-900">Mumbai - BKC Finance Hub</p>
          </div>
        </div>

        {/* ROW 4 - NEW FIELDS */}
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Department</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">🏛️</div>
            <p className="font-bold text-lg text-slate-900">Finance & Accounting</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Primary Tower / Function</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">🗼</div>
            <p className="font-bold text-lg text-slate-900">Accounts Payable</p>
          </div>
        </div>

        {/* ROW 5 */}
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Pay Band / Grade</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">📈</div>
            <span className="inline-block bg-slate-100 text-slate-700 text-sm font-bold px-3 py-1.5 rounded uppercase tracking-wide">
              Grade L4 (Professional)
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Employee Type</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">📄</div>
            <span className="inline-block bg-blue-50 text-corporateBlue border border-blue-100 text-sm font-bold px-3 py-1.5 rounded tracking-wide">
              Full-Time (Indeterminate)
            </span>
          </div>
        </div>

        {/* ROW 5 */}
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Supervisor Name</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">🧑‍💼</div>
            <p className="font-bold text-lg text-slate-900">{(user as any)?.reportingTo?.name || 'Dr. Helena Rossi'}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-3">Supervisor Title</p>
          <div className="flex items-center gap-3">
            <div className="text-slate-400">✔️</div>
            <p className="font-bold text-lg text-slate-900">{(user as any)?.reportingTo?.title || 'Chief of Operations'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8 flex items-center justify-between">
>>>>>>> target/main
        <button 
          onClick={onPrev}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
        <button 
          onClick={onNext}
<<<<<<< HEAD
          className="bg-corporateBlue hover:bg-corporateBlue-light text-white font-semibold py-3 px-6 rounded-md transition-colors flex items-center gap-2 shadow-sm"
        >
          Confirm & Continue <ArrowRight size={18} />
=======
          className="bg-corporateBlue hover:bg-corporateBlue-light text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
        >
          Next: Process Details <ArrowRight size={18} />
>>>>>>> target/main
        </button>
      </div>
    </div>
  );
}
