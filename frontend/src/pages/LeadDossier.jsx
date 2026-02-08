import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import BilingualText from "../components/BilingualText";
import { api } from "../api";
import { leadDossiers } from "../data/mockData";

export default function LeadDossier() {
  const { id } = useParams();
  const [d, setD] = useState(leadDossiers[id] || leadDossiers[1]);

  useEffect(() => {
    api.getLeadDossier(id).then(setD).catch(() => setD(leadDossiers[id] || leadDossiers[1]));
  }, [id]);

  if (!d) return null;

  return (
    <div className="p-8 min-h-screen">
      <Link to="/leads" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#e31837] mb-6 transition-colors">
        <ArrowLeft size={18} />
        <span>Back to Warm Entities</span>
      </Link>

      {/* HPCL Battle Card - Hero */}
      <div className="bg-gradient-to-br from-[#0c2340] via-[#0f2942] to-[#122d4d] rounded-3xl shadow-2xl p-8 mb-6 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e31837]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#e31837] rounded-full text-sm font-semibold mb-3">
                <CheckCircle size={16} />
                Verified High-Value Lead
              </span>
              <div className="text-2xl font-bold mb-1">{d.company}</div>
              <div className="text-white/80 text-sm">{d.industry} · GSTIN: {d.gstin}</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-[#e31837]">{Math.round(d.confidence)}%</div>
              <div className="text-white/70 text-sm">Confidence</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div>
              <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Signal</div>
              <div className="text-sm font-medium">{d.signal}</div>
            </div>
            <div>
              <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Product Fit</div>
              <div className="text-sm font-medium">{d.productFit}</div>
            </div>
            <div>
              <div className="text-white/60 text-xs uppercase tracking-wider mb-1">Logistics</div>
              <div className="text-sm font-medium flex items-center gap-1">
                <MapPin size={14} /> {d.depot} · {d.depotDistance}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/5 rounded-xl">
            <div className="text-white/70 text-xs uppercase tracking-wider mb-1">Procurement Hint</div>
            <div className="text-sm font-medium">{d.procurementHint}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button className="flex flex-col items-start px-6 py-3 bg-[#0c2340] text-white rounded-xl font-medium hover:bg-[#0a1d33] transition-colors shadow-lg">
          <span className="flex items-center gap-2"><Phone size={20} /> Call Site Manager</span>
          <span className="text-xs opacity-80 mt-0.5" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>साइट मैनेजर को कॉल करें</span>
        </button>
        <button className="flex flex-col items-start px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-lg">
          <span className="flex items-center gap-2"><MessageCircle size={20} /> Send WhatsApp Alert</span>
          <span className="text-xs opacity-80 mt-0.5" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>व्हाट्सएप अलर्ट भेजें</span>
        </button>
        <button className="flex flex-col items-start px-6 py-3 bg-white border-2 border-[#0c2340] text-[#0c2340] rounded-xl font-medium hover:bg-[#0c2340] hover:text-white transition-colors">
          <span className="flex items-center gap-2"><FileText size={20} /> View Draft Proposal</span>
          <span className="text-xs opacity-80 mt-0.5" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>ड्राफ्ट प्रस्ताव देखें</span>
        </button>
      </div>

      {/* Why This Lead + Product Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Why this lead?"
            hindi="यह लीड क्यों?"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <p className="text-slate-600 leading-relaxed">{d.whyLead}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <h3 className="font-semibold text-lg text-[#0c2340] mb-4">Product Recommendations</h3>
          <div className="space-y-4">
            {d.products.map((p) => (
              <div key={p.name} className="border border-slate-100 rounded-xl p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#0c2340]">{p.name}</span>
                  <span className="text-sm font-semibold text-[#e31837]">{p.confidence}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#e31837] rounded-full"
                    style={{ width: `${p.confidence}%` }}
                  />
                </div>
                <div className="text-sm text-slate-500">{p.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
