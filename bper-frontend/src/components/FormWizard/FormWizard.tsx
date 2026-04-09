<<<<<<< HEAD
import { useEffect, useState } from "react";
import { CheckCircle2, Download, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import { apiGet, apiPost } from "../../api/http";
import type { SubmissionWindow } from "../../types/submissionWindow";
import { ErrorFallbackState, LoadingState } from "../PageStates";

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

export function FormWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [focusSection, setFocusSection] = useState<"core" | "support" | null>(null);
  const [submissionWindow, setSubmissionWindow] = useState<SubmissionWindow | null>(null);
  const [payload, setPayload] = useState<WdtPayload | null>(null);
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
=======
import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { Step1 } from "./Step1";
import { Step2 } from "./Step2";
import { Step3 } from "./Step3";
import api from "../../services/api";
import toast from "react-hot-toast";
  // zodResolver temporarily commented - deps issue
  // import { zodResolver } from '@hookform/resolvers/zod';
  const zodResolver = (schema: any) => schema;
import { formSchema } from './validation';
import { useSubmissionWindow } from '../../queries/settings';

export function FormWizard() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const methods = useForm({
    defaultValues: {
      processRows: [],
      miscRows: [],
      month: new Date().toLocaleDateString('en', { month: 'short', year: 'numeric' }),
      year: new Date().getFullYear(),
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(formSchema)
  });

  // Watch for changes to trigger autosave
  const formValues = useWatch({ control: methods.control });

  useEffect(() => {
    const handler = setTimeout(() => {
      saveDraft(formValues);
    }, 2000); // 2 second debounce
    return () => clearTimeout(handler);
  }, [formValues]);

  const saveDraft = async (data: any) => {
    try {
      setIsSaving(true);
      // Format data for backend
      const activities = [
        ...data.processRows.map((r: any) => ({
          customName: `${r.majorProcess} - ${r.process} - ${r.subProcess}`,
          volume: r.vol,
          hours: r.hrs,
          applicationUsed: r.appUsed
        })),
        ...data.miscRows.filter((r: any) => r.description).map((r: any) => ({
          customName: r.description,
          volume: 1,
          hours: r.hrs,
          applicationUsed: ''
        }))
      ];
      
      await api.post('/api/eper/wdt/draft', {
        month: data.month,
        year: data.year,
        department: (user as any)?.department?._id || "650000000000000000000000",
        activities
      });
      setLastSaved(new Date());
    } catch (err) {
      console.error("Draft save failed", err);
    } finally {
      setIsSaving(false);
    }
  };
>>>>>>> target/main

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

<<<<<<< HEAD
  const handleSubmit = async () => {
    if (submissionWindow && !submissionWindow.isOpen) return;
    if (!payload || payload.activities.length === 0) return;

    setIsSubmitting(true);
    try {
      await apiPost("/eper/wdt/submit", payload);
      setSubmittedCount(payload.activities.length);
      setShowSuccessOverlay(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!payload || payload.activities.length === 0) return;
    setAutosaveState("saving");
    try {
      await apiPost("/eper/wdt/draft", payload);
      setAutosaveState("saved");
      setLastSavedAt(new Date());
    } catch {
      setAutosaveState("error");
    }
  };

  useEffect(() => {
    const loadWindow = async () => {
      try {
        const data = await apiGet<SubmissionWindow>("/admin/submission-window");
        setSubmissionWindow(data);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load submission window.");
        setSubmissionWindow(null);
      } finally {
        setLoading(false);
      }
    };

    void loadWindow();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!payload || payload.activities.length === 0) return;

      setAutosaveState("saving");
      void apiPost("/eper/wdt/draft", payload)
        .then(() => {
          setAutosaveState("saved");
          setLastSavedAt(new Date());
        })
        .catch(() => setAutosaveState("error"));
    }, 30000);

    return () => window.clearInterval(timer);
  }, [payload]);

  const submissionsClosed = submissionWindow ? !submissionWindow.isOpen : false;
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const formPeriodLabel = `Q${quarter} ${now.getFullYear()}`;
  const autosaveLabel =
    autosaveState === "saved" && lastSavedAt
      ? `Saved at ${lastSavedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
      : autosaveState === "saving"
        ? "Saving..."
        : autosaveState === "error"
          ? "Save failed"
          : "No changes yet";

  const handleEditSection = (section: "core" | "support") => {
    setFocusSection(section);
    setCurrentStep(2);
  };

  const handleDownloadPdfSummary = () => {
    window.print();
  };

  if (loading) {
    return <LoadingState title="Loading form wizard" message="Preparing submission window and form session." />;
  }

  if (error) {
    return <ErrorFallbackState title="Form unavailable" message={error} />;
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-16 min-h-screen">
      {/* Wizard Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-7">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Quarterly filing</p>
            <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Lock size={11} className="text-corporateBlue" /> Secured entry
            </span>
          </div>
          <h1 className="text-3xl sm:text-[2.15rem] font-semibold text-slate-900 tracking-tight">BPER Form - {formPeriodLabel}</h1>
=======
  const handleSubmit = async (data: any) => {
    const isValid = await methods.trigger();
    if (!isValid) return toast.error('Please fix form errors');
    
    if (!submissionWindow.isOpen) return toast.error('Submission window closed');
    
    try {
      const activities = [
        ...data.processRows.map((r: any) => ({
          customName: `${r.majorProcess} - ${r.process} - ${r.subProcess}`,
          volume: r.vol,
          hours: r.hrs,
          applicationUsed: r.appUsed
        })),
        ...data.miscRows.filter((r: any) => r.description).map((r: any) => ({
          customName: r.description,
          volume: 1,
          hours: r.hrs,
          applicationUsed: ''
        }))
      ];
      
      await api.post('/api/eper/wdt/submit', {
        month: data.month,
        year: data.year,
        department: (user as any)?.department?._id || "650000000000000000000000",
        activities
      });
      toast.success("Form submitted successfully!");
      methods.reset();
      setCurrentStep(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit form");
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-6xl mx-auto w-full pt-8 pb-16 min-h-screen">
      {/* Wizard Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-2">QUARTERLY FILING</p>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">BPER Form - Q1 2026</h1>
        </div>
        <div className="bg-blue-50 text-corporateBlue font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg border border-blue-100 flex items-center gap-2 shadow-sm">
          <Lock size={14} /> Secured Entry
>>>>>>> target/main
        </div>
      </div>

      {/* Main Container */}
<<<<<<< HEAD
      <div className="w-full relative shadow-sm rounded-md">
        {submissionsClosed && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 font-medium px-4 py-3 rounded-md">
            Submissions are closed
          </div>
        )}
        
        {/* Stepper Header */}
        <div className="bg-white rounded-t-md border border-slate-200 px-4 py-4 sm:px-6 flex items-center justify-between shadow-sm relative z-10 gap-4">
          <div className="overflow-x-auto w-full">
            <div className="flex items-center gap-6 min-w-[700px] px-1 sm:px-2">
            
            {/* Step 1 */}
            <div className={`flex items-center gap-3 ${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold ${currentStep >= 1 ? 'bg-corporateBlue text-white' : 'bg-slate-100 text-slate-500'}`}>
                1
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${currentStep >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>Employee Details</span>
            </div>

            {/* Divider */}
            <div className={`h-px w-14 ${currentStep >= 2 ? 'bg-corporateBlue' : 'bg-slate-200'}`}></div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 ${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
               <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold ${currentStep >= 2 ? 'bg-corporateBlue text-white' : 'bg-slate-100 text-slate-500'}`}>
                2
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>Process Details</span>
            </div>

            {/* Divider */}
             <div className={`h-px w-14 ${currentStep >= 3 ? 'bg-corporateBlue' : 'bg-slate-200'}`}></div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 ${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
               <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-semibold ${currentStep >= 3 ? 'bg-corporateBlue-dark text-white' : 'bg-slate-100 text-slate-500'}`}>
                3
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${currentStep >= 3 ? 'text-slate-900' : 'text-slate-500'}`}>Review</span>
            </div>

            </div>
          </div>

          {/* AutoSaved Status */}
          <div className="hidden md:flex md:items-center gap-2 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.18em] pl-4 border-l border-slate-200">
            {autosaveLabel}
            <div className={`w-1.5 h-1.5 rounded-full ${autosaveState === "error" ? "bg-red-500" : "bg-green-500"}`}></div>
