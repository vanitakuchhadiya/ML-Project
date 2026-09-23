import os
import json
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import joblib

# -------------------------------------------------------------
# PAGE CONFIGURATION
# -------------------------------------------------------------
st.set_page_config(
    page_title="ApexRisk &bull; Smart Loan Underwriting",
    page_icon="💳",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -------------------------------------------------------------
# LUXURY FINTECH CSS WITH ANIMATIONS & GLASSMORPHISM
# -------------------------------------------------------------
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #0F172A;
    }
    
    /* Background gradient */
    .stApp {
        background: radial-gradient(circle at 10% 10%, rgba(239, 246, 255, 0.7) 0%, rgba(248, 250, 252, 1) 50%, rgba(241, 245, 249, 0.8) 100%);
    }

    /* Padding adjustments */
    .block-container {
        padding-top: 1.2rem;
        padding-bottom: 3.5rem;
        max-width: 1300px;
    }

    /* KEYFRAME ANIMATIONS */
    @keyframes pulseGlow {
        0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.5); }
        50% { transform: scale(1.08); opacity: 0.85; box-shadow: 0 0 12px 4px rgba(16, 185, 129, 0.3); }
    }
    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }
    @keyframes floatCard {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-4px); }
    }
    @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .animated-fade {
        animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    /* =========================================================
       SIDEBAR REMOVAL (FULL-WIDTH ZERO-SIDEBAR LAYOUT)
       ========================================================= */
    [data-testid="stSidebar"],
    [data-testid="stSidebarNav"],
    [data-testid="collapsedControl"],
    section[data-testid="stSidebar"] {
        display: none !important;
        visibility: hidden !important;
        width: 0 !important;
    }
    
    @media (max-width: 768px) {
        .block-container {
            padding-left: 0.8rem !important;
            padding-right: 0.8rem !important;
            padding-top: 0.8rem !important;
        }
        .hero-glow-box {
            padding: 1.8rem 1.4rem !important;
        }
        .hero-h1 {
            font-size: 1.8rem !important;
        }
    }

    /* =========================================================
       TOP FLOATING NAVBAR COMPONENT
       ========================================================= */
    .top-floating-nav {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(16px);
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 20px;
        padding: 0.75rem 1.4rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .nav-brand-title {
        font-size: 1.35rem;
        font-weight: 800;
        background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #4F46E5 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        letter-spacing: -0.03em;
        display: flex;
        align-items: center;
        gap: 8px;
    }

    /* HERO CARD WITH ANIMATED GRADIENT */
    .hero-glow-box {
        background: linear-gradient(125deg, #0B1120 0%, #1E293B 40%, #1E3A8A 75%, #2563EB 100%);
        background-size: 200% 200%;
        animation: gradientShift 10s ease infinite;
        border-radius: 24px;
        padding: 3rem 2.8rem;
        color: #FFFFFF;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 20px 30px -10px rgba(30, 58, 138, 0.35);
        margin-bottom: 2rem;
    }
    .hero-glow-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        padding: 6px 16px;
        border-radius: 30px;
        font-size: 0.82rem;
        font-weight: 700;
        color: #93C5FD;
        margin-bottom: 1.2rem;
        border: 1px solid rgba(255, 255, 255, 0.18);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .hero-h1 {
        font-size: 2.7rem;
        font-weight: 800;
        line-height: 1.15;
        letter-spacing: -0.035em;
        margin-bottom: 0.9rem;
        color: #FFFFFF;
    }
    .hero-subtitle {
        font-size: 1.12rem;
        color: #CBD5E1;
        max-width: 820px;
        line-height: 1.6;
    }

    /* KPI METRIC CARDS WITH HOVER FLOAT */
    .luxury-kpi {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 18px;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -2px rgba(0, 0, 0, 0.02);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
        overflow: hidden;
    }
    .luxury-kpi::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #3B82F6, #60A5FA);
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .luxury-kpi:hover {
        transform: translateY(-4px);
        box-shadow: 0 16px 25px -5px rgba(15, 23, 42, 0.08);
        border-color: #BFDBFE;
    }
    .luxury-kpi:hover::before {
        opacity: 1;
    }
    .kpi-lbl {
        font-size: 0.76rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #64748B;
        margin-bottom: 0.4rem;
    }
    .kpi-num {
        font-size: 2.1rem;
        font-weight: 800;
        color: #0F172A;
        letter-spacing: -0.03em;
        line-height: 1.1;
    }
    .kpi-sub {
        font-size: 0.82rem;
        font-weight: 600;
        margin-top: 0.4rem;
        display: flex;
        align-items: center;
        gap: 5px;
    }

    /* INTERACTIVE ACTION CARDS */
    .action-glass-card {
        background: #FFFFFF;
        border: 1px solid #E2E8F0;
        border-radius: 20px;
        padding: 1.8rem;
        box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.04);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
    .action-glass-card:hover {
        border-color: #3B82F6;
        box-shadow: 0 20px 30px -10px rgba(59, 130, 246, 0.16);
        transform: translateY(-4px);
    }
    .action-icon-circle {
        width: 48px;
        height: 48px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.4rem;
        margin-bottom: 1.2rem;
    }

    /* DECISION STATUS BADGES */
    .badge-approved-glow {
        background: #ECFDF5;
        color: #065F46;
        padding: 9px 22px;
        border-radius: 30px;
        font-weight: 800;
        font-size: 1.05rem;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1.5px solid #10B981;
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.2);
    }
    .badge-review-glow {
        background: #FFFBEB;
        color: #92400E;
        padding: 9px 22px;
        border-radius: 30px;
        font-weight: 800;
        font-size: 1.05rem;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1.5px solid #F59E0B;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.2);
    }
    .badge-declined-glow {
        background: #FEF2F2;
        color: #991B1B;
        padding: 9px 22px;
        border-radius: 30px;
        font-weight: 800;
        font-size: 1.05rem;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        border: 1.5px solid #EF4444;
        box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2);
    }

    /* Buttons override */
    div[data-testid="stButton"] > button {
        border-radius: 12px;
        font-weight: 600;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    div[data-testid="stButton"] > button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.12);
    }
