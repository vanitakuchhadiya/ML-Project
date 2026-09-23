import os
import json
from typing import Optional, Dict, Any, List
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Loan Default Prediction API",
    description="Machine Learning API for predicting loan applicant default probability using multiple classifiers.",
    version="1.0.0"
)

# Enable CORS for frontend integration (Vercel / localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins or specify ["https://your-frontend.vercel.app"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Locate models directory (support running from root or backend/ folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "..", "models") if not os.path.exists(os.path.join(BASE_DIR, "models")) else os.path.join(BASE_DIR, "models")
MODELS_DIR = os.path.abspath(MODELS_DIR)

# Cached model artifacts
preprocessor = None
models_cache: Dict[str, Any] = {}
model_metrics: Dict[str, Any] = {}
feature_cols: Dict[str, Any] = {}

def load_artifacts():
    global preprocessor, models_cache, model_metrics, feature_cols
    prep_path = os.path.join(MODELS_DIR, "preprocessor.pkl")
    if os.path.exists(prep_path):
        preprocessor = joblib.load(prep_path)
    
    metrics_path = os.path.join(MODELS_DIR, "model_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            model_metrics = json.load(f)
            
    cols_path = os.path.join(MODELS_DIR, "feature_columns.json")
    if os.path.exists(cols_path):
        with open(cols_path, "r") as f:
            feature_cols = json.load(f)
            
    # Load available models
    model_files = {
        "Logistic Regression": "logistic_regression.pkl",
        "Decision Tree": "decision_tree.pkl",
        "Random Forest": "random_forest.pkl",
        "AdaBoost": "adaboost.pkl"
    }
    
    for name, filename in model_files.items():
        file_path = os.path.join(MODELS_DIR, filename)
        if os.path.exists(file_path):
            models_cache[name] = joblib.load(file_path)

# Pydantic input schema for applicant
class ApplicantData(BaseModel):
    Age: int = Field(..., ge=18, le=100, example=35)
    Income: float = Field(..., ge=0, example=75000.0)
    LoanAmount: float = Field(..., ge=1000, example=25000.0)
    CreditScore: int = Field(..., ge=300, le=850, example=680)
    MonthsEmployed: int = Field(..., ge=0, example=48)
    NumCreditLines: int = Field(..., ge=0, le=10, example=3)
    InterestRate: float = Field(..., ge=0.0, le=40.0, example=12.5)
    LoanTerm: int = Field(..., example=36)
    DTIRatio: float = Field(..., ge=0.0, le=1.0, example=0.35)
    Education: str = Field(..., example="Bachelor's")
    EmploymentType: str = Field(..., example="Full-time")
    MaritalStatus: str = Field(..., example="Married")
    HasMortgage: str = Field(..., example="Yes")
    HasDependents: str = Field(..., example="No")
    LoanPurpose: str = Field(..., example="Home")
    HasCoSigner: str = Field(..., example="Yes")
    model_name: Optional[str] = Field("Random Forest", example="Random Forest")

@app.on_event("startup")
def startup_event():
    load_artifacts()

@app.get("/")
def root():
    return {
        "status": "healthy",
        "message": "Loan Default Prediction API is live!",
        "available_models": list(models_cache.keys()),
        "endpoints": {
            "predict": "/predict (POST)",
            "models": "/models (GET)",
            "metrics": "/metrics (GET)",
            "dataset_summary": "/dataset-summary (GET)"
        }
    }

@app.get("/models")
def get_models():
    if not models_cache:
        load_artifacts()
    return {
        "available_models": list(models_cache.keys()),
        "default_model": "Random Forest"
    }

@app.get("/metrics")
def get_metrics():
    if not model_metrics:
        load_artifacts()
    return model_metrics

@app.get("/dataset-summary")
def get_dataset_summary():
    return {
        "dataset_name": "Loan Default Prediction Dataset",
        "total_records": 255347,
        "default_rate_pct": 11.61,
        "avg_age": 43.5,
        "avg_income": 82499,
        "avg_loan_amount": 127578,
        "avg_credit_score": 574,
        "avg_dti_ratio": 0.50,
        "education_categories": ["High School", "Bachelor's", "Master's", "PhD"],
        "employment_types": ["Full-time", "Part-time", "Self-employed", "Unemployed"],
        "loan_purposes": ["Auto", "Business", "Education", "Home", "Other"]
    }

@app.post("/predict")
def predict_default(applicant: ApplicantData):
    if not preprocessor or not models_cache:
        load_artifacts()
        
    if not preprocessor:
        raise HTTPException(status_code=503, detail="Preprocessor not found. Please train models first.")
        
    selected_model_name = applicant.model_name or "Random Forest"
    if selected_model_name not in models_cache:
        selected_model_name = list(models_cache.keys())[0] if models_cache else None
        if not selected_model_name:
            raise HTTPException(status_code=503, detail="No trained models available in server.")
            
    model = models_cache[selected_model_name]
    
    # Prepare single row DataFrame
    row = {
        "Age": applicant.Age,
        "Income": applicant.Income,
        "LoanAmount": applicant.LoanAmount,
        "CreditScore": applicant.CreditScore,
        "MonthsEmployed": applicant.MonthsEmployed,
        "NumCreditLines": applicant.NumCreditLines,
        "InterestRate": applicant.InterestRate,
        "LoanTerm": applicant.LoanTerm,
        "DTIRatio": applicant.DTIRatio,
        "Education": applicant.Education,
        "EmploymentType": applicant.EmploymentType,
        "MaritalStatus": applicant.MaritalStatus,
        "HasMortgage": applicant.HasMortgage,
        "HasDependents": applicant.HasDependents,
        "LoanPurpose": applicant.LoanPurpose,
        "HasCoSigner": applicant.HasCoSigner
    }
    
    df_input = pd.DataFrame([row])
    
    try:
        features_trans = preprocessor.transform(df_input)
        pred = int(model.predict(features_trans)[0])
        
        proba = None
        if hasattr(model, "predict_proba"):
            proba = float(model.predict_proba(features_trans)[0][1])
        else:
            proba = 1.0 if pred == 1 else 0.0
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Inference error: {str(e)}")
        
    # Analyze Risk & Key Factors
    risk_factors: List[str] = []
    positive_factors: List[str] = []
    
    if applicant.DTIRatio >= 0.50:
        risk_factors.append(f"Elevated Debt-to-Income (DTI) ratio ({applicant.DTIRatio:.2f})")
    else:
        positive_factors.append(f"Healthy DTI ratio ({applicant.DTIRatio:.2f})")
        
    if applicant.CreditScore < 580:
        risk_factors.append(f"Poor Credit Score ({applicant.CreditScore})")
    elif applicant.CreditScore >= 700:
        positive_factors.append(f"Prime Credit Score ({applicant.CreditScore})")
        
    if applicant.InterestRate >= 16.0:
        risk_factors.append(f"High Interest Rate ({applicant.InterestRate:.1f}%)")
        
    if applicant.EmploymentType == "Unemployed":
        risk_factors.append("Current employment status is Unemployed")
    elif applicant.MonthsEmployed >= 36:
        positive_factors.append(f"Long employment history ({applicant.MonthsEmployed} months)")
        
    if applicant.HasCoSigner.lower() == "yes":
        positive_factors.append("Co-signer present (reduces credit default risk)")
    else:
        risk_factors.append("No co-signer on the loan")
        
    if applicant.LoanAmount > (applicant.Income * 1.5):
        risk_factors.append(f"Loan amount (${applicant.LoanAmount:,.0f}) is high relative to income (${applicant.Income:,.0f})")

    if proba < 0.35:
        risk_level = "Low Risk"
        recommendation = "Approved - Low likelihood of default"
        color = "green"
    elif proba < 0.60:
        risk_level = "Moderate Risk"
        recommendation = "Manual Underwriting Review Recommended"
        color = "amber"
    else:
        risk_level = "High Risk"
        recommendation = "High Default Risk - Require Collateral / Co-signer or Decline"
        color = "red"

    return {
        "prediction": pred,
        "default_probability": round(proba * 100, 2),
        "risk_level": risk_level,
        "recommendation": recommendation,
        "status_color": color,
        "model_used": selected_model_name,
        "risk_factors": risk_factors,
        "positive_factors": positive_factors
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
