import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart, Bar } from "recharts";
import { PieChart, Pie, Cell } from "recharts";
import { TrendingUp, ShieldCheck, Target, Award, Globe, FileCheck, Building2 } from "lucide-react";
import BilingualText from "../components/BilingualText";
import { api } from "../api";
import { kpiData, leadsOverTime, productDemand, leadStatus } from "../data/mockData";

const KPICard = ({ icon: Icon, value, labelEn, labelHi, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow transition-all duration-300">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 shadow-lg`}>
      <Icon className="text-white" size={24} strokeWidth={2} />
    </div>
    <div className="text-3xl font-bold text-[#0c2340] tracking-tight">{value}</div>
    <BilingualText english={labelEn} hindi={labelHi} hindiClassName="text-sm text-slate-500" />
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState({
    kpis: kpiData,
    leadsOverTime,
    productDemand,
    leadStatus,
  });

  useEffect(() => {
    Promise.all([
      api.getKpis().catch(() => kpiData),
      api.getLeadsOverTime().catch(() => leadsOverTime),
      api.getProductDemand().catch(() => productDemand),
      api.getLeadStatus().catch(() => leadStatus),
    ]).then(([kpis, leadsOT, products, status]) => {
      setData({ kpis, leadsOverTime: leadsOT, productDemand: products, leadStatus: status });
    });
  }, []);

  return (
    <div className="p-8 min-h-screen">
      {/* Hero + Tagline */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl font-bold text-[#0c2340] tracking-tight">HP-Sentinel</span>
          <span className="px-2 py-0.5 text-xs font-semibold bg-[#e31837] text-white rounded-md uppercase tracking-wider">HPCL</span>
        </div>
        <p className="text-slate-600 text-lg">The Verifiable Intelligence Engine for HPCL Sales</p>
        <p className="text-[#e31837] font-semibold mt-1 italic">We don&apos;t generate leads. We certify them.</p>
        <p className="text-slate-500 text-sm mt-1" style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>हम लीड जनरेट नहीं करते। हम उन्हें प्रमाणित करते हैं।</p>
      </div>

      {/* 3-Factor Verification Banner */}
      <div className="mb-8 p-5 bg-gradient-to-r from-[#0c2340] to-[#122d4d] rounded-2xl text-white shadow-xl">
        <div className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wider">Three-Factor Lead Verification</div>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Globe size={20} />
            </div>
            <div>
              <div className="font-medium">Signal Triangulation</div>
              <div className="text-white/70 text-sm">EC / PCB / Regulatory Signals</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <div className="font-medium">Legal Entity Resolver</div>
              <div className="text-white/70 text-sm">GSTIN / CIN / Filing History</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <FileCheck size={20} />
            </div>
            <div>
              <div className="font-medium">Geo-Logistics & Depot</div>
              <div className="text-white/70 text-sm">Delivery Feasibility / Distance</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={ShieldCheck}
          value={data.kpis.warmEntitiesThisWeek}
          labelEn="Warm Entities This Week"
          labelHi="इस सप्ताह वार्म एंटिटीज"
          color="bg-[#e31837]"
        />
        <KPICard
          icon={TrendingUp}
          value={data.kpis.highConfidenceLeads}
          labelEn="High-Confidence Leads"
          labelHi="उच्च विश्वास लीड"
          color="bg-[#0c2340]"
        />
        <KPICard
          icon={Target}
          value={`${data.kpis.conversionRate}%`}
          labelEn="Conversion Rate"
          labelHi="रूपांतरण दर"
          color="bg-emerald-600"
        />
        <KPICard
          icon={Award}
          value={`${data.kpis.avgConfidence}%`}
          labelEn="Avg Confidence Score"
          labelHi="औसत विश्वास स्कोर"
          color="bg-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Certified Leads (Detected vs Certified)"
            hindi="प्रमाणित लीड (डिटेक्टेड vs प्रमाणित)"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data.leadsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <Legend />
              <Line type="monotone" dataKey="detected" name="Detected" stroke="#94a3b8" strokeWidth={2} dot={{ fill: "#94a3b8" }} strokeDasharray="5 5" />
              <Line type="monotone" dataKey="certified" name="Certified" stroke="#e31837" strokeWidth={2} dot={{ fill: "#e31837" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Pipeline Status"
            hindi="पाइपलाइन स्थिति"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.leadStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                animationBegin={0}
              >
                {data.leadStatus.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 card-glow">
          <BilingualText
            english="Top Product Demand (Certified Entities)"
            hindi="शीर्ष उत्पाद मांग"
            className="text-lg font-semibold text-[#0c2340] mb-4"
          />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.productDemand} layout="vertical" margin={{ left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" width={80} stroke="#64748b" />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }} />
              <Bar dataKey="value" fill="#0c2340" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