=======
      <div className="w-full relative shadow-sm rounded-xl">
        
        {/* Stepper Header */}
        <div className="bg-white rounded-t-xl border border-slate-200 p-6 flex items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-8 w-full max-w-2xl px-4">
            
            {/* Step 1 */}
            <div className={`flex items-center gap-3 \${currentStep >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold \${currentStep >= 1 ? 'bg-corporateBlue text-white' : 'bg-slate-100 text-slate-500'}`}>
                1
              </div>
              <span className={`text-sm font-bold \${currentStep >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>Employee Details</span>
            </div>

            {/* Divider */}
            <div className={`h-px w-16 \${currentStep >= 2 ? 'bg-corporateBlue' : 'bg-slate-200'}`}></div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 \${currentStep >= 2 ? 'opacity-100' : 'opacity-40'}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold \${currentStep >= 2 ? 'bg-corporateBlue text-white' : 'bg-slate-100 text-slate-500'}`}>
                2
              </div>
              <span className={`text-sm font-bold \${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>Process Details</span>
            </div>

            {/* Divider */}
             <div className={`h-px w-16 \${currentStep >= 3 ? 'bg-corporateBlue' : 'bg-slate-200'}`}></div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 \${currentStep >= 3 ? 'opacity-100' : 'opacity-40'}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold \${currentStep >= 3 ? 'bg-corporateBlue-dark text-white' : 'bg-slate-100 text-slate-500'}`}>
                3
              </div>
              <span className={`text-sm font-bold \${currentStep >= 3 ? 'text-slate-900' : 'text-slate-500'}`}>Review</span>
            </div>

          </div>

          {/* AutoSaved Status */}
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-4 border-l border-slate-200 hidden md:flex">
             {isSaving ? (
               <>Saving <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div></>
             ) : lastSaved ? (
               <>Autosaved {lastSaved.toLocaleTimeString()} <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div></>
             ) : (
               <>Draft mode <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div></>
             )}
