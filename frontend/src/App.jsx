import React, { useState, useEffect } from 'react';
import {
  Building2, ShieldAlert, ShieldCheck, AlertCircle, BarChart3,
  Layers, CheckCircle2, TrendingUp, DollarSign, UserCheck,
  HelpCircle, RefreshCw, ChevronRight, Server, Globe,
  Activity, Users, CreditCard, Target, ArrowUpRight,
  FileText, Zap, Lock, Award, ChevronDown
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// ─── Reusable UI Components ───────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = false, icon: Icon, trend }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3" />{trend}
          </span>
        )}
      </div>
      <div>
        <div className={`text-2xl font-bold tracking-tight ${accent ? 'text-blue-600' : 'text-slate-900'}`}>{value}</div>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function SectionLabel({ number, label }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{number}</span>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function FormField({ label, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      {children}
      {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition placeholder:text-slate-300 text-slate-800";

function RangeInput({ label, name, min, max, step, value, onChange, formatFn }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <FormField label={`${label}: ${formatFn ? formatFn(value) : value}`}>
      <div className="relative pt-1">
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          step={step || 1}
          value={value}
          onChange={onChange}
          className="w-full h-1.5 rounded-full appearance-none bg-slate-200 accent-blue-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
          <span>{formatFn ? formatFn(min) : min}</span>
          <span>{formatFn ? formatFn(max) : max}</span>
        </div>
      </div>
    </FormField>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [models, setModels] = useState(['Random Forest', 'Logistic Regression', 'Decision Tree', 'AdaBoost']);
  const [metrics, setMetrics] = useState(null);
  const [datasetSummary, setDatasetSummary] = useState(null);
  const [apiConnected, setApiConnected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    Age: 38,
    Income: 75000,
    LoanAmount: 30000,
    CreditScore: 660,
    MonthsEmployed: 42,
    NumCreditLines: 3,
    InterestRate: 11.5,
    LoanTerm: 36,
    DTIRatio: 0.35,
    Education: "Bachelor's",
    EmploymentType: "Full-time",
    MaritalStatus: "Married",
    HasMortgage: "No",
    HasDependents: "No",
    LoanPurpose: "Home",
    HasCoSigner: "Yes",
    model_name: "Random Forest"
  });

  const [predictionResult, setPredictionResult] = useState(null);

  useEffect(() => {
    checkHealthAndFetch();
  }, []);

  const checkHealthAndFetch = async () => {
    try {
      const res = await fetch(`${API_BASE}/`);
      if (res.ok) {
        setApiConnected(true);
        const mRes = await fetch(`${API_BASE}/metrics`);
        if (mRes.ok) setMetrics(await mRes.json());
        const sRes = await fetch(`${API_BASE}/dataset-summary`);
        if (sRes.ok) setDatasetSummary(await sRes.json());
        const modRes = await fetch(`${API_BASE}/models`);
        if (modRes.ok) {
          const modData = await modRes.json();
          if (modData.available_models?.length) setModels(modData.available_models);
        }
      } else {
        setApiConnected(false);
      }
    } catch (e) {
      setApiConnected(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
  };

  const loadPreset = (presetType) => {
    const presets = {
      low: {
        Age: 48, Income: 125000, LoanAmount: 35000, CreditScore: 785,
        MonthsEmployed: 84, NumCreditLines: 2, InterestRate: 6.5,
        LoanTerm: 36, DTIRatio: 0.22, Education: "Master's",
        EmploymentType: "Full-time", MaritalStatus: "Married",
        HasMortgage: "Yes", HasDependents: "Yes",
        LoanPurpose: "Home", HasCoSigner: "Yes", model_name: formData.model_name
      },
      medium: {
        Age: 35, Income: 62000, LoanAmount: 40000, CreditScore: 615,
        MonthsEmployed: 28, NumCreditLines: 3, InterestRate: 14.0,
        LoanTerm: 36, DTIRatio: 0.44, Education: "Bachelor's",
        EmploymentType: "Full-time", MaritalStatus: "Single",
        HasMortgage: "No", HasDependents: "Yes",
        LoanPurpose: "Auto", HasCoSigner: "No", model_name: formData.model_name
      },
      high: {
        Age: 23, Income: 22000, LoanAmount: 75000, CreditScore: 450,
        MonthsEmployed: 4, NumCreditLines: 4, InterestRate: 24.5,
        LoanTerm: 60, DTIRatio: 0.79, Education: "High School",
        EmploymentType: "Unemployed", MaritalStatus: "Single",
        HasMortgage: "No", HasDependents: "No",
        LoanPurpose: "Business", HasCoSigner: "No", model_name: formData.model_name
      }
    };
    setFormData(presets[presetType]);
    setPredictionResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setPredictionResult(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Prediction failed');
      }
      setPredictionResult(await res.json());
    } catch (err) {
      setErrorMsg(`API Error: ${err.message}. Ensure the FastAPI backend is running on ${API_BASE}`);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'predict', icon: ShieldCheck, label: 'Risk Predictor' },
    { id: 'models', icon: BarChart3, label: 'Model Benchmarks' },
    { id: 'dataset', icon: Layers, label: 'Dataset Overview' },
    { id: 'deploy', icon: Globe, label: 'Deployment Guide' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fb] flex flex-col font-sans">

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-200">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-slate-900 leading-none whitespace-nowrap">LoanRisk <span className="text-blue-600">AI</span></span>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5 whitespace-nowrap hidden sm:block">Enterprise ML Underwriting Engine</p>
            </div>
          </div>

          {/* Nav tabs – hidden on small screens */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === t.id
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </nav>

          {/* Status + Refresh */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`hidden sm:flex items-center gap-2 text-[11px] font-semibold px-3 py-1.5 rounded-full border ${
              apiConnected === null
                ? 'bg-slate-50 text-slate-500 border-slate-200'
                : apiConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                apiConnected === null ? 'bg-slate-400' : apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              {apiConnected === null ? 'Connecting…' : apiConnected ? 'API Online' : 'API Offline'}
            </div>
            <button
              onClick={checkHealthAndFetch}
              title="Refresh connection"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="md:hidden flex overflow-x-auto border-t border-slate-100 px-2 gap-0.5">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                activeTab === t.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Page Hero ────────────────────────────────────────────────────────── */}
      {activeTab === 'predict' && (
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white">
          <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-200" />
                <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Real-time Inference</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Loan Default Risk Assessment</h1>
              <p className="text-blue-200 text-sm mt-1 max-w-xl">AI-powered underwriting engine — instantly predict default probability using 4 trained ML models on 255K+ applicant records.</p>
            </div>
            <div className="flex gap-2">
              {[
                { label: 'Prime', color: 'bg-white/20 hover:bg-white/30 text-white', preset: 'low' },
                { label: 'Moderate', color: 'bg-amber-400/90 hover:bg-amber-400 text-amber-900', preset: 'medium' },
                { label: 'High Risk', color: 'bg-rose-500/90 hover:bg-rose-500 text-white', preset: 'high' },
              ].map(p => (
                <button
                  key={p.preset}
                  type="button"
                  onClick={() => loadPreset(p.preset)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition backdrop-blur-sm ${p.color}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">

        {/* ════════════════ TAB 1: PREDICTION ══════════════════════════════════ */}
        {activeTab === 'predict' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ─ Left: Form ─ */}
            <div className="lg:col-span-7 space-y-4">

              {/* Card: Personal & Employment */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <SectionLabel number="1" label="Personal & Employment" />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <FormField label="Age (years)">
                    <input type="number" name="Age" min="18" max="100"
                      value={formData.Age} onChange={handleInputChange} required className={inputCls} />
                  </FormField>
                  <FormField label="Marital Status">
                    <select name="MaritalStatus" value={formData.MaritalStatus} onChange={handleInputChange} className={inputCls}>
                      <option value="Married">Married</option>
                      <option value="Single">Single</option>
                      <option value="Divorced">Divorced</option>
                    </select>
                  </FormField>
                  <FormField label="Education">
                    <select name="Education" value={formData.Education} onChange={handleInputChange} className={inputCls}>
                      <option value="High School">High School</option>
                      <option value="Bachelor's">Bachelor's</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <FormField label="Employment Type">
                    <select name="EmploymentType" value={formData.EmploymentType} onChange={handleInputChange} className={inputCls}>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Self-employed">Self-employed</option>
                      <option value="Unemployed">Unemployed</option>
                    </select>
                  </FormField>
                  <FormField label="Months Employed" hint="0 – 120 months">
                    <input type="number" name="MonthsEmployed" min="0" max="120"
                      value={formData.MonthsEmployed} onChange={handleInputChange} className={inputCls} />
                  </FormField>
                  <FormField label="Has Dependents?">
                    <select name="HasDependents" value={formData.HasDependents} onChange={handleInputChange} className={inputCls}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Card: Credit & Financial Health */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <SectionLabel number="2" label="Credit & Financial Health" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField label="Annual Income (USD)" hint="Gross annual earnings">
                    <input type="number" name="Income" step="1000" min="5000"
                      value={formData.Income} onChange={handleInputChange} required className={inputCls} placeholder="e.g. 75000" />
                  </FormField>
                  <FormField label="Number of Credit Lines" hint="Active credit accounts">
                    <input type="number" name="NumCreditLines" min="1" max="10"
                      value={formData.NumCreditLines} onChange={handleInputChange} className={inputCls} />
                  </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <RangeInput label="Credit Score" name="CreditScore" min={300} max={850}
                    value={formData.CreditScore} onChange={handleInputChange} />
                  <RangeInput label="DTI Ratio" name="DTIRatio" min={0.05} max={1.0} step={0.01}
                    value={formData.DTIRatio} onChange={handleInputChange}
                    formatFn={v => `${(parseFloat(v) * 100).toFixed(0)}%`} />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <FormField label="Existing Mortgage?">
                    <select name="HasMortgage" value={formData.HasMortgage} onChange={handleInputChange} className={inputCls}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </FormField>
                  <FormField label="Has Co-Signer?">
                    <select name="HasCoSigner" value={formData.HasCoSigner} onChange={handleInputChange} className={inputCls}>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Card: Loan Request & Model */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <SectionLabel number="3" label="Loan Request Details" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <FormField label="Loan Amount (USD)">
                    <input type="number" name="LoanAmount" step="1000" min="1000"
                      value={formData.LoanAmount} onChange={handleInputChange} required className={inputCls} />
                  </FormField>
                  <FormField label="Interest Rate (%)">
                    <input type="number" name="InterestRate" step="0.1" min="1" max="35"
                      value={formData.InterestRate} onChange={handleInputChange} className={inputCls} />
                  </FormField>
                  <FormField label="Term (Months)">
                    <select name="LoanTerm" value={formData.LoanTerm} onChange={handleInputChange} className={inputCls}>
                      {[12, 24, 36, 48, 60].map(t => <option key={t} value={t}>{t} mo</option>)}
                    </select>
                  </FormField>
                  <FormField label="Loan Purpose">
                    <select name="LoanPurpose" value={formData.LoanPurpose} onChange={handleInputChange} className={inputCls}>
                      {['Home', 'Auto', 'Business', 'Education', 'Other'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </FormField>
                </div>

                {/* Model selector */}
                <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Select ML Model</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {models.map(m => (
                      <label key={m} className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition text-xs font-semibold ${
                        formData.model_name === m
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'
                      }`}>
                        <input
                          type="radio"
                          name="model_name"
                          value={m}
                          checked={formData.model_name === m}
                          onChange={handleInputChange}
                          className="accent-blue-600"
                        />
                        {m}
                      </label>
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-100 transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /><span>Computing Underwriting Risk…</span></>
                    ) : (
                      <><span>Predict Default Risk</span><ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* ─ Right: Results ─ */}
            <div className="lg:col-span-5 space-y-5">

              {predictionResult ? (
                <>
                  {/* Result Hero */}
                  <div className={`rounded-2xl border p-6 text-center ${
                    predictionResult.risk_level === 'Low Risk'
                      ? 'bg-emerald-50 border-emerald-200'
                      : predictionResult.risk_level === 'Moderate Risk'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Underwriting Decision</div>
                    {predictionResult.risk_level === 'Low Risk' && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                          <ShieldCheck className="w-7 h-7 text-emerald-600" />
                        </div>
                        <span className="text-xl font-bold text-emerald-700">Approved</span>
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">LOW DEFAULT RISK</span>
                      </div>
                    )}
                    {predictionResult.risk_level === 'Moderate Risk' && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                          <AlertCircle className="w-7 h-7 text-amber-600" />
                        </div>
                        <span className="text-xl font-bold text-amber-700">Manual Review</span>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full">MODERATE RISK — REVIEW REQUIRED</span>
                      </div>
                    )}
                    {predictionResult.risk_level === 'High Risk' && (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                          <ShieldAlert className="w-7 h-7 text-rose-600" />
                        </div>
                        <span className="text-xl font-bold text-rose-700">Declined</span>
                        <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">HIGH DEFAULT RISK</span>
                      </div>
                    )}
                  </div>

                  {/* Probability Gauge */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-slate-700">Default Probability</span>
                      <span className={`text-2xl font-bold ${
                        predictionResult.default_probability < 35 ? 'text-emerald-600'
                          : predictionResult.default_probability < 60 ? 'text-amber-500'
                          : 'text-rose-600'
                      }`}>{predictionResult.default_probability}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          predictionResult.default_probability < 35 ? 'bg-emerald-500'
                            : predictionResult.default_probability < 60 ? 'bg-amber-400'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(predictionResult.default_probability, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5 font-semibold">
                      <span>0% · Safe</span>
                      <span>35% · Review</span>
                      <span>60%+ · Critical</span>
                    </div>
                  </div>

                  {/* Decision Summary */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />Decision Summary
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">{predictionResult.recommendation}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Activity className="w-3 h-3" />
                      Evaluated using <span className="font-semibold text-slate-500 ml-0.5">{predictionResult.model_used}</span>
                    </div>
                  </div>

                  {/* Risk & Positive Factors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                    {predictionResult.risk_factors?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-rose-100 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 uppercase tracking-wider mb-3">
                          <AlertCircle className="w-3.5 h-3.5" />Risk Factors
                        </div>
                        <ul className="space-y-2">
                          {predictionResult.risk_factors.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {predictionResult.positive_factors?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-emerald-100 p-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3">
                          <CheckCircle2 className="w-3.5 h-3.5" />Positive Factors
                        </div>
                        <ul className="space-y-2">
                          {predictionResult.positive_factors.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[480px] p-10 text-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Ready to Evaluate</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                      Choose a risk preset above or enter applicant details on the left, then click <strong className="text-slate-600">Predict Default Risk</strong>.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {[
                      { label: 'Prime Profile', desc: 'Score 785 · Income $125K', preset: 'low', color: 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' },
                      { label: 'Moderate Profile', desc: 'Score 615 · Income $62K', preset: 'medium', color: 'border-amber-200 text-amber-700 hover:bg-amber-50' },
                      { label: 'High-Risk Profile', desc: 'Score 450 · Income $22K', preset: 'high', color: 'border-rose-200 text-rose-700 hover:bg-rose-50' },
                    ].map(p => (
                      <button key={p.preset} onClick={() => loadPreset(p.preset)}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${p.color}`}>
                        <span>{p.label}</span>
                        <span className="text-slate-400 font-normal">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════ TAB 2: MODEL BENCHMARKS ════════════════════════════ */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Model Performance Benchmarks</h2>
                <p className="text-xs text-slate-500 mt-0.5">Evaluation results on stratified test split across 4 ML architectures.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                <Award className="w-3.5 h-3.5 text-blue-500" /> Live metrics from backend
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {metrics ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-5 py-3.5">Model</th>
                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Accuracy</th>
                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Precision</th>
                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Recall</th>
                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">F1-Score</th>
                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">ROC-AUC</th>
                        <th className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider px-4 py-3.5">Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {Object.entries(metrics).map(([name, m], idx) => (
                        <tr key={name} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-5 py-4 font-semibold text-slate-800 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${['bg-blue-500','bg-purple-500','bg-emerald-500','bg-amber-500'][idx % 4]}`} />
                            {name}
                          </td>
                          <td className="px-4 py-4 text-slate-600">{(m.accuracy * 100).toFixed(2)}%</td>
                          <td className="px-4 py-4 text-slate-600">{(m.precision * 100).toFixed(2)}%</td>
                          <td className="px-4 py-4 font-semibold text-blue-600">{(m.recall * 100).toFixed(2)}%</td>
                          <td className="px-4 py-4 text-slate-600">{m.f1_score.toFixed(4)}</td>
                          <td className="px-4 py-4">
                            <span className="font-bold text-emerald-600">{m.roc_auc.toFixed(4)}</span>
                          </td>
                          <td className="px-4 py-4 text-slate-400 text-xs">{m.file_size_mb || '< 1'} MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-sm flex flex-col items-center gap-3">
                  <Activity className="w-8 h-8 text-slate-300" />
                  <span>Metrics loading — ensure the backend is running.</span>
                </div>
              )}
            </div>

            {/* Feature Importances */}
            {metrics?.['Random Forest']?.top_features && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">Feature Importances (Random Forest)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-5">Relative contribution of each feature to model decisions during training.</p>
                <div className="space-y-3.5">
                  {Object.entries(metrics['Random Forest'].top_features).map(([feat, score]) => (
                    <div key={feat}>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                        <span>{feat}</span>
                        <span className="text-blue-600">{(score * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                          style={{ width: `${Math.min(score * 300, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════ TAB 3: DATASET OVERVIEW ════════════════════════════ */}
        {activeTab === 'dataset' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Dataset Overview</h2>
              <p className="text-xs text-slate-500 mt-0.5">Statistics and schema from the Loan Default training dataset.</p>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Records" value="255,347" sub="Applicant records in CSV" accent />
              <StatCard icon={AlertCircle} label="Default Rate" value="11.61%" sub="Historical default proportion" />
              <StatCard icon={DollarSign} label="Avg. Income" value="$82,499" sub="Annual borrower income" />
              <StatCard icon={CreditCard} label="Avg. Credit Score" value="574" sub="Baseline FICO score" />
            </div>

            {/* Schema */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-base font-bold text-slate-900 mb-1">Dataset Schema & Columns</h3>
              <p className="text-xs text-slate-400 mb-5">16 input features + 1 binary target variable (Default: 0/1)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5" />Numerical Attributes
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {[
                      ['Age', 'Borrower age (18 – 69)'],
                      ['Income', 'Annual borrower earnings ($15K – $150K)'],
                      ['LoanAmount', 'Requested principal ($1K – $300K)'],
                      ['CreditScore', 'FICO credit score (300 – 850)'],
                      ['MonthsEmployed', 'Tenure at current job'],
                      ['DTIRatio', 'Total debt service-to-income ratio'],
                      ['InterestRate', 'Loan APR percentage'],
                    ].map(([k, v]) => (
                      <li key={k} className="flex items-start gap-2">
                        <span className="font-semibold text-slate-700 min-w-[110px]">{k}</span>
                        <span className="text-slate-400">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />Categorical Attributes
                  </div>
                  <ul className="space-y-2 text-xs text-slate-600">
                    {[
                      ['Education', 'High School, Bachelor\'s, Master\'s, PhD'],
                      ['EmploymentType', 'Full-time, Part-time, Self-employed, Unemployed'],
                      ['MaritalStatus', 'Married, Single, Divorced'],
                      ['LoanPurpose', 'Home, Auto, Business, Education, Other'],
                      ['HasMortgage', 'Binary — Yes / No'],
                      ['HasDependents', 'Binary — Yes / No'],
                      ['HasCoSigner', 'Binary — Yes / No'],
                      ['Default (Target)', '1 = Defaulted, 0 = Fully Paid'],
                    ].map(([k, v]) => (
                      <li key={k} className="flex items-start gap-2">
                        <span className="font-semibold text-slate-700 min-w-[110px]">{k}</span>
                        <span className="text-slate-400">{v}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════ TAB 4: DEPLOYMENT GUIDE ════════════════════════════ */}
        {activeTab === 'deploy' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Deployment Guide</h2>
              <p className="text-xs text-slate-500 mt-0.5">Step-by-step instructions to deploy this project publicly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option 1 */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Server className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Option 1</div>
                    <div className="font-bold text-slate-800 text-sm">Streamlit Community Cloud</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Quickest option — no separate frontend needed. Deploy the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">app.py</code> directly.</p>
                <ol className="text-xs text-slate-600 space-y-3 list-none">
                  {[
                    <>Push repo to GitHub (include <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-100">app.py</code> and <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-100">requirements.txt</code>)</>,
                    <>Sign in to <strong>share.streamlit.io</strong></>,
                    <>Click <strong>Create App</strong> → select repo &amp; <code className="bg-blue-50 px-1.5 py-0.5 rounded text-blue-700 border border-blue-100">app.py</code></>,
                    <>Click <strong>Deploy</strong> — your app gets a public URL instantly!</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Option 2 */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Option 2</div>
                    <div className="font-bold text-slate-800 text-sm">Vercel (React) + Render (FastAPI)</div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Full-stack deployment — React frontend on Vercel, FastAPI backend on Render.</p>
                <ol className="text-xs text-slate-600 space-y-3 list-none">
                  {[
                    <><strong>FastAPI → Render:</strong> Connect GitHub, set root to <code className="bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700 border border-emerald-100">backend/</code>, build: <code className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">pip install -r requirements.txt</code>, start: <code className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">uvicorn main:app --host 0.0.0.0 --port $PORT</code></>,
                    <><strong>React → Vercel:</strong> Import the <code className="bg-emerald-50 px-1.5 py-0.5 rounded text-emerald-700 border border-emerald-100">frontend/</code> folder, set env var <code className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">VITE_API_URL</code> to your Render URL.</>,
                    <>Deploy both — test live end-to-end!</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Tech Stack Badge Row */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />Technology Stack
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'React 18', color: 'bg-blue-50 text-blue-700 border-blue-100' },
                  { label: 'Vite', color: 'bg-purple-50 text-purple-700 border-purple-100' },
                  { label: 'Tailwind CSS', color: 'bg-teal-50 text-teal-700 border-teal-100' },
                  { label: 'FastAPI', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
                  { label: 'Scikit-learn', color: 'bg-amber-50 text-amber-700 border-amber-100' },
                  { label: 'Random Forest', color: 'bg-slate-100 text-slate-600 border-slate-200' },
                  { label: 'AdaBoost', color: 'bg-slate-100 text-slate-600 border-slate-200' },
                  { label: 'Logistic Regression', color: 'bg-slate-100 text-slate-600 border-slate-200' },
                  { label: 'Decision Tree', color: 'bg-slate-100 text-slate-600 border-slate-200' },
                  { label: 'Pandas / NumPy', color: 'bg-rose-50 text-rose-700 border-rose-100' },
                ].map(t => (
                  <span key={t.label} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${t.color}`}>{t.label}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <span><strong className="text-slate-600">LoanRisk AI</strong> · Enterprise ML Underwriting Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" />Secure</span>
            <span>·</span>
            <span>Streamlit + FastAPI + React</span>
            <span>·</span>
            <span>255K+ Records</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
