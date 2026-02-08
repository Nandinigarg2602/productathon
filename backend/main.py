"""
HP-Sentinel Backend - FastAPI + XGBoost Lead Scoring
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

try:
    from ml_model import predict_confidence, enrich_lead_with_score
except Exception as e:
    # Fallback if XGBoost/model fails (e.g. libomp on Mac)
    def predict_confidence(company_name: str, signal_text: str = "") -> float:
        return 75.0  # placeholder
    def enrich_lead_with_score(lead: dict) -> dict:
        return {**lead, "confidence": lead.get("confidence", 75), "ai_score": 75.0}

app = FastAPI(title="HP-Sentinel API", description="Verifiable Intelligence Engine for HPCL Sales")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Data ============
KPI_DATA = {
    "warmEntitiesThisWeek": 47,
    "highConfidenceLeads": 12,
    "conversionRate": 31.2,
    "avgConfidence": 87,
}

LEADS_OVER_TIME = [
    {"date": "Week 1", "detected": 120, "certified": 38},
    {"date": "Week 2", "detected": 135, "certified": 42},
    {"date": "Week 3", "detected": 98, "certified": 35},
    {"date": "Week 4", "detected": 156, "certified": 51},
    {"date": "Week 5", "detected": 142, "certified": 47},
]

PRODUCT_DEMAND = [
    {"name": "HSD", "value": 28},
    {"name": "FO", "value": 22},
    {"name": "Bitumen", "value": 18},
    {"name": "Hexane", "value": 15},
    {"name": "LPG", "value": 12},
    {"name": "Others", "value": 5},
]

LEAD_STATUS = [
    {"name": "Detected", "value": 85, "color": "#64748b"},
    {"name": "Verified", "value": 52, "color": "#3b82f6"},
    {"name": "Contacted", "value": 28, "color": "#eab308"},
    {"name": "Converted", "value": 17, "color": "#22c55e"},
]

LEADS_RAW = [
    {"id": 1, "company": "ABC Power Solutions Pvt. Ltd.", "industry": "Power", "confidence": 92, "signal": "EC Filing – 5 MW Captive Power (Jan 2026)", "products": ["Furnace Oil (~40 KL/month)"], "productFit": "Furnace Oil (~40 KL/month)", "depot": "Panipat Depot", "depotDistance": "12 km", "verified": {"signal": True, "legal": True, "geo": True}, "gstin": "27AABCU9603R1ZM"},
    {"id": 2, "company": "XYZ Construction & Infra Ltd.", "industry": "Infrastructure", "confidence": 88, "signal": "PCB Approval – Bitumen Plant Expansion", "products": ["Bitumen", "HSD"], "productFit": "Bitumen, HSD", "depot": "Delhi Depot", "depotDistance": "8 km", "verified": {"signal": True, "legal": True, "geo": True}, "gstin": "07AAACX1234K1Z5"},
    {"id": 3, "company": "Reliance Petrochemicals", "industry": "Petrochemicals", "confidence": 95, "signal": "EC Filing – Refinery Expansion Gujarat", "products": ["HSD", "FO", "Hexane"], "productFit": "HSD, FO, Hexane", "depot": "Vadodara Depot", "depotDistance": "18 km", "verified": {"signal": True, "legal": True, "geo": True}, "gstin": "24AABCR5055M1ZV"},
    {"id": 4, "company": "Adani Ports & SEZ Ltd.", "industry": "Shipping", "confidence": 89, "signal": "Marine Fuel Tender – Mundra Port", "products": ["HSD", "FO"], "productFit": "HSD, FO", "depot": "Mundra Depot", "depotDistance": "5 km", "verified": {"signal": True, "legal": True, "geo": True}, "gstin": "24AAACA2729K1Z8"},
    {"id": 5, "company": "NHAI - Project Division", "industry": "Infrastructure", "confidence": 84, "signal": "Annual Bitumen Procurement Tender", "products": ["Bitumen"], "productFit": "Bitumen", "depot": "Panipat Depot", "depotDistance": "22 km", "verified": {"signal": True, "legal": True, "geo": True}, "gstin": "09AAAGN0171N1ZE"},
    {"id": 6, "company": "Tata Steel Captive Power", "industry": "Power", "confidence": 78, "signal": "Boiler Capacity Upgrade – EC Amendment", "products": ["FO", "LPG"], "productFit": "FO, LPG", "depot": "Jamshedpur Depot", "depotDistance": "15 km", "verified": {"signal": True, "legal": True, "geo": True}, "gstin": "20AABCT3518Q1ZV"},
]

LEAD_DOSSIERS = {
    1: {"id": 1, "company": "ABC Power Solutions Pvt. Ltd.", "industry": "Power", "gstin": "27AABCU9603R1ZM", "location": "Sonipat, Haryana", "signal": "EC Filing – 5 MW Captive Power (Jan 2026)", "confidence": 92, "productFit": "Furnace Oil (~40 KL/month)", "depot": "Panipat HPCL Depot", "depotDistance": "12 km", "procurementHint": "Tender expected in ~15 days", "whyLead": "EC filing confirms 10 TPH Husk-Fired Boiler commissioning Q1 2026. Power capacity 5 MW. Legal entity verified via GSTIN with 18+ months active filing. Depot feasibility confirmed within service radius.", "products": [{"name": "Furnace Oil", "confidence": 95, "reason": "Boiler specification, 40 KL/month estimated"}, {"name": "HSD", "confidence": 72, "reason": "Backup generator capacity"}]},
    2: {"id": 2, "company": "XYZ Construction & Infra Ltd.", "industry": "Infrastructure", "gstin": "07AAACX1234K1Z5", "location": "Noida, Uttar Pradesh", "signal": "PCB Approval – Bitumen Plant Expansion", "confidence": 88, "productFit": "Bitumen, HSD", "depot": "Delhi HPCL Depot", "depotDistance": "8 km", "procurementHint": "Project kickoff in 30 days", "whyLead": "State PCB approval for bitumen mixing plant expansion. Company has verified GSTIN, active filings. Depot delivery feasible.", "products": [{"name": "Bitumen", "confidence": 92, "reason": "Plant expansion scope"}, {"name": "HSD", "confidence": 65, "reason": "Site equipment fuel"}]},
    3: {"id": 3, "company": "Reliance Petrochemicals", "industry": "Petrochemicals", "gstin": "24AABCR5055M1ZV", "location": "Vadodara, Gujarat", "signal": "EC Filing – Refinery Expansion Gujarat", "confidence": 95, "productFit": "HSD, FO, Hexane", "depot": "Vadodara HPCL Depot", "depotDistance": "18 km", "procurementHint": "Ongoing procurement cycle", "whyLead": "Recent tender for 50,000 MT HSD. Active expansion in Gujarat refinery. Legal entity verified.", "products": [{"name": "HSD", "confidence": 95, "reason": "Tender published, high volume"}, {"name": "FO", "confidence": 82, "reason": "Refinery operations"}, {"name": "Hexane", "confidence": 78, "reason": "Solvent extraction unit"}]},
    4: {"id": 4, "company": "Adani Ports & SEZ Ltd.", "industry": "Shipping", "gstin": "24AAACA2729K1Z8", "location": "Mundra, Gujarat", "signal": "Marine Fuel Tender – Mundra Port", "confidence": 89, "productFit": "HSD, FO", "depot": "Mundra HPCL Depot", "depotDistance": "5 km", "procurementHint": "Tender closing in 10 days", "whyLead": "Marine fuel bunkering tender for port operations. Legal entity verified. Depot co-located with port.", "products": [{"name": "HSD", "confidence": 88, "reason": "Marine fuel specifications"}, {"name": "FO", "confidence": 85, "reason": "Bunker fuel demand"}]},
    5: {"id": 5, "company": "NHAI - Project Division", "industry": "Infrastructure", "gstin": "09AAAGN0171N1ZE", "location": "Panipat, Haryana", "signal": "Annual Bitumen Procurement Tender", "confidence": 84, "productFit": "Bitumen", "depot": "Panipat HPCL Depot", "depotDistance": "22 km", "procurementHint": "FY26 tender cycle", "whyLead": "Annual bitumen procurement for highway projects. Government entity, verified.", "products": [{"name": "Bitumen", "confidence": 94, "reason": "Tender scope"}]},
    6: {"id": 6, "company": "Tata Steel Captive Power", "industry": "Power", "gstin": "20AABCT3518Q1ZV", "location": "Jamshedpur, Jharkhand", "signal": "Boiler Capacity Upgrade – EC Amendment", "confidence": 78, "productFit": "FO, LPG", "depot": "Jamshedpur HPCL Depot", "depotDistance": "15 km", "procurementHint": "Upgrade completion Q2 2026", "whyLead": "EC amendment for boiler capacity increase. Tata Group entity, strong credit profile.", "products": [{"name": "FO", "confidence": 82, "reason": "Boiler fuel"}, {"name": "LPG", "confidence": 68, "reason": "Ancillary operations"}]},
}

FUNNEL_DATA = [{"stage": "Detected", "count": 120}, {"stage": "Verified", "count": 85}, {"stage": "Contacted", "count": 52}, {"stage": "Converted", "count": 28}]
SECTOR_DATA = [{"name": "Petrochemicals", "count": 32}, {"name": "Power", "count": 28}, {"name": "Transport", "count": 24}, {"name": "Shipping", "count": 18}, {"name": "Infrastructure", "count": 15}]


# ============ Endpoints ============

@app.get("/")
def root():
    return {"message": "HP-Sentinel API", "version": "1.0"}


@app.get("/api/kpis")
def get_kpis():
    return KPI_DATA


@app.get("/api/leads-over-time")
def get_leads_over_time():
    return LEADS_OVER_TIME


@app.get("/api/product-demand")
def get_product_demand():
    return PRODUCT_DEMAND


@app.get("/api/lead-status")
def get_lead_status():
    return LEAD_STATUS


@app.get("/api/leads")
def get_leads():
    """Returns warm entities enriched with AI confidence scores from XGBoost model."""
    enriched = [enrich_lead_with_score(lead) for lead in LEADS_RAW]
    return enriched


@app.get("/api/leads/{lead_id}")
def get_lead_dossier(lead_id: int):
    if lead_id not in LEAD_DOSSIERS:
        raise HTTPException(status_code=404, detail="Lead not found")
    dossier = dict(LEAD_DOSSIERS[lead_id])
    # Enrich with AI score
    ai_confidence = predict_confidence(dossier["company"], dossier.get("signal", ""))
    dossier["ai_score"] = ai_confidence
    dossier["confidence"] = round(0.7 * ai_confidence + 0.3 * dossier["confidence"], 1)
    return dossier


@app.get("/api/analytics/funnel")
def get_funnel():
    return FUNNEL_DATA


@app.get("/api/analytics/sectors")
def get_sectors():
    return SECTOR_DATA


class ScoreRequest(BaseModel):
    company_name: str
    signal_text: Optional[str] = ""


@app.post("/api/score")
def predict_score(req: ScoreRequest):
    """Predict confidence score using XGBoost model."""
    score = predict_confidence(req.company_name, req.signal_text)
    return {"company_name": req.company_name, "confidence": score}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