</style>
""", unsafe_allow_html=True)

# -------------------------------------------------------------
# APPLICATION STATE (COMPONENTS ONLY, NO RADIO BUTTONS)
# -------------------------------------------------------------
if "active_screen" not in st.session_state:
    st.session_state.active_screen = "home"
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "username" not in st.session_state:
    st.session_state.username = "Guest"
if "user_role" not in st.session_state:
    st.session_state.user_role = "Guest"

# -------------------------------------------------------------
# LOAD MODELS & METRICS
# -------------------------------------------------------------
MODELS_DIR = "models"

@st.cache_resource
def load_models():
    prep_path = os.path.join(MODELS_DIR, "preprocessor.pkl")
    if not os.path.exists(prep_path):
        return None, {}, {}
    preprocessor = joblib.load(prep_path)
    models = {}
    model_files = {
        "Random Forest": "random_forest.pkl",
        "Logistic Regression": "logistic_regression.pkl",
        "Decision Tree": "decision_tree.pkl",
        "AdaBoost": "adaboost.pkl"
    }
    for name, filename in model_files.items():
        path = os.path.join(MODELS_DIR, filename)
        if os.path.exists(path):
            models[name] = joblib.load(path)
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            metrics = json.load(f)
    return preprocessor, models, metrics

@st.cache_data
def load_sample_df(n=20000):
    if os.path.exists("Loan_default.csv"):
        return pd.read_csv("Loan_default.csv", nrows=n)
    return None

preprocessor, models, metrics = load_models()



# -------------------------------------------------------------
# TOP FLOATING INTERACTIVE NAVBAR (COMPONENTS ONLY)
# -------------------------------------------------------------
user_pill = f"👤 {st.session_state.username} ({st.session_state.user_role})" if st.session_state.authenticated else "👤 Guest Mode"
status_color = "#10B981" if st.session_state.authenticated else "#64748B"

st.markdown(f"""
<div class="top-floating-nav">
    <div class="nav-brand-title">
        <span>💳</span>
        <span>ApexRisk</span>
        <span style="font-size:0.72rem; font-weight:700; background:#EFF6FF; color:#2563EB; padding:3px 10px; border-radius:20px; border:1px solid #BFDBFE;">v2.4 Enterprise</span>
    </div>
    <div style="display:flex; align-items:center; gap:16px;">
        <div style="font-size:0.83rem; font-weight:600; color:#64748B;">
            <span style="width:8px; height:8px; border-radius:50%; background:#10B981; display:inline-block; margin-right:6px; animation: pulseGlow 2s infinite;"></span>
            Operational ML Pipeline
        </div>
        <div style="font-size:0.82rem; font-weight:700; color:{status_color}; background:#F8FAFC; border:1px solid #E2E8F0; padding:4px 12px; border-radius:20px;">
            {user_pill}
        </div>
    </div>
