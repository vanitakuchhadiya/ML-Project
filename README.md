# 💳 Loan Default Prediction - Machine Learning System

An enterprise-grade, end-to-end Machine Learning project to predict loan default risks for loan applicants. Built using Python, Scikit-Learn, Streamlit, FastAPI, and React, following real-world credit risk underwriting principles and multi-platform deployment practices.

---

## 🌟 Features

- **Multiple ML Classifiers**:
  - **Logistic Regression**: Linear baseline with balanced class weights.
  - **Decision Tree**: Explainable tree rules for applicant branching.
  - **Random Forest**: Robust ensemble with bagging to reduce variance and compute feature importance.
  - **AdaBoost**: Sequential boosting to prioritize hard-to-classify default cases.
- **Dual Architecture (Choose your preferred setup)**:
  - **Part 1 — Streamlit Application (`app.py`)**: Standalone, interactive multi-page web application featuring Applicant Risk Prediction, Exploratory Data Analysis (Plotly charts), Model Comparison Leaderboard, and Dataset Explorer.
  - **Part 2 — Decoupled Full-Stack Architecture**:
    - **Backend (`backend/main.py`)**: FastAPI REST API with CORS support, serving `/predict`, `/models`, `/metrics`, and `/dataset-summary`.
    - **Frontend (`frontend/`)**: Modern React + Vite + Tailwind CSS dashboard with live credit score sliders, preset profiles (Prime, Moderate, High Risk), and animated default risk gauges.
- **Deployment Ready**:
  - Deploy **Streamlit** to [Streamlit Community Cloud](https://share.streamlit.io).
  - Deploy **FastAPI backend** to [Render](https://render.com).
  - Deploy **React frontend** to [Vercel](https://vercel.com).

---

## 📂 Project Structure

```
Loan_Default_Prediction/
│
├── Loan_default.csv          # Dataset containing ~255,000 applicant loan records
├── train_models.py           # Training pipeline: preprocessor + model training & evaluation
│
├── models/                   # Serialized ML artifacts & metrics (<5 MB total)
│   ├── preprocessor.pkl      # Scaler + OneHotEncoder pipeline
│   ├── logistic_regression.pkl
│   ├── decision_tree.pkl
│   ├── random_forest.pkl
│   ├── adaboost.pkl
│   ├── feature_columns.json
│   └── model_metrics.json    # Accuracy, Precision, Recall, F1, ROC-AUC
│
├── app.py                    # Streamlit interactive application (Part 1)
├── requirements.txt          # Python dependencies for Streamlit Community Cloud
│
├── backend/                  # FastAPI backend (Part 2 Step A)
│   ├── main.py               # REST API endpoints
│   └── requirements.txt      # Backend dependencies for Render deployment
│
├── frontend/                 # React + Vite application (Part 2 Step B)
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── main.jsx
│   │   └── index.css         # Tailwind styles
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example          # VITE_API_URL
│
└── README.md                 # Project documentation
```

---

## 🚀 Quickstart Guide

### 1. Environment & Model Training
All models are pre-trained in `models/`. To retrain the models at any time:
```powershell
python train_models.py
```

---

### Option A: Run the Streamlit Application (Recommended for Single-App Demo)

1. Launch Streamlit:
   ```powershell
   python -m streamlit run app.py
   ```
2. Open your browser at `http://localhost:8501`.
3. Use the sidebar to switch between:
   - **🎯 Loan Prediction Page**: Enter applicant details or click quick presets ("Prime", "Average", "High Risk") to inspect real-time risk gauges.
   - **🤖 Model Comparison**: View accuracy, recall, precision, F1, ROC curves, and top predictive features.
   - **📊 Exploratory Data Analysis (EDA)**: Interactive Plotly distributions.
   - **📋 Dataset Explorer**: Filter and examine the 255k records.

---

### Option B: Run Full-Stack (FastAPI Backend + React Frontend)

#### Step 1: Start FastAPI Backend
```powershell
# From the project root
python -m uvicorn backend.main:app --reload --port 8000
```
- API Documentation (Swagger UI): `http://127.0.0.1:8000/docs`
- Health Check: `http://127.0.0.1:8000/`

#### Step 2: Start React Frontend
In a new terminal window:
```powershell
cd frontend
npm run dev
```
- Frontend will open at: `http://localhost:3000`

---

## ☁️ Deployment Instructions

### 1. Deploying Streamlit (Streamlit Community Cloud)
1. Push your repository to GitHub. Ensure `app.py`, `models/`, and `requirements.txt` are included.
2. Go to [share.streamlit.io](https://share.streamlit.io) and sign in with GitHub.
3. Click **New app**, select your repository, branch (`main`), and set Main file path to `app.py`.
4. Click **Deploy**!

### 2. Deploying FastAPI to Render
1. Go to [render.com](https://render.com) and create a **Web Service**.
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Once deployed, copy your Render URL (e.g., `https://your-service.onrender.com`).

### 3. Deploying React to Vercel
1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Connect your GitHub repository and set **Root Directory** to `frontend`.
3. In **Environment Variables**, add:
   - `VITE_API_URL` = `https://your-service.onrender.com` (your Render backend URL).
4. Click **Deploy**!

---

## 📊 Model Evaluation Summary

| Model | Accuracy | Precision | Recall (Sensitivity) | F1-Score | ROC-AUC |
|---|---|---|---|---|---|
| **Logistic Regression** | 66.84% | 20.89% | **66.58%** | 0.3180 | **0.7344** |
| **Decision Tree** | 64.64% | 19.48% | 65.29% | 0.3001 | 0.7049 |
| **Random Forest** | 72.12% | 23.01% | 59.69% | **0.3321** | 0.7322 |
| **AdaBoost** | **88.53%** | **58.52%** | 4.25% | 0.0793 | 0.7322 |

*Note: In credit risk default prediction, high Recall is prioritized so that risky applicants likely to default are properly caught.*
