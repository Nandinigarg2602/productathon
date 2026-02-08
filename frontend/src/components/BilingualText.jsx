export default function BilingualText({ english, hindi, className = "", hindiClassName = "text-sm text-slate-500" }) {
  return (
    <div className={className}>
      <div>{english}</div>
      {hindi && <div className={`font-hindi ${hindiClassName}`} style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}>{hindi}</div>}
    </div>
  );
}
