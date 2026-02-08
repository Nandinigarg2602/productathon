# HP-Sentinel

**The Verifiable Intelligence Engine for HPCL Sales**

> We don't generate leads. We certify them.

## Project Structure

```
Productathon/
├── backend/          # FastAPI + XGBoost
│   ├── main.py       # API server
│   ├── ml_model.py   # Lead scoring (loads your XGBoost model)
│   └── requirements.txt
├── frontend/         # React + Vite
│   └── src/
├── xgboost_guest_model.json  # Trained XGBoost model
├── guest_accounts.csv
└── xgboost_model.py  # Training script
```

## Run the Project

### 1. Backend (API + AI Model)

```bash
cd backend
pip install -r requirements.txt
python main.py
```

API runs at **http://localhost:8000**
- Docs: http://localhost:8000/docs

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** (proxies `/api` to backend)

### 3. Full Stack

Open two terminals:
- Terminal 1: `cd backend && python main.py`
- Terminal 2: `cd frontend && npm run dev`

Then open http://localhost:5173

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| GET /api/kpis | Dashboard KPIs |
| GET /api/leads | Warm entities (AI-enriched confidence) |
| GET /api/leads/{id} | Lead dossier (Battle Card) |
| GET /api/leads-over-time | Chart data |
| GET /api/product-demand | Product demand |
| GET /api/lead-status | Pipeline status |
| GET /api/analytics/funnel | Conversion funnel |
| GET /api/analytics/sectors | Top sectors |
| POST /api/score | Predict confidence (company_name, signal_text) |

## AI Model

- Uses your trained XGBoost model (`xgboost_guest_model.json`)
- Extracts features from company name + signal text
- Outputs lead confidence score (0-100)
- No retraining — loads existing model only
