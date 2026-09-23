import React, { useState, useEffect } from 'react';
import { 
  Building2, ShieldAlert, ShieldCheck, AlertCircle, BarChart3, 
  Layers, CheckCircle2, TrendingUp, DollarSign, UserCheck, 
  HelpCircle, RefreshCw, ChevronRight, Server, Globe
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [models, setModels] = useState(['Random Forest', 'Logistic Regression', 'Decision Tree', 'AdaBoost']);
  const [metrics, setMetrics] = useState(null);
  const [datasetSummary, setDatasetSummary] = useState(null);
  const [apiConnected, setApiConnected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
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

  // Fetch models, metrics and dataset summary on mount
  useEffect(() => {
    checkHealthAndFetch();
  }, []);

  const checkHealthAndFetch = async () => {
    try {
      const res = await fetch(`${API_BASE}/`);
      if (res.ok) {
        setApiConnected(true);
        // Fetch metrics
        const mRes = await fetch(`${API_BASE}/metrics`);
        if (mRes.ok) setMetrics(await mRes.json());
        
        // Fetch summary
        const sRes = await fetch(`${API_BASE}/dataset-summary`);
        if (sRes.ok) setDatasetSummary(await sRes.json());

        // Fetch models
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
    if (presetType === 'low') {
      setFormData({
        Age: 48,
        Income: 125000,
        LoanAmount: 35000,
        CreditScore: 785,
        MonthsEmployed: 84,
        NumCreditLines: 2,
        InterestRate: 6.5,
        LoanTerm: 36,
        DTIRatio: 0.22,
        Education: "Master's",
        EmploymentType: "Full-time",
        MaritalStatus: "Married",
        HasMortgage: "Yes",
        HasDependents: "Yes",
        LoanPurpose: "Home",
        HasCoSigner: "Yes",
        model_name: formData.model_name
      });
    } else if (presetType === 'medium') {
      setFormData({
        Age: 35,
        Income: 62000,
        LoanAmount: 40000,
        CreditScore: 615,
        MonthsEmployed: 28,
        NumCreditLines: 3,
        InterestRate: 14.0,
        LoanTerm: 36,
        DTIRatio: 0.44,
        Education: "Bachelor's",
        EmploymentType: "Full-time",
        MaritalStatus: "Single",
        HasMortgage: "No",
        HasDependents: "Yes",
        LoanPurpose: "Auto",
        HasCoSigner: "No",
        model_name: formData.model_name
      });
    } else if (presetType === 'high') {
      setFormData({
        Age: 23,
        Income: 22000,
        LoanAmount: 75000,
        CreditScore: 450,
        MonthsEmployed: 4,
        NumCreditLines: 4,
        InterestRate: 24.5,
        LoanTerm: 60,
        DTIRatio: 0.79,
        Education: "High School",
        EmploymentType: "Unemployed",
        MaritalStatus: "Single",
        HasMortgage: "No",
        HasDependents: "No",
        LoanPurpose: "Business",
        HasCoSigner: "No",
        model_name: formData.model_name
      });
    }
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

      const result = await res.json();
      setPredictionResult(result);
    } catch (err) {
      console.error(err);
      setErrorMsg(`API Error: ${err.message}. Ensure the FastAPI backend is running on ${API_BASE}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Loan Default Risk</h1>
              <p className="text-xs text-slate-500 font-medium">Enterprise ML Underwriting Engine</p>
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
              apiConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{apiConnected ? 'FastAPI Backend Online' : 'Connecting to API...'}</span>
            </div>
            <button 
              onClick={checkHealthAndFetch}
              title="Refresh connection"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6">
          <button
            onClick={() => setActiveTab('predict')}
            className={`py-3.5 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition ${
              activeTab === 'predict'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Applicant Default Predictor</span>
          </button>

          <button
            onClick={() => setActiveTab('models')}
            className={`py-3.5 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition ${
              activeTab === 'models'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Model Benchmarks</span>
          </button>

          <button
            onClick={() => setActiveTab('dataset')}
            className={`py-3.5 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition ${
              activeTab === 'dataset'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Dataset Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`py-3.5 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 transition ${
              activeTab === 'deploy'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Deployment Guide</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* TAB 1: PREDICTION */}
        {activeTab === 'predict' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Form: 7 cols */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Loan Applicant Assessment</h2>
                  <p className="text-xs text-slate-500">Provide applicant financial and demographic details for risk scoring</p>
                </div>
                
                {/* Presets */}
                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => loadPreset('low')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition"
                  >
                    Prime
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('medium')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition"
                  >
                    Moderate
                  </button>
                  <button
                    type="button"
                    onClick={() => loadPreset('high')}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition"
                  >
                    High Risk
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                {/* Section A: Applicant Profile */}
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">1. Personal & Employment</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Age</label>
                      <input
                        type="number"
                        name="Age"
                        min="18"
                        max="100"
                        value={formData.Age}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Marital Status</label>
                      <select
                        name="MaritalStatus"
                        value={formData.MaritalStatus}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Married">Married</option>
                        <option value="Single">Single</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Education</label>
                      <select
                        name="Education"
                        value={formData.Education}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="High School">High School</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Master's">Master's</option>
                        <option value="PhD">PhD</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Employment Type</label>
                      <select
                        name="EmploymentType"
                        value={formData.EmploymentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Self-employed">Self-employed</option>
                        <option value="Unemployed">Unemployed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Months Employed</label>
                      <input
                        type="number"
                        name="MonthsEmployed"
                        min="0"
                        max="120"
                        value={formData.MonthsEmployed}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Has Dependents?</label>
                      <select
                        name="HasDependents"
                        value={formData.HasDependents}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section B: Financial & Credit Profile */}
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">2. Credit & Financial Health</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Annual Income ($)</label>
                      <input
                        type="number"
                        name="Income"
                        step="1000"
                        min="5000"
                        value={formData.Income}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Credit Score ({formData.CreditScore})</label>
                      <input
                        type="range"
                        name="CreditScore"
                        min="300"
                        max="850"
                        value={formData.CreditScore}
                        onChange={handleInputChange}
                        className="w-full accent-blue-600 mt-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">DTI Ratio ({formData.DTIRatio})</label>
                      <input
                        type="range"
                        name="DTIRatio"
                        min="0.05"
                        max="1.0"
                        step="0.01"
                        value={formData.DTIRatio}
                        onChange={handleInputChange}
                        className="w-full accent-blue-600 mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Credit Lines</label>
                      <input
                        type="number"
                        name="NumCreditLines"
                        min="1"
                        max="10"
                        value={formData.NumCreditLines}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Existing Mortgage?</label>
                      <select
                        name="HasMortgage"
                        value={formData.HasMortgage}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Has Co-Signer?</label>
                      <select
                        name="HasCoSigner"
                        value={formData.HasCoSigner}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section C: Loan Request & Model */}
                <div>
                  <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">3. Requested Loan & Model</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Loan Amount ($)</label>
                      <input
                        type="number"
                        name="LoanAmount"
                        step="1000"
                        min="1000"
                        value={formData.LoanAmount}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Interest Rate (%)</label>
                      <input
                        type="number"
                        name="InterestRate"
                        step="0.1"
                        min="1"
                        max="35"
                        value={formData.InterestRate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Term (Months)</label>
                      <select
                        name="LoanTerm"
                        value={formData.LoanTerm}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value={12}>12 Months</option>
                        <option value={24}>24 Months</option>
                        <option value={36}>36 Months</option>
                        <option value={48}>48 Months</option>
                        <option value={60}>60 Months</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Purpose</label>
                      <select
                        name="LoanPurpose"
                        value={formData.LoanPurpose}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Home">Home</option>
                        <option value="Auto">Auto</option>
                        <option value="Business">Business</option>
                        <option value="Education">Education</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Machine Learning Model</label>
                    <select
                      name="model_name"
                      value={formData.model_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {models.map(m => (
                        <option key={m} value={m}>{m} Classifier</option>
                      ))}
                    </select>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Computing Underwriting Risk...</span>
                    </>
                  ) : (
                    <>
                      <span>Predict Default Risk</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Results Panel: 5 cols */}
            <div className="lg:col-span-5 space-y-6">
              {predictionResult ? (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  <div className="text-center pb-5 border-b border-slate-100">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Underwriting Assessment</span>
                    
                    {/* Badge */}
                    <div className="mt-3">
                      {predictionResult.risk_level === 'Low Risk' && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          LOAN APPROVED (LOW RISK)
                        </span>
                      )}
                      {predictionResult.risk_level === 'Moderate Risk' && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-amber-100 text-amber-800">
                          <AlertCircle className="w-4 h-4 mr-1.5" />
                          MANUAL REVIEW RECOMMENDED
                        </span>
                      )}
                      {predictionResult.risk_level === 'High Risk' && (
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-rose-100 text-rose-800">
                          <ShieldAlert className="w-4 h-4 mr-1.5" />
                          HIGH DEFAULT RISK / DECLINED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Probability Gauge / Visual bar */}
                  <div>
                    <div className="flex justify-between items-center text-sm font-medium mb-1.5">
                      <span className="text-slate-600">Default Probability</span>
                      <span className="text-lg font-bold text-slate-900">{predictionResult.default_probability}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-3.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ${
                          predictionResult.default_probability < 35 
                            ? 'bg-emerald-500' 
                            : predictionResult.default_probability < 60 
                            ? 'bg-amber-500' 
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(predictionResult.default_probability, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                      <span>0% (Safe)</span>
                      <span>35% (Review)</span>
                      <span>60%+ (Critical)</span>
                    </div>
                  </div>

                  {/* Recommendation description */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                    <p className="font-semibold text-slate-800 mb-1">Decision Summary:</p>
                    {predictionResult.recommendation}
                    <div className="mt-2 text-[11px] text-slate-400">
                      Evaluated using <span className="font-medium text-slate-600">{predictionResult.model_used}</span>
                    </div>
                  </div>

                  {/* Risk & Positive Factors */}
                  <div className="space-y-3">
                    {predictionResult.risk_factors?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wide mb-2 flex items-center">
                          <AlertCircle className="w-3.5 h-3.5 mr-1" />
                          Risk Factors
                        </h4>
                        <ul className="text-xs text-slate-600 space-y-1.5">
                          {predictionResult.risk_factors.map((f, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-rose-500 mr-1.5">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {predictionResult.positive_factors?.length > 0 && (
                      <div className="pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2 flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Compensating Positive Factors
                        </h4>
                        <ul className="text-xs text-slate-600 space-y-1.5">
                          {predictionResult.positive_factors.map((f, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-emerald-500 mr-1.5">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center min-h-[380px]">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                    <TrendingUp className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Ready to Evaluate</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
                    Select a preset or enter applicant details and click <strong>Predict Default Risk</strong> to run real-time inference.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MODEL BENCHMARKS */}
        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Model Performance Benchmarks</h2>
              <p className="text-xs text-slate-500 mb-6">
                Evaluation results on stratified test split across 4 machine learning architectures.
              </p>

              {metrics ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <th className="pb-3 px-3">Model Architecture</th>
                        <th className="pb-3 px-3">Accuracy</th>
                        <th className="pb-3 px-3">Precision</th>
                        <th className="pb-3 px-3">Recall (Sensitivity)</th>
                        <th className="pb-3 px-3">F1-Score</th>
                        <th className="pb-3 px-3">ROC-AUC</th>
                        <th className="pb-3 px-3">Artifact Size</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {Object.entries(metrics).map(([name, m]) => (
                        <tr key={name} className="hover:bg-slate-50">
                          <td className="py-3.5 px-3 font-semibold text-slate-800">{name}</td>
                          <td className="py-3.5 px-3 text-slate-600">{(m.accuracy * 100).toFixed(2)}%</td>
                          <td className="py-3.5 px-3 text-slate-600">{(m.precision * 100).toFixed(2)}%</td>
                          <td className="py-3.5 px-3 font-semibold text-blue-600">{(m.recall * 100).toFixed(2)}%</td>
                          <td className="py-3.5 px-3 text-slate-600">{m.f1_score.toFixed(4)}</td>
                          <td className="py-3.5 px-3 font-bold text-emerald-600">{m.roc_auc.toFixed(4)}</td>
                          <td className="py-3.5 px-3 text-slate-400 text-xs">{m.file_size_mb || '< 1'} MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Metrics loading or backend offline. Connect backend to view live metrics.
                </div>
              )}
            </div>

            {/* Feature Importances Card */}
            {metrics?.['Random Forest']?.top_features && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-1">Key Factors Driving Loan Default (Random Forest)</h3>
                <p className="text-xs text-slate-500 mb-5">Relative feature weights learned during training</p>
                <div className="space-y-3">
                  {Object.entries(metrics['Random Forest'].top_features).map(([feat, score]) => (
                    <div key={feat}>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>{feat}</span>
                        <span>{(score * 100).toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
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

        {/* TAB 3: DATASET OVERVIEW */}
        {activeTab === 'dataset' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Records</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">255,347</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Applicant records in CSV</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Default Rate</div>
                <div className="text-2xl font-bold text-rose-600 mt-1">11.61%</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Historical default proportion</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Income</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">$82,499</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Annual borrower income</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Credit Score</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">574</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Baseline FICO score</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 mb-3">Dataset Schema & Columns</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <div className="font-bold text-blue-600">Numerical Attributes</div>
                  <ul className="space-y-1 text-slate-600">
                    <li>• <strong>Age:</strong> Borrower age (18 - 69)</li>
                    <li>• <strong>Income:</strong> Annual borrower earnings ($15k - $150k)</li>
                    <li>• <strong>LoanAmount:</strong> Requested principal ($1k - $300k)</li>
                    <li>• <strong>CreditScore:</strong> FICO credit score (300 - 850)</li>
                    <li>• <strong>MonthsEmployed:</strong> Tenure at current job</li>
                    <li>• <strong>DTIRatio:</strong> Total debt service to income ratio</li>
                    <li>• <strong>InterestRate:</strong> Loan APR percentage</li>
                  </ul>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <div className="font-bold text-blue-600">Categorical Attributes</div>
                  <ul className="space-y-1 text-slate-600">
                    <li>• <strong>Education:</strong> High School, Bachelor's, Master's, PhD</li>
                    <li>• <strong>EmploymentType:</strong> Full-time, Part-time, Self-employed, Unemployed</li>
                    <li>• <strong>LoanPurpose:</strong> Home, Auto, Business, Education, Other</li>
                    <li>• <strong>HasCoSigner / HasMortgage / HasDependents:</strong> Binary indicators</li>
                    <li>• <strong>Default (Target):</strong> 1 = Defaulted, 0 = Fully Paid</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DEPLOYMENT GUIDE */}
        {activeTab === 'deploy' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">ML Project Deployment Guide</h2>
              <p className="text-xs text-slate-500 mt-1">
                Step-by-step instructions based on your project specification guide.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option 1 */}
              <div className="p-5 border border-blue-200 rounded-xl bg-blue-50/50">
                <div className="flex items-center space-x-2 text-blue-700 font-bold text-sm mb-2">
                  <Server className="w-4 h-4" />
                  <span>Option 1: Streamlit Community Cloud (Part 1)</span>
                </div>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Push repository to GitHub (including <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800">app.py</code> and <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-800">requirements.txt</code>).</li>
                  <li>Sign in to <strong>share.streamlit.io</strong>.</li>
                  <li>Click <strong>Create App</strong> and select your repository & <code className="bg-white px-1.5 py-0.5 rounded border">app.py</code>.</li>
                  <li>Click <strong>Deploy</strong>. Your app will be live with a public URL!</li>
                </ol>
              </div>

              {/* Option 2 */}
              <div className="p-5 border border-emerald-200 rounded-xl bg-emerald-50/50">
                <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm mb-2">
                  <Globe className="w-4 h-4" />
                  <span>Option 2: React (Vercel) + FastAPI (Render) (Part 2)</span>
                </div>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside leading-relaxed">
                  <li><strong>FastAPI to Render:</strong> Connect GitHub repo, set root to backend, build command <code className="bg-white px-1.5 py-0.5 rounded border">pip install -r requirements.txt</code>, start command <code className="bg-white px-1.5 py-0.5 rounded border">uvicorn main:app --host 0.0.0.0 --port $PORT</code>.</li>
                  <li><strong>React to Vercel:</strong> Import frontend folder on Vercel, set <code className="bg-white px-1.5 py-0.5 rounded border">VITE_API_URL</code> to your Render backend URL.</li>
                  <li>Deploy and test the live application!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        Loan Default Prediction ML Project &bull; Streamlit + FastAPI + React Architecture
      </footer>
    </div>
  );
}