</div>
""", unsafe_allow_html=True)

# 7 Interactive Navigation Buttons (NO SIDEBAR RADIO)
nav_cols = st.columns(7)
screens = [
    ("🏠 Home", "home"),
    ("🎯 Predict Risk", "predict"),
    ("🤖 Models & Charts", "models"),
    ("📊 EDA Insights", "eda"),
    ("📋 Dataset Explorer", "dataset"),
    ("ℹ️ About Project", "about"),
    ("🔐 Login / Access", "login")
]

for idx, (label, screen_key) in enumerate(screens):
    with nav_cols[idx]:
        is_active = (st.session_state.active_screen == screen_key)
        if st.button(
            label, 
            key=f"tab_nav_{screen_key}", 
            type="primary" if is_active else "secondary", 
            use_container_width=True
        ):
            st.session_state.active_screen = screen_key
            st.rerun()

st.markdown("<div style='margin-bottom:1.5rem;'></div>", unsafe_allow_html=True)

# =============================================================
# SCREEN 1: 🏠 HOME
# =============================================================
if st.session_state.active_screen == "home":
    st.markdown("""
    <div class="hero-glow-box animated-fade">
        <div class="hero-glow-pill">
            <span style="width:6px; height:6px; border-radius:50%; background:#60A5FA;"></span>
            Institutional Credit Decisioning Intelligence
        </div>
        <div class="hero-h1">Automated Loan Default Prediction & Underwriting System</div>
        <div class="hero-subtitle">
            Harnessing supervised classification algorithms across 255,000 borrower histories to predict credit defaults, 
            explain risk drivers, and achieve real-time consensus underwriting.
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Luxury KPI Cards
    k1, k2, k3, k4 = st.columns(4)
    with k1:
        st.markdown("""
        <div class="luxury-kpi animated-fade">
            <div class="kpi-lbl">Historical Loans</div>
            <div class="kpi-num">255,347</div>
            <div class="kpi-sub" style="color:#10B981;">✓ Validated borrower records</div>
        </div>
        """, unsafe_allow_html=True)
    with k2:
        st.markdown("""
        <div class="luxury-kpi animated-fade">
            <div class="kpi-lbl">Default Baseline</div>
            <div class="kpi-num">11.61%</div>
            <div class="kpi-sub" style="color:#EF4444;">Balanced class weightings</div>
        </div>
        """, unsafe_allow_html=True)
    with k3:
        st.markdown("""
        <div class="luxury-kpi animated-fade">
            <div class="kpi-lbl">Active Classifiers</div>
            <div class="kpi-num">4 Models</div>
            <div class="kpi-sub" style="color:#3B82F6;">LR, DT, RF & AdaBoost</div>
        </div>
        """, unsafe_allow_html=True)
    with k4:
        st.markdown("""
        <div class="luxury-kpi animated-fade">
            <div class="kpi-lbl">Peak Discrimination</div>
            <div class="kpi-num">0.734 AUC</div>
            <div class="kpi-sub" style="color:#10B981;">High predictive accuracy</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.markdown("<h3 style='font-weight:800; letter-spacing:-0.02em;'>⚡ System Action Centers</h3>", unsafe_allow_html=True)
    st.caption("Click any action card below to navigate directly into that workspace:")

    # Interactive Action Launchers
    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown("""
        <div class="action-glass-card animated-fade">
            <div>
                <div class="action-icon-circle" style="background:#EFF6FF; color:#2563EB;">🎯</div>
                <h4 style="font-weight:800; font-size:1.15rem; margin-bottom:0.4rem;">Applicant Risk Predictor</h4>
                <p style="font-size:0.88rem; color:#64748B; line-height:1.5;">
                    Simulate applicant loan evaluations with sliders, preset financial profiles (Prime, Moderate, Subprime), and instant underwriting decisions.
                </p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Launch Predictor →", key="act_predict", use_container_width=True, type="primary"):
            st.session_state.active_screen = "predict"
            st.rerun()

    with c2:
        st.markdown("""
        <div class="action-glass-card animated-fade">
            <div>
                <div class="action-icon-circle" style="background:#F0FDF4; color:#16A34A;">🤖</div>
                <h4 style="font-weight:800; font-size:1.15rem; margin-bottom:0.4rem;">ML Model Benchmarks</h4>
                <p style="font-size:0.88rem; color:#64748B; line-height:1.5;">
                    Explore multi-model ROC Curves, interactive Confusion Matrices, and top feature importance rankings across all 4 trained classifiers.
                </p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Inspect Model Charts →", key="act_models", use_container_width=True):
            st.session_state.active_screen = "models"
            st.rerun()

    with c3:
        st.markdown("""
        <div class="action-glass-card animated-fade">
            <div>
                <div class="action-icon-circle" style="background:#FAF5FF; color:#9333EA;">📊</div>
                <h4 style="font-weight:800; font-size:1.15rem; margin-bottom:0.4rem;">Exploratory Data Analysis</h4>
                <p style="font-size:0.88rem; color:#64748B; line-height:1.5;">
                    Interactive charts examining debt distributions, credit scores, borrower employment risk, and correlation patterns.
                </p>
            </div>
        </div>
        """, unsafe_allow_html=True)
        if st.button("Open EDA Dashboard →", key="act_eda", use_container_width=True):
            st.session_state.active_screen = "eda"
            st.rerun()

# =============================================================
# SCREEN 2: 🎯 PREDICT RISK
# =============================================================
elif st.session_state.active_screen == "predict":
    st.markdown("<h2 style='font-weight:800; letter-spacing:-0.03em; margin-bottom:0.2rem;'>🎯 Applicant Loan Default Risk Predictor</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748B; font-size:0.95rem; margin-bottom:1.5rem;'>Input borrower financial metrics or load quick presets to compute real-time default probability and multi-model consensus.</p>", unsafe_allow_html=True)

    if not models or not preprocessor:
        st.error("⚠️ Model artifacts missing. Run `python train_models.py` first.")
        st.stop()

    # Presets Bar
    st.markdown("##### ⚡ Quick Applicant Profiles (Presets)")
    p1, p2, p3 = st.columns(3)
    preset = None
    with p1:
        if st.button("🟢 Load Prime Profile (Low Default Risk)", key="p_prime_btn", use_container_width=True):
            preset = "low"
    with p2:
        if st.button("🟡 Load Average Profile (Moderate Risk)", key="p_avg_btn", use_container_width=True):
            preset = "medium"
    with p3:
        if st.button("🔴 Load Subprime Profile (High Default Risk)", key="p_sub_btn", use_container_width=True):
            preset = "high"

    if preset == "low":
        st.session_state.v_age = 48
        st.session_state.v_income = 125000
        st.session_state.v_loan = 35000
        st.session_state.v_credit = 785
        st.session_state.v_months = 84
        st.session_state.v_lines = 2
        st.session_state.v_rate = 6.5
        st.session_state.v_term = 36
        st.session_state.v_dti = 0.22
        st.session_state.v_edu = "Master's"
        st.session_state.v_emp = "Full-time"
        st.session_state.v_mar = "Married"
        st.session_state.v_mort = "Yes"
        st.session_state.v_dep = "Yes"
        st.session_state.v_purp = "Home"
        st.session_state.v_cos = "Yes"
    elif preset == "medium":
        st.session_state.v_age = 35
        st.session_state.v_income = 62000
        st.session_state.v_loan = 42000
        st.session_state.v_credit = 615
        st.session_state.v_months = 28
        st.session_state.v_lines = 3
        st.session_state.v_rate = 14.0
        st.session_state.v_term = 36
        st.session_state.v_dti = 0.44
        st.session_state.v_edu = "Bachelor's"
        st.session_state.v_emp = "Full-time"
        st.session_state.v_mar = "Single"
        st.session_state.v_mort = "No"
        st.session_state.v_dep = "Yes"
        st.session_state.v_purp = "Auto"
        st.session_state.v_cos = "No"
    elif preset == "high":
        st.session_state.v_age = 22
        st.session_state.v_income = 21000
        st.session_state.v_loan = 80000
        st.session_state.v_credit = 440
        st.session_state.v_months = 4
        st.session_state.v_lines = 4
        st.session_state.v_rate = 25.0
        st.session_state.v_term = 60
        st.session_state.v_dti = 0.81
        st.session_state.v_edu = "High School"
        st.session_state.v_emp = "Unemployed"
        st.session_state.v_mar = "Single"
        st.session_state.v_mort = "No"
        st.session_state.v_dep = "No"
        st.session_state.v_purp = "Business"
        st.session_state.v_cos = "No"

    # Prediction Form
    with st.form("risk_prediction_form"):
        st.markdown("#### 1. Personal & Employment Profile")
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            age = st.number_input("Age", 18, 100, value=st.session_state.get("v_age", 38))
            marital = st.selectbox("Marital Status", ["Married", "Single", "Divorced"], 
                                   index=["Married", "Single", "Divorced"].index(st.session_state.get("v_mar", "Married")))
        with c2:
            education = st.selectbox("Education Level", ["High School", "Bachelor's", "Master's", "PhD"], 
                                     index=["High School", "Bachelor's", "Master's", "PhD"].index(st.session_state.get("v_edu", "Bachelor's")))
            employment = st.selectbox("Employment Type", ["Full-time", "Part-time", "Self-employed", "Unemployed"], 
                                      index=["Full-time", "Part-time", "Self-employed", "Unemployed"].index(st.session_state.get("v_emp", "Full-time")))
        with c3:
            months_employed = st.number_input("Months Employed", 0, 120, value=st.session_state.get("v_months", 42))
            dependents = st.selectbox("Has Dependents?", ["No", "Yes"], 
                                      index=["No", "Yes"].index(st.session_state.get("v_dep", "No")))
        with c4:
            has_mortgage = st.selectbox("Existing Mortgage?", ["No", "Yes"], 
                                        index=["No", "Yes"].index(st.session_state.get("v_mort", "No")))
            has_cosigner = st.selectbox("Has Co-Signer?", ["Yes", "No"], 
                                        index=["Yes", "No"].index(st.session_state.get("v_cos", "Yes")))

        st.markdown("#### 2. Financial Indicators & Credit Health")
        f1, f2, f3 = st.columns(3)
        with f1:
            income = st.number_input("Annual Income ($)", 5000, 500000, step=1000, value=st.session_state.get("v_income", 75000))
            num_credit_lines = st.slider("Existing Credit Lines", 1, 10, value=st.session_state.get("v_lines", 3))
        with f2:
            credit_score = st.slider("Credit Score (FICO)", 300, 850, value=st.session_state.get("v_credit", 660))
            dti_ratio = st.slider("Debt-to-Income (DTI) Ratio", 0.05, 1.00, step=0.01, value=st.session_state.get("v_dti", 0.35))
        with f3:
            loan_amount = st.number_input("Requested Principal ($)", 1000, 300000, step=1000, value=st.session_state.get("v_loan", 30000))
            interest_rate = st.slider("Interest Rate (%)", 1.0, 35.0, step=0.1, value=st.session_state.get("v_rate", 11.5))

        st.markdown("#### 3. Loan Terms & Primary Model")
        l1, l2, l3 = st.columns(3)
        with l1:
            loan_purpose = st.selectbox("Loan Purpose", ["Home", "Auto", "Business", "Education", "Other"], 
                                        index=["Home", "Auto", "Business", "Education", "Other"].index(st.session_state.get("v_purp", "Home")))
        with l2:
            loan_term = st.selectbox("Loan Term", [12, 24, 36, 48, 60], 
                                     index=[12, 24, 36, 48, 60].index(st.session_state.get("v_term", 36)))
        with l3:
            chosen_model_name = st.selectbox("Select ML Architecture", list(models.keys()), index=0)

        predict_btn = st.form_submit_button("🚀 Compute Underwriting Analysis", use_container_width=True, type="primary")

    if predict_btn:
        input_data = pd.DataFrame([{
            "Age": age,
            "Income": income,
            "LoanAmount": loan_amount,
            "CreditScore": credit_score,
            "MonthsEmployed": months_employed,
            "NumCreditLines": num_credit_lines,
            "InterestRate": interest_rate,
            "LoanTerm": loan_term,
            "DTIRatio": dti_ratio,
            "Education": education,
            "EmploymentType": employment,
            "MaritalStatus": marital,
            "HasMortgage": has_mortgage,
            "HasDependents": dependents,
            "LoanPurpose": loan_purpose,
            "HasCoSigner": has_cosigner
        }])

        input_trans = preprocessor.transform(input_data)
        primary_model = models[chosen_model_name]
        primary_pred = primary_model.predict(input_trans)[0]
        
        if hasattr(primary_model, "predict_proba"):
            prob_pct = round(float(primary_model.predict_proba(input_trans)[0][1]) * 100, 2)
        else:
            prob_pct = 100.0 if primary_pred == 1 else 0.0

        st.markdown("---")
        st.markdown("<h3 style='font-weight:800; letter-spacing:-0.02em;'>📊 Assessment Results</h3>", unsafe_allow_html=True)

        res_c1, res_c2, res_c3 = st.columns([1.3, 1.2, 1.5])
        
        with res_c1:
            st.markdown("##### Underwriting Status")
            if prob_pct < 35.0:
                st.markdown('<div class="badge-approved-glow">✅ LOAN APPROVED</div>', unsafe_allow_html=True)
                st.markdown("<br>", unsafe_allow_html=True)
                st.success(f"**Low Default Risk ({prob_pct}%)**\nApplicant qualifies for automated prime loan approval.")
            elif prob_pct < 60.0:
                st.markdown('<div class="badge-review-glow">⚠️ MANUAL REVIEW</div>', unsafe_allow_html=True)
                st.markdown("<br>", unsafe_allow_html=True)
                st.warning(f"**Moderate Risk ({prob_pct}%)**\nRequires manual underwriter verification.")
            else:
                st.markdown('<div class="badge-declined-glow">⛔ HIGH RISK / REJECTED</div>', unsafe_allow_html=True)
                st.markdown("<br>", unsafe_allow_html=True)
                st.error(f"**Critical Default Risk ({prob_pct}%)**\nApplication exceeds allowable credit loss thresholds.")

        with res_c2:
            st.markdown("##### Risk Gauge")
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=prob_pct,
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': f"{chosen_model_name}"},
                number={'suffix': "%"},
                gauge={
                    'axis': {'range': [0, 100]},
                    'bar': {'color': "#0F172A"},
                    'steps': [
                        {'range': [0, 35], 'color': "#A7F3D0"},
                        {'range': [35, 60], 'color': "#FDE68A"},
                        {'range': [60, 100], 'color': "#FECACA"}
                    ],
                    'threshold': {
                        'line': {'color': "red", 'width': 3},
                        'thickness': 0.75,
                        'value': prob_pct
                    }
                }
            ))
            fig_gauge.update_layout(height=230, margin=dict(l=15, r=15, t=35, b=10), paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_gauge, use_container_width=True)

        with res_c3:
            st.markdown("##### Factor Breakdown")
            r_factors = []
            p_factors = []
            if dti_ratio >= 0.50:
                r_factors.append(f"Elevated DTI ratio ({dti_ratio:.2f})")
            else:
                p_factors.append(f"Low DTI ratio ({dti_ratio:.2f})")
            if credit_score < 580:
                r_factors.append(f"Poor credit score ({credit_score})")
            elif credit_score >= 700:
                p_factors.append(f"Prime credit score ({credit_score})")
            if interest_rate >= 16.0:
                r_factors.append(f"High interest burden ({interest_rate:.1f}%)")
            if has_cosigner == "Yes":
                p_factors.append("Co-signer present on loan")
            else:
                r_factors.append("No co-signer guaranteeing loan")
            if employment == "Unemployed":
                r_factors.append("Borrower currently unemployed")
            elif months_employed >= 36:
                p_factors.append(f"Long employment tenure ({months_employed} mos)")

            if r_factors:
                st.markdown("**⚠️ Risk Alerts:**")
                for rf in r_factors:
                    st.markdown(f"- <span style='color:#DC2626;'>{rf}</span>", unsafe_allow_html=True)
            if p_factors:
                st.markdown("**✅ Positive Strengths:**")
                for pf in p_factors:
                    st.markdown(f"- <span style='color:#059669;'>{pf}</span>", unsafe_allow_html=True)

        # Multi-Model Consensus Table
        st.markdown("---")
        st.markdown("#### 🤝 Multi-Model Consensus Matrix")
        st.caption("Side-by-side inference across all 4 machine learning models for this exact applicant:")
        consensus_data = []
        for m_name, m_obj in models.items():
            pred_v = m_obj.predict(input_trans)[0]
            prob_v = round(float(m_obj.predict_proba(input_trans)[0][1]) * 100, 2) if hasattr(m_obj, "predict_proba") else (100.0 if pred_v == 1 else 0.0)
            status_t = "Approved (Low Risk)" if prob_v < 35 else ("Review" if prob_v < 60 else "Decline (High Risk)")
            consensus_data.append({
                "Model Architecture": m_name,
                "Predicted Class": "Default (1)" if pred_v == 1 else "Non-Default (0)",
                "Default Probability": f"{prob_v}%",
                "Recommendation": status_t
            })
        st.dataframe(pd.DataFrame(consensus_data), use_container_width=True, hide_index=True)

# =============================================================
# SCREEN 3: 🤖 MODELS & PERFORMANCE CHARTS
# =============================================================
elif st.session_state.active_screen == "models":
    st.markdown("<h2 style='font-weight:800; letter-spacing:-0.03em; margin-bottom:0.2rem;'>🤖 Machine Learning Models & Evaluation Benchmark</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748B; font-size:0.95rem; margin-bottom:1.5rem;'>Comparative leaderboard, multi-model ROC curves, interactive confusion matrices, and feature importance.</p>", unsafe_allow_html=True)

    if not metrics:
        st.warning("No metrics found. Run `python train_models.py` first.")
        st.stop()

    # Leaderboard Table
    st.markdown("#### 🏆 Evaluation Leaderboard")
    t_rows = []
    for m_name, m_data in metrics.items():
        t_rows.append({
            "Model Name": m_name,
            "Accuracy": f"{m_data['accuracy'] * 100:.2f}%",
            "Precision": f"{m_data['precision'] * 100:.2f}%",
            "Recall (Sensitivity)": f"{m_data['recall'] * 100:.2f}%",
            "F1-Score": f"{m_data['f1_score']:.4f}",
            "ROC-AUC Score": f"{m_data['roc_auc']:.4f}",
            "Artifact Size": f"{m_data.get('file_size_mb', 0)} MB"
        })
    st.dataframe(pd.DataFrame(t_rows), use_container_width=True, hide_index=True)

    # Side-by-side grouped bar chart
    st.markdown("#### 📊 Metric Comparison Across Classifiers")
    chart_data = []
    for m_name, m_data in metrics.items():
        chart_data.append({"Model": m_name, "Metric": "Accuracy", "Value": m_data["accuracy"]})
        chart_data.append({"Model": m_name, "Metric": "Recall", "Value": m_data["recall"]})
        chart_data.append({"Model": m_name, "Metric": "Precision", "Value": m_data["precision"]})
        chart_data.append({"Model": m_name, "Metric": "ROC-AUC", "Value": m_data["roc_auc"]})
    df_chart = pd.DataFrame(chart_data)

    fig_bar = px.bar(
        df_chart, 
        x="Metric", 
        y="Value", 
        color="Model", 
        barmode="group",
        text_auto=".2f",
        color_discrete_sequence=["#2563EB", "#10B981", "#F59E0B", "#8B5CF6"],
        template="plotly_white"
    )
    fig_bar.update_layout(yaxis=dict(range=[0, 1.05]), margin=dict(l=20, r=20, t=30, b=20))
    st.plotly_chart(fig_bar, use_container_width=True)

    # ROC Curves & Feature Importance
    c_roc, c_feat = st.columns(2)
    with c_roc:
        st.markdown("#### 📈 Multi-Model ROC Curves")
        fig_roc = go.Figure()
        fig_roc.add_shape(type='line', line=dict(dash='dash', color='gray'), x0=0, x1=1, y0=0, y1=1)
        for m_name, m_data in metrics.items():
            if "fpr" in m_data and "tpr" in m_data:
                fig_roc.add_trace(go.Scatter(
                    x=m_data["fpr"], 
                    y=m_data["tpr"], 
                    name=f"{m_name} (AUC={m_data['roc_auc']:.3f})", 
                    mode='lines'
                ))
        fig_roc.update_layout(
            xaxis_title="False Positive Rate",
            yaxis_title="True Positive Rate",
            legend=dict(x=0.45, y=0.15),
            template="plotly_white",
            margin=dict(l=20, r=20, t=30, b=20)
        )
        st.plotly_chart(fig_roc, use_container_width=True)

    with c_feat:
        st.markdown("#### 🔍 Feature Importance (Random Forest)")
        rf_top = metrics.get("Random Forest", {}).get("top_features", {})
        if rf_top:
            df_feat = pd.DataFrame({
                "Feature": list(rf_top.keys()),
                "Importance": list(rf_top.values())
            }).sort_values("Importance", ascending=True)
            fig_feat = px.bar(
                df_feat, 
                x="Importance", 
                y="Feature", 
                orientation="h",
                color="Importance",
                color_continuous_scale="Blues",
                template="plotly_white"
            )
            fig_feat.update_layout(showlegend=False, margin=dict(l=20, r=20, t=30, b=20))
            st.plotly_chart(fig_feat, use_container_width=True)

    # Interactive Confusion Matrix
    st.markdown("---")
    st.markdown("#### 🎯 Interactive Confusion Matrices")
    selected_cm_model = st.selectbox("Inspect Confusion Matrix for Model", list(metrics.keys()))
    if selected_cm_model in metrics and "confusion_matrix" in metrics[selected_cm_model]:
        cm = metrics[selected_cm_model]["confusion_matrix"]
        tn, fp = cm[0][0], cm[0][1]
        fn, tp = cm[1][0], cm[1][1]
        cm_df = pd.DataFrame(
            [[tn, fp], [fn, tp]], 
            index=["Actual Non-Default (0)", "Actual Default (1)"], 
            columns=["Predicted Non-Default (0)", "Predicted Default (1)"]
        )
        col_cm1, col_cm2 = st.columns([1.5, 1])
        with col_cm1:
            fig_cm = px.imshow(
                cm_df,
                text_auto=True,
                color_continuous_scale="Teal",
                template="plotly_white"
            )
            st.plotly_chart(fig_cm, use_container_width=True)
        with col_cm2:
            st.markdown(f"##### Breakdown for **{selected_cm_model}**")
            st.markdown(f"- **True Negatives:** {tn:,}")
            st.markdown(f"- **False Positives:** {fp:,}")
            st.markdown(f"- **False Negatives:** {fn:,}")
            st.markdown(f"- **True Positives:** {tp:,}")
            st.markdown(f"- **Sensitivity / Recall:** `{metrics[selected_cm_model]['recall']*100:.2f}%`")

# =============================================================
# SCREEN 4: 📊 EDA INSIGHTS
# =============================================================
elif st.session_state.active_screen == "eda":
    st.markdown("<h2 style='font-weight:800; letter-spacing:-0.03em; margin-bottom:0.2rem;'>📊 Exploratory Data Analysis (EDA)</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748B; font-size:0.95rem; margin-bottom:1.5rem;'>Visual analytics of debt profiles, credit score distributions, and default rates.</p>", unsafe_allow_html=True)

    df_eda = load_sample_df(25000)
    if df_eda is None:
        st.warning("`Loan_default.csv` not found.")
        st.stop()

    e1, e2 = st.columns(2)
    with e1:
        counts = df_eda["Default"].value_counts().reset_index()
        counts.columns = ["Default_Status", "Count"]
        counts["Label"] = counts["Default_Status"].map({0: "Non-Default (Paid)", 1: "Defaulted"})
        fig_donut = px.pie(
            counts, 
            names="Label", 
            values="Count", 
            hole=0.48,
            title="Portfolio Default vs Non-Default Split",
            color="Label",
            color_discrete_map={"Non-Default (Paid)": "#10B981", "Defaulted": "#EF4444"},
            template="plotly_white"
        )
        st.plotly_chart(fig_donut, use_container_width=True)

    with e2:
        emp_grp = df_eda.groupby("EmploymentType")["Default"].mean().reset_index()
        emp_grp["Default_Rate"] = emp_grp["Default"] * 100
        fig_emp = px.bar(
            emp_grp.sort_values("Default_Rate", ascending=False),
            x="EmploymentType",
            y="Default_Rate",
            color="Default_Rate",
            color_continuous_scale="Reds",
            title="Default Rate (%) by Employment Status",
            text_auto=".1f",
            template="plotly_white"
        )
        fig_emp.update_layout(yaxis_title="Default Rate (%)")
        st.plotly_chart(fig_emp, use_container_width=True)

    e3, e4 = st.columns(2)
    with e3:
        fig_box = px.box(
            df_eda,
            x="Default",
            y="CreditScore",
            color="Default",
            title="Credit Score Distribution by Default Status",
            labels={"Default": "Default (0=No, 1=Yes)"},
            color_discrete_sequence=["#3B82F6", "#EF4444"],
            template="plotly_white"
        )
        st.plotly_chart(fig_box, use_container_width=True)

    with e4:
        fig_hist = px.histogram(
            df_eda,
            x="DTIRatio",
            color="Default",
            nbins=35,
            barmode="overlay",
            title="Debt-to-Income (DTI) Ratio Distribution",
            labels={"Default": "Default (0=No, 1=Yes)"},
            color_discrete_sequence=["#10B981", "#EF4444"],
            template="plotly_white"
        )
        st.plotly_chart(fig_hist, use_container_width=True)

# =============================================================
# SCREEN 5: 📋 DATASET EXPLORER
# =============================================================
elif st.session_state.active_screen == "dataset":
    st.markdown("<h2 style='font-weight:800; letter-spacing:-0.03em; margin-bottom:0.2rem;'>📋 Dataset Inspector & Schema</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748B; font-size:0.95rem; margin-bottom:1.5rem;'>Filter applicant records, examine distributions, and review numerical summary statistics.</p>", unsafe_allow_html=True)

    df_sample = load_sample_df(10000)
    if df_sample is not None:
        f1, f2, f3 = st.columns(3)
        with f1:
            sel_edu = st.multiselect("Filter Education", df_sample["Education"].unique(), default=df_sample["Education"].unique())
        with f2:
            sel_emp = st.multiselect("Filter Employment", df_sample["EmploymentType"].unique(), default=df_sample["EmploymentType"].unique())
        with f3:
            sel_def = st.selectbox("Default Outcome", ["All Records", "Defaulted (1)", "Non-Default (0)"])

        filtered = df_sample[df_sample["Education"].isin(sel_edu) & df_sample["EmploymentType"].isin(sel_emp)]
        if sel_def == "Defaulted (1)":
            filtered = filtered[filtered["Default"] == 1]
        elif sel_def == "Non-Default (0)":
            filtered = filtered[filtered["Default"] == 0]

        st.markdown(f"**Showing {len(filtered):,} matching records**")
        st.dataframe(filtered.head(150), use_container_width=True)

        st.markdown("#### Numerical Attributes Summary Statistics")
        st.dataframe(df_sample.describe(), use_container_width=True)

# =============================================================
# SCREEN 6: ℹ️ ABOUT PROJECT
# =============================================================
elif st.session_state.active_screen == "about":
    st.markdown("<h2 style='font-weight:800; letter-spacing:-0.03em; margin-bottom:0.2rem;'>ℹ️ About ApexRisk & Machine Learning Architecture</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748B; font-size:0.95rem; margin-bottom:1.5rem;'>Technical specifications, models overview, and multi-cloud deployment guides.</p>", unsafe_allow_html=True)

    st.markdown("""
    ### 🎯 Business Objective & Problem Statement
    Credit underwriting requires balancing loan volume growth against bad debt write-offs. When borrowers default, lenders lose capital. 
    By applying machine learning classification models to applicant demographic, credit, and employment features, lenders can:
    - **Automate approvals** for prime low-risk borrowers (<35% default probability).
    - **Flag high-risk applicants** (>60% default probability) to prevent portfolio insolvency.
    - **Route borderline applicants** (35% - 60%) to manual underwriting review.

    ---

    ### 🧠 Machine Learning Algorithms Implemented
    1. **Logistic Regression (`LogisticRegression`)**:
       - Linear baseline utilizing log-odds sigmoid transformation.
       - Built with `class_weight='balanced'` to prevent bias toward non-defaults.
       - Achieves **66.58% Recall** and **0.734 ROC-AUC**.

    2. **Decision Tree Classifier (`DecisionTreeClassifier`)**:
       - Non-linear tree partitioner offering transparent threshold rules (e.g. DTI splits and Age cutoffs).
       - Achieves **65.29% Recall** and **0.705 ROC-AUC**.

    3. **Random Forest Classifier (`RandomForestClassifier`)**:
       - Bagging ensemble of 100 decorrelated decision trees.
       - Outstanding stability and feature importance extraction.
       - Achieves **72.12% Accuracy**, **0.332 F1-Score**, and **0.732 ROC-AUC**.

    4. **AdaBoost Classifier (`AdaBoostClassifier`)**:
       - Sequential adaptive boosting focusing on difficult-to-classify samples.
       - High overall accuracy (**88.53%**).

    ---

    ### 🚀 Deployment Options (Task 6 Guide)
    - **Option 1 — Streamlit Community Cloud (Part 1)**: Single-app deployment via GitHub and `requirements.txt`.
    - **Option 2 — FastAPI (Render) + React (Vercel) (Part 2)**: Full-stack decoupled architecture.
    """)

# =============================================================
# SCREEN 7: 🔐 LOGIN / ACCESS
# =============================================================
elif st.session_state.active_screen == "login":
    st.markdown("<h2 style='font-weight:800; letter-spacing:-0.03em; margin-bottom:0.2rem;'>🔐 Loan Officer & Analyst Authentication</h2>", unsafe_allow_html=True)
    st.markdown("<p style='color:#64748B; font-size:0.95rem; margin-bottom:1.5rem;'>Authenticate to enable underwriter credentials and audit logs.</p>", unsafe_allow_html=True)

    if st.session_state.authenticated:
        st.success(f"✅ Signed in as **{st.session_state.username}** (Role: **{st.session_state.user_role}**)")
        st.write("You have active underwriting clearance. Navigate to **🎯 Predict Risk** to evaluate applications.")
        if st.button("Log Out of Session", type="primary"):
            st.session_state.authenticated = False
            st.session_state.username = "Guest"
            st.session_state.user_role = "Guest"
            st.rerun()
    else:
        log_c1, log_c2 = st.columns([1.2, 1])
        with log_c1:
            st.markdown("#### Enter Credentials")
            with st.form("custom_login_form"):
                u_in = st.text_input("Work Email / Username", value="underwriter@apexrisk.com")
                p_in = st.text_input("Password", type="password", value="password123")
                r_in = st.selectbox("Underwriter Role", ["Senior Loan Underwriter", "Risk Analyst", "Compliance Officer"])
                submit_log = st.form_submit_button("Sign In", use_container_width=True, type="primary")

            if submit_log:
                st.session_state.authenticated = True
                st.session_state.username = u_in.split("@")[0].title()
                st.session_state.user_role = r_in
                st.success(f"Welcome, {st.session_state.username}!")
                st.rerun()

        with log_c2:
            st.markdown("#### ⚡ Quick Demo Logins")
            st.caption("Click to sign in instantly with a pre-configured role:")
            if st.button("👔 Sign in as Senior Underwriter", key="login_uw", use_container_width=True):
                st.session_state.authenticated = True
                st.session_state.username = "Sarah Jenkins"
                st.session_state.user_role = "Senior Loan Underwriter"
                st.rerun()
            if st.button("📊 Sign in as Risk Analyst", key="login_ra", use_container_width=True):
                st.session_state.authenticated = True
                st.session_state.username = "Alex Chen"
                st.session_state.user_role = "Risk Analyst"
                st.rerun()
            if st.button("🛡️ Sign in as Compliance Auditor", key="login_co", use_container_width=True):
                st.session_state.authenticated = True
                st.session_state.username = "Morgan Vance"
                st.session_state.user_role = "Compliance Officer"
                st.rerun()

st.markdown("<br><hr style='border:none; border-top:1px solid #E2E8F0; margin:2rem 0 1rem 0;'>", unsafe_allow_html=True)
st.caption("ApexRisk Loan Default Prediction System &bull; Enterprise Credit Underwriting System &copy; 2026")