>>>>>>> target/main
          </div>
        </div>

        {/* Step Content */}
        <div className="relative -mt-px w-full z-0">
<<<<<<< HEAD
          {currentStep === 1 && <Step1 onNext={handleNext} onPrev={() => navigate('/dashboard')} />}
          {currentStep === 2 && (
            <Step2
              onNext={handleNext}
              onPrev={handlePrev}
              onPayloadChange={(nextPayload) => {
                setPayload(nextPayload);
                if (nextPayload?.activities?.length) {
                  setAutosaveState("idle");
                }
              }}
              focusSection={focusSection}
            />
          )}
          {currentStep === 3 && (
            <Step3
              onPrev={handlePrev}
              onSubmit={() => void handleSubmit()}
              onSaveDraft={() => void handleSaveDraft()}
              onEditSection={handleEditSection}
              submitDisabled={submissionsClosed || isSubmitting}
            />
          )}
        </div>
      </div>

      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-md shadow-2xl border border-slate-200 p-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mb-4">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Submission Confirmed</h3>
            <p className="text-slate-600 mb-6">
              Your BPER filing has been submitted successfully with {submittedCount} activity entries.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadPdfSummary}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-4 rounded-md inline-flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download PDF Summary
              </button>
              <button
                onClick={() => navigate("/form-status")}
                className="bg-corporateBlue hover:bg-corporateBlue-dark text-white font-semibold py-3 px-4 rounded-md"
              >
                Go to Form Status
              </button>
            </div>
          </div>
        </div>
      )}

=======
          {currentStep === 1 && <Step1 onNext={handleNext} onPrev={() => alert('Returning to Dashboard...')} />}
          {currentStep === 2 && <Step2 onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <Step3 onPrev={handlePrev} onSubmit={handleSubmit} />}
        </div>
      </div>

>>>>>>> target/main
       <div className="text-center mt-12 mb-8">
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sovereign Ledger Institutional Protocol © 2026</p>
       </div>
    </div>
<<<<<<< HEAD
=======
    </FormProvider>
>>>>>>> target/main
  );
}
