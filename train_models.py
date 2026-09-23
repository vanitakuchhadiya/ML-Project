import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)

def train_and_evaluate():
    print("=== Step 1: Loading Dataset ===")
    data_path = "Loan_default.csv"
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"File not found: {data_path}")
    
    # Load dataset
    df = pd.read_csv(data_path)
    print(f"Total dataset shape: {df.shape}")
    
    # Drop LoanID
    if "LoanID" in df.columns:
        df = df.drop(columns=["LoanID"])
    
    num_cols = [
        "Age", "Income", "LoanAmount", "CreditScore", 
        "MonthsEmployed", "NumCreditLines", "InterestRate", 
        "LoanTerm", "DTIRatio"
    ]
    
    cat_cols = [
        "Education", "EmploymentType", "MaritalStatus", 
        "HasMortgage", "HasDependents", "LoanPurpose", "HasCoSigner"
    ]
    
    target_col = "Default"
    
    print(f"Target distribution:\n{df[target_col].value_counts(normalize=True)}")
    
    # Use stratified sample of 80,000 rows for high accuracy and fast local training/lean model size
    SAMPLE_SIZE = min(80000, len(df))
    df_sample, _ = train_test_split(
        df, 
        train_size=SAMPLE_SIZE, 
        stratify=df[target_col], 
        random_state=42
    )
    print(f"Sampled shape for training: {df_sample.shape}")
    
    X = df_sample[num_cols + cat_cols]
    y = df_sample[target_col]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )
    
    print("=== Step 2: Creating Preprocessor Pipeline ===")
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols)
        ]
    )
    
    # Fit preprocessor
    X_train_trans = preprocessor.fit_transform(X_train)
    X_test_trans = preprocessor.transform(X_test)
    
    # Get feature names after one-hot encoding
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_feature_names = cat_encoder.get_feature_names_out(cat_cols).tolist()
    all_feature_names = num_cols + cat_feature_names
    
    models_dir = "models"
    os.makedirs(models_dir, exist_ok=True)
    
    # Save preprocessor and feature schema
    joblib.dump(preprocessor, os.path.join(models_dir, "preprocessor.pkl"))
    with open(os.path.join(models_dir, "feature_columns.json"), "w") as f:
        json.dump({
            "num_cols": num_cols,
            "cat_cols": cat_cols,
            "all_features": all_feature_names
        }, f, indent=2)
    
    print("=== Step 3: Defining Classifiers ===")
    models = {
        "Logistic Regression": LogisticRegression(
            max_iter=1000, 
            class_weight="balanced", 
            random_state=42
        ),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=6, 
            min_samples_split=20,
            class_weight="balanced", 
            random_state=42
        ),
        "Random Forest": RandomForestClassifier(
            n_estimators=100, 
            max_depth=10, 
            min_samples_leaf=10,
            class_weight="balanced", 
            n_jobs=-1, 
            random_state=42
        ),
        "AdaBoost": AdaBoostClassifier(
            n_estimators=80, 
            learning_rate=0.8, 
            random_state=42
        )
    }
    
    metrics_summary = {}
    
    print("=== Step 4: Training & Evaluating Models ===")
    for model_name, model in models.items():
        print(f"\n--- Training {model_name} ---")
        model.fit(X_train_trans, y_train)
        
        y_pred = model.predict(X_test_trans)
        y_proba = model.predict_proba(X_test_trans)[:, 1] if hasattr(model, "predict_proba") else None
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        roc_auc = roc_auc_score(y_test, y_proba) if y_proba is not None else 0.0
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        fpr, tpr, _ = roc_curve(y_test, y_proba) if y_proba is not None else ([0, 1], [0, 1], None)
        # downsample roc curve for lightweight json storage
        roc_sample_indices = np.linspace(0, len(fpr) - 1, min(50, len(fpr)), dtype=int)
        
        # Feature importances if available
        feature_importance = {}
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            feature_importance = {name: float(round(imp, 5)) for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)[:10]}
        elif hasattr(model, "coef_"):
            coefs = np.abs(model.coef_[0])
            feature_importance = {name: float(round(c, 5)) for name, c in sorted(zip(all_feature_names, coefs), key=lambda x: x[1], reverse=True)[:10]}
        
        metrics_summary[model_name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(roc_auc), 4),
            "confusion_matrix": cm,
            "fpr": [round(float(fpr[i]), 4) for i in roc_sample_indices],
            "tpr": [round(float(tpr[i]), 4) for i in roc_sample_indices],
            "top_features": feature_importance
        }
        
        print(f"Metrics: Acc={acc:.4f} | Prec={prec:.4f} | Rec={rec:.4f} | F1={f1:.4f} | ROC-AUC={roc_auc:.4f}")
        
        # Save model
        filename = model_name.lower().replace(" ", "_") + ".pkl"
        model_file = os.path.join(models_dir, filename)
        joblib.dump(model, model_file, compress=3)
        file_size_mb = os.path.getsize(model_file) / (1024 * 1024)
        print(f"Saved {model_file} ({file_size_mb:.2f} MB)")
        metrics_summary[model_name]["file_size_mb"] = round(file_size_mb, 2)
    
    # Save overall metrics
    metrics_path = os.path.join(models_dir, "model_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"\nAll models trained and metrics written to {metrics_path} successfully!")

if __name__ == "__main__":
    train_and_evaluate()
