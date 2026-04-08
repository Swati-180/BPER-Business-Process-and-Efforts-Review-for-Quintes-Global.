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

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

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
        </div>
      </div>

      {/* Main Container */}
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
          </div>
        </div>

        {/* Step Content */}
        <div className="relative -mt-px w-full z-0">
          {currentStep === 1 && <Step1 onNext={handleNext} onPrev={() => alert('Returning to Dashboard...')} />}
          {currentStep === 2 && <Step2 onNext={handleNext} onPrev={handlePrev} />}
          {currentStep === 3 && <Step3 onPrev={handlePrev} onSubmit={handleSubmit} />}
        </div>
      </div>

       <div className="text-center mt-12 mb-8">
         <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sovereign Ledger Institutional Protocol © 2026</p>
       </div>
    </div>
    </FormProvider>
  );
}
