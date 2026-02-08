import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { MapPin } from "lucide-react";
import BilingualText from "../components/BilingualText";
import { api } from "../api";
import { funnelData, sectorData, productDemand, leadsOverTime } from "../data/mockData";

export default function Analytics() {
  const [data, setData] = useState({
    funnel: funnelData,
    sectors: sectorData,
    products: productDemand,
    leadsOverTime,
  });

  useEffect(() => {
    Promise.all([
      api.getFunnel().catch(() => funnelData),
      api.getSectors().catch(() => sectorData),
      api.getProductDemand().catch(() => productDemand),
      api.getLeadsOverTime().catch(() => leadsOverTime),
    ]).then(([funnel, sectors, products, leadsOT]) => {
      setData({ funnel, sectors, products, leadsOverTime: leadsOT });
    });
  }, []);

  return (
    <div className="p-8 min-h-screen">
      <div className="mb-8">
        <BilingualText
          english="Analytics & Executive Dashboard"
          hindi="विश्लेषण और कार्यकारी डैशबोर्ड"
          className="text-2xl font-bold text-[#0c2340]"
          hindiClassName="text-base text-slate-500"
        />
        <p className="text-slate-600 mt-1">Detected → Verified → Contacted → Converted</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Conversion Funnel"
            hindi="रूपांतरण फ़नल"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <div className="space-y-4">
            {data.funnel.map((s, i) => (
              <div key={s.stage} className="flex items-center gap-4">
                <div className="w-32 text-slate-600">{s.stage}</div>
                <div className="flex-1 h-10 bg-slate-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all"
                    style={{
                      width: `${(s.count / data.funnel[0].count) * 100}%`,
                      backgroundColor: i === 0 ? "#64748b" : i === 1 ? "#3b82f6" : i === 2 ? "#eab308" : "#22c55e",
                    }}
                  />
                </div>
                <span className="font-bold text-[#0c2340] w-12">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* India Heatmap placeholder */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow flex flex-col items-center justify-center">
          <MapPin className="text-[#e31837] mb-4" size={48} />
          <BilingualText
            english="Lead Density Heatmap - India"
            hindi="लीड घनत्व हीटमैप - भारत"
            className="text-lg font-semibold text-[#0c2340] text-center"
          />
          <div className="mt-4 w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
            <span className="text-slate-500 text-sm">Map visualization placeholder</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Top Sectors"
            hindi="शीर्ष क्षेत्र"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.sectors}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.sectors.map((_, i) => (
                  <Cell key={i} fill={i % 2 === 0 ? "#0c2340" : "#e31837"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Top Products"
            hindi="शीर्ष उत्पाद"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.products}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="value" fill="#0c2340" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Weekly Leads Trend"
            hindi="साप्ताहिक लीड ट्रेंड"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.leadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="certified" fill="#e31837" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
