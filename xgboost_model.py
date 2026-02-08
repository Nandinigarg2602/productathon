"""
XGBoostRegressor model trained on guest_accounts.csv
Target: password (numeric) | Features: encoded from username and datetime columns
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os

try:
    import seaborn as sns
    HAS_SEABORN = True
except ImportError:
    HAS_SEABORN = False

# Create output folder for plots
os.makedirs("plots", exist_ok=True)
try:
    plt.style.use("seaborn-v0_8-whitegrid")
except (OSError, ValueError):
    try:
        plt.style.use("seaborn-whitegrid")
    except (OSError, ValueError):
        pass

# Load data
df = pd.read_csv("guest_accounts.csv")
df = df.dropna(subset=["username", "password"])

# Target: password (convert to numeric)
df["password"] = pd.to_numeric(df["password"], errors="coerce")
df = df.dropna(subset=["password"])

# Feature engineering from username
def extract_username_features(username):
    s = str(username)
    return {
        "username_len": len(s),
        "username_sum_ord": sum(ord(c) for c in s),
        "num_digits": sum(c.isdigit() for c in s),
        "num_letters": sum(c.isalpha() for c in s),
    }

features = df["username"].apply(lambda x: pd.Series(extract_username_features(x)))
df = pd.concat([df.reset_index(drop=True), features], axis=1)

# Datetime features
for col in ["valid_from", "valid_to"]:
    if col in df.columns and df[col].notna().any():
        df[col] = pd.to_datetime(df[col], errors="coerce")
        df[f"{col}_hour"] = df[col].dt.hour
        df[f"{col}_day"] = df[col].dt.day
        df[f"{col}_month"] = df[col].dt.month

feature_cols = ["username_len", "username_sum_ord", "num_digits", "num_letters"]
for c in ["valid_from_hour", "valid_from_day", "valid_from_month", "valid_to_hour", "valid_to_day", "valid_to_month"]:
    if c in df.columns:
        feature_cols.append(c)

X = df[feature_cols]
y = df["password"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train XGBoostRegressor
model = xgb.XGBRegressor(n_estimators=100, max_depth=6, learning_rate=0.1, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
y_train_pred = model.predict(X_train)

rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print("XGBoostRegressor Performance:")
print(f"  RMSE:  {rmse:.2f}")
print(f"  MAE:   {mae:.2f}")
print(f"  R²:    {r2:.4f}")

# --- Comparison Tables ---
# 1. Metrics comparison table (train vs test)
metrics_df = pd.DataFrame({
    "Split": ["Train", "Test"],
    "RMSE": [
        np.sqrt(mean_squared_error(y_train, y_train_pred)),
        rmse
    ],
    "MAE": [
        mean_absolute_error(y_train, y_train_pred),
        mae
    ],
    "R²": [
        r2_score(y_train, y_train_pred),
        r2
    ]
})
print("\n--- Metrics Comparison (Train vs Test) ---")
print(metrics_df.to_string(index=False))
metrics_df.to_csv("plots/metrics_comparison.csv", index=False)

# 2. Actual vs Predicted sample table
comparison_df = pd.DataFrame({
    "Actual": y_test.values,
    "Predicted": y_pred.round(2),
    "Residual": (y_test.values - y_pred).round(2),
    "Abs_Error": np.abs(y_test.values - y_pred).round(2)
}).head(15)
print("\n--- Actual vs Predicted (sample) ---")
print(comparison_df.to_string(index=False))
comparison_df.to_csv("plots/actual_vs_predicted.csv", index=False)

# --- Plots ---
residuals = y_test.values - y_pred

# 1. Actual vs Predicted scatter
fig, axes = plt.subplots(2, 2, figsize=(12, 10))

ax = axes[0, 0]
ax.scatter(y_test, y_pred, alpha=0.6, edgecolors="k", linewidth=0.5)
min_val = min(y_test.min(), y_pred.min())
max_val = max(y_test.max(), y_pred.max())
ax.plot([min_val, max_val], [min_val, max_val], "r--", lw=2, label="Perfect prediction")
ax.set_xlabel("Actual Password")
ax.set_ylabel("Predicted Password")
ax.set_title("Actual vs Predicted")
ax.legend()
ax.set_aspect("equal", adjustable="box")

# 2. Residual plot
ax = axes[0, 1]
ax.scatter(y_pred, residuals, alpha=0.6, edgecolors="k", linewidth=0.5)
ax.axhline(y=0, color="r", linestyle="--", lw=2)
ax.set_xlabel("Predicted Password")
ax.set_ylabel("Residual")
ax.set_title("Residual Plot")

# 3. Feature importance
ax = axes[1, 0]
importance = model.feature_importances_
feat_imp = pd.Series(importance, index=feature_cols).sort_values(ascending=True)
feat_imp.plot(kind="barh", ax=ax, color="steelblue", edgecolor="black")
ax.set_xlabel("Importance")
ax.set_title("Feature Importance")

# 4. Target distribution (Train & Test)
ax = axes[1, 1]
ax.hist(y_train, bins=25, alpha=0.6, label="Train", color="steelblue", edgecolor="black")
ax.hist(y_test, bins=25, alpha=0.6, label="Test", color="coral", edgecolor="black")
ax.set_xlabel("Password (target)")
ax.set_ylabel("Count")
ax.set_title("Target Distribution: Train vs Test")
ax.legend()
plt.tight_layout()
plt.savefig("plots/model_analysis.png", dpi=150, bbox_inches="tight")
plt.close()
print("\nSaved: plots/model_analysis.png")

# 5. Correlation heatmap
fig, ax = plt.subplots(figsize=(8, 6))
corr = X.assign(target=y).corr()
if HAS_SEABORN:
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", center=0, ax=ax, square=True)
else:
    im = ax.imshow(corr, cmap="coolwarm", vmin=-1, vmax=1, aspect="auto")
    ax.set_xticks(range(len(corr.columns)))
    ax.set_yticks(range(len(corr.columns)))
    ax.set_xticklabels(corr.columns, rotation=45, ha="right")
    ax.set_yticklabels(corr.columns)
    plt.colorbar(im, ax=ax)
    for i in range(len(corr)):
        for j in range(len(corr)):
            ax.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center")
ax.set_title("Feature & Target Correlation Heatmap")
plt.tight_layout()
plt.savefig("plots/correlation_heatmap.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: plots/correlation_heatmap.png")

# 6. Residual distribution
fig, axes = plt.subplots(1, 2, figsize=(12, 4))
axes[0].hist(residuals, bins=25, edgecolor="black", color="steelblue")
axes[0].set_xlabel("Residual")
axes[0].set_ylabel("Count")
axes[0].set_title("Residual Distribution")
axes[1].boxplot(residuals, vert=True)
axes[1].set_ylabel("Residual")
axes[1].set_title("Residual Box Plot")
plt.tight_layout()
plt.savefig("plots/residual_distribution.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: plots/residual_distribution.png")

# 7. Metrics bar comparison
fig, ax = plt.subplots(figsize=(8, 4))
x = np.arange(len(metrics_df))
width = 0.25
ax.bar(x - width, metrics_df["RMSE"], width, label="RMSE")
ax.bar(x, metrics_df["MAE"], width, label="MAE")
ax.bar(x + width, metrics_df["R²"] * 100, width, label="R² (×100)")
ax.set_xticks(x)
ax.set_xticklabels(metrics_df["Split"])
ax.set_ylabel("Value")
ax.set_title("Model Metrics: Train vs Test")
ax.legend()
plt.tight_layout()
plt.savefig("plots/metrics_comparison.png", dpi=150, bbox_inches="tight")
plt.close()
print("Saved: plots/metrics_comparison.png")

# Save model
model.save_model("xgboost_guest_model.json")
print("\nModel saved to xgboost_guest_model.json")
