import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Factory, Ship, Car, Zap, ChevronRight, Shield } from "lucide-react";
import BilingualText from "../components/BilingualText";
import { api } from "../api";
import { leads } from "../data/mockData";

const industryIcons = {
  Petrochemicals: Factory,
  Power: Zap,
  Transport: Car,
  Shipping: Ship,
  Manufacturing: Factory,
  Infrastructure: Building2,
};

function VerificationBadge({ label, verified }) {
  return (
    <span
      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${
        verified ? "bg-emerald-500/15 text-emerald-700" : "bg-slate-100 text-slate-500"
      }`}
      title={label}
    >
      {verified ? <Shield size={12} className="verified-badge" /> : null}
      {label}
    </span>
  );
}

export default function LeadsQueue() {
  const [leadList, setLeadList] = useState(leads);

  useEffect(() => {
    api.getLeads().then(setLeadList).catch(() => setLeadList(leads));
  }, []);

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <BilingualText
          english="Warm Entities Queue"
          hindi="वार्म एंटिटीज कतार"
          className="text-2xl font-bold text-[#0c2340]"
          hindiClassName="text-base text-slate-500"
        />
        <p className="text-slate-600 mt-1">Entities that passed Signal + Legal + Geo-Logistics verification</p>
      </div>

      <div className="grid gap-4">
        {leadList.map((lead) => {
          const Icon = industryIcons[lead.industry] || Building2;
          return (
            <Link
              key={lead.id}
              to={`/lead/${lead.id}`}
              className="block"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow flex flex-col md:flex-row md:items-center md:justify-between gap-4 group">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#0c2340] to-[#122d4d] flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Icon className="text-white" size={26} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-lg text-[#0c2340] group-hover:text-[#e31837] transition-colors">
                      {lead.company}
                    </div>
                    <div className="text-slate-500 text-sm flex items-center gap-2 mt-0.5">
                      {lead.industry} · {lead.depot} ({lead.depotDistance})
                    </div>
                    <div className="text-slate-600 text-sm mt-2 line-clamp-1">{lead.signal}</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <VerificationBadge label="Signal" verified={lead.verified.signal} />
                      <VerificationBadge label="Legal" verified={lead.verified.legal} />
                      <VerificationBadge label="Geo" verified={lead.verified.geo} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Confidence</div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                            style={{ width: `${Math.round(lead.confidence)}%` }}
                          />
                        </div>
                        <span className="font-bold text-[#0c2340]">{lead.confidence}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-[#0c2340]">{lead.productFit}</div>
                    <div className="text-xs text-slate-500">Product Fit</div>
                  </div>

                  <div className="flex items-center gap-2 px-4 py-2 bg-[#e31837] text-white rounded-xl font-medium group-hover:bg-[#c41430] transition-colors">
                    <span>View Battle Card</span>
                    <ChevronRight size={18} />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
