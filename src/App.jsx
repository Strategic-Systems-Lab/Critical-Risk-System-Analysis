import{useState,useEffect,useRef}from"react";
import{LegalPage}from"./legal";
import{cl,risk,stab,mkY,monteCarloWealth}from"./formulaHelpers";
import{simHealthcare,CLS_HEALTHCARE}from"./classes/healthcare";
import{simRealEstate,CLS_REALESTATE}from"./classes/realEstate";
import{simStocks,CLS_STOCKS}from"./classes/stocksEtf";
import{simLifestyle,CLS_LIFESTYLE,TRAITS}from"./classes/lifestyle";
import{simRetirement,CLS_RETIREMENT}from"./classes/retirement";
import{RiskIntelligencePanel}from"./package2";
const G="#4a5568",D="#00d4ff",V="#00ff9d",K="#1e2d40",B="#8892a4",J="#ff2d55",Q="#ff6b35",X="#0d1117",O="monospace",E="center",P="pointer",U="uppercase",T="transparent",A="balance",I="hidden",Y="right";

/**
 * Altman Z''-Score (1995 revision, for private/non-manufacturing firms) —
 * real, peer-reviewed bankruptcy-prediction formula, published coefficients
 * used UNMODIFIED. Replaces the Company class's previous heuristic
 * "Financial" formula.
 *
 * Honest limitation: our simplified model doesn't track a full balance
 * sheet, so 2 of the 4 required ratios are approximated from available
 * fields rather than measured directly:
 *   X1 (Working Capital / Total Assets) — approximated as 3 months of
 *       operating surplus (revenue-expenses), since no current-assets/
 *       current-liabilities split exists in this model.
 *   X2 (Retained Earnings / Total Assets) — approximated using book
 *       equity (assets-debt), since accumulated historical earnings
 *       aren't tracked. This makes X2 correlated with X4 by construction —
 *       a real limitation, not hidden here.
 * X3 (EBIT/Assets) and X4 (Equity/Liabilities) are computed directly from
 * existing fields with no invented proxy.
 * Thresholds (1.1 = distress, 2.6 = safe) are Altman's own published
 * cutoffs — the risk-percentage mapping is linearly anchored to them.
 */
function altmanZScore(p){
const TA=Math.max(1,p.assets*1000),TL=Math.max(1,p.debt);
const ebit=(p.revenue-p.expenses)*12,equity=TA-TL,wc=(p.revenue-p.expenses)*3;
return 6.56*(wc/TA)+3.26*(equity/TA)+6.72*(ebit/TA)+1.05*(equity/TL);
}
function financialRiskFromZ(z){return cl(82-(z-1.1)/(2.6-1.1)*62,8,82);}
function sanityWarn(id,p){
if(id==="7"&&p.rent_income<p.monthly_costs)return"Rent doesn't cover monthly costs — this structurally inflates Interest rate exposure and Liquidity risk below.";
if(id==="9"&&p.expenses>p.income)return"Expenses exceed income — this structurally inflates Debt burden and Lifestyle inflation risk below.";
if(id==="1"&&p.expenses>p.revenue)return"Expenses exceed revenue — this structurally inflates Financial and Dependency risk below.";
return null;
}
function projectWealth(cls,p,years,stability){
if(cls==="8")return monteCarloWealth(p.capital,p.monthly_savings,years,p.stock_pct);
if(cls==="10")return monteCarloWealth(p.pension_assets,p.monthly_contribution,years,p.equity_pct);
const rate=(stability-50)/100*0.06+0.04;
let start=0,monthly=0;
if(cls==="7"){start=(p.rent_income*12)/0.05-p.mortgage;monthly=(p.rent_income-p.monthly_costs);}
else return null;
let v=start;const pts=[{year:0,value:Math.round(v)}];
for(let i=1;i<=years;i++){v=v*(1+rate)+monthly*12;pts.push({year:i,value:Math.round(v)});}
return{start:Math.round(start),final:Math.round(v),pts,rate};
}
function projectNetWorth(p,years,stability){
const rate=(stability-50)/100*0.04+0.025;
const debtShare=p.debt>0?Math.min(0.7,0.3+p.discipline*0.04):0;
const toDebt=p.monthly_savings*debtShare,toSavings=p.monthly_savings*(1-debtShare);
let debt=p.debt,sav=p.savings;
const pts=[{year:0,debt:Math.round(debt),savings:Math.round(sav),net:Math.round(sav-debt)}];
for(let i=1;i<=years;i++){sav=sav*(1+rate)+toSavings*12;debt=Math.max(0,debt-toDebt*12);pts.push({year:i,debt:Math.round(debt),savings:Math.round(sav),net:Math.round(sav-debt)});}
return{startDebt:Math.round(p.debt),startSavings:Math.round(p.savings),startNet:Math.round(p.savings-p.debt),finalDebt:Math.round(debt),finalSavings:Math.round(sav),finalNet:Math.round(sav-debt),pts,rate};
}

function simAny(id,p,y){
if(id==="1"){
const sm=({aggressive:1.5,cooperative:.75,authoritarian:1.65,visionary:1.05,stable:1,democratic:.85})[(p.style||"stable").toLowerCase()]||1;
const risks={Burnout:risk(p.risk_tolerance*sm,(p.training+p.culture)/2,y,1.2,90,10),Financial:financialRiskFromZ(altmanZScore(p)),Cyber:risk(p.ai_usage*1.05,p.cybersec*1.1,y,1.3,88,12),Governance:risk(10-p.compliance,p.transparency,y,.85,74,8),Market:risk(10-p.adaptability,p.innovation*.95,y,.95,72,12),Dependency:risk(p.risk_tolerance,p.redundancy*1.2,y,.95,76,8),Operational:risk(10-p.compliance,p.redundancy,y,.75,65,7),"Knowledge loss":risk(10-p.training,p.culture*.8,y,.85,66,12),Automation:risk(p.ai_usage,p.compliance*1.05,y,1.1,80,12),Reputation:risk(10-p.transparency,p.culture*.9,y,.65,60,7)};
const stability=stab([p.culture,p.training,p.redundancy,p.compliance,p.cashflow],[p.risk_tolerance*sm,10-p.cybersec,10-p.adaptability]);
return{risks,stability,yearly:mkY(stability,y)};
}
const simFn={"4":simHealthcare,"7":simRealEstate,"8":simStocks,"9":simLifestyle,"10":simRetirement}[id];
const{risks,stability}=simFn(p,y);
return{risks,stability,yearly:mkY(stability,y)};
}

const CLS={
"1":{icon:"🏢",label:"Company",eLabel:"Company name",color:D,hasStyle:true,
 profiles:[{n:"Startup",p:{employees:50,assets:500,debt:200000,revenue:80000,expenses:90000,cashflow:4,innovation:8,risk_tolerance:7,digitization:7,cybersec:4,training:4,compliance:3,culture:7,redundancy:2,ai_usage:5,adaptability:8,transparency:6,style:"visionary"}},{n:"Corporation",p:{employees:5000,assets:8000,debt:3000000,revenue:1500000,expenses:1100000,cashflow:7,innovation:6,risk_tolerance:4,digitization:6,cybersec:7,training:6,compliance:8,culture:6,redundancy:7,ai_usage:6,adaptability:5,transparency:6,style:"stable"}},{n:"Crisis Co.",p:{employees:800,assets:2000,debt:1800000,revenue:300000,expenses:380000,cashflow:2,innovation:3,risk_tolerance:6,digitization:3,cybersec:3,training:3,compliance:4,culture:3,redundancy:3,ai_usage:4,adaptability:3,transparency:3,style:"authoritarian"}},{n:"Tech Giant",p:{employees:12000,assets:9500,debt:1200000,revenue:4000000,expenses:2200000,cashflow:9,innovation:9,risk_tolerance:5,digitization:9,cybersec:8,training:7,compliance:7,culture:7,redundancy:8,ai_usage:9,adaptability:8,transparency:6,style:"visionary"}},{n:"Manual",p:null}],
 fields:[{k:"employees",l:"Employees",d:500,lo:1,hi:15000},{k:"assets",l:"Assets (€)",d:3000,lo:1,hi:10000},{k:"debt",l:"Total Debt (€)",d:500000,lo:0,hi:3500000},{k:"revenue",l:"Monthly Revenue (€)",d:200000,lo:0,hi:4500000},{k:"expenses",l:"Monthly Expenses (€)",d:150000,lo:0,hi:2500000},{k:"cashflow",l:"Cashflow",d:5},{k:"innovation",l:"Innovation",d:5},{k:"risk_tolerance",l:"Risk Tolerance",d:5},{k:"digitization",l:"Digitization",d:5},{k:"cybersec",l:"Cybersecurity",d:5},{k:"training",l:"Training",d:5},{k:"compliance",l:"Compliance",d:5},{k:"culture",l:"Culture",d:5},{k:"redundancy",l:"Redundancy",d:5},{k:"ai_usage",l:"AI Usage",d:5},{k:"adaptability",l:"Adaptability",d:5},{k:"transparency",l:"Transparency",d:5}]},
"4":CLS_HEALTHCARE,
"7":CLS_REALESTATE,
"8":CLS_STOCKS,
"9":CLS_LIFESTYLE,
"10":CLS_RETIREMENT,
};

function localAI(e){
try{
 const s=Object.entries(e.risks||{}).sort((a,b)=>b[1]-a[1]);
 if(!s.length)return"**Situation Assessment**\nNo risk data available.";
 const top=s.slice(0,3),bot=s[s.length-1],t0=top[0],t1=top[1],t2=top[2];
 const avg=e.avg||0,stb=e.stability||0,yrs=e.years||1;
 const status=avg>=65?"critically unstable and at high risk of systemic failure":avg>=45?"under significant structural pressure with multiple elevated risks":"moderately stable with manageable risk exposure";
 const urgent=avg>=65?"Without immediate intervention, cascading failures are likely within 12-24 months.":avg>=45?"Targeted action within the next 6-12 months is essential to prevent risk escalation.":"The system has time to act strategically, but complacency could allow risks to compound.";
 const forecast=avg>=65?"Without action, structural failure is projected within 2-3 years. Implementing the recommendations below could realistically restore stability to "+Math.min(99,stb+20)+"% within 18 months.":avg>=45?"Without intervention, critical thresholds will be breached within 4-5 years. Proactive measures could reduce overall risk load to the "+Math.max(20,avg-20)+"% range within 24 months.":"The system is on a manageable trajectory. Consistent implementation of best practices could push stability above "+Math.min(95,stb+10)+"% over the next "+yrs+" years.";
 const rootExplain=avg>=65?"These three risks form a self-reinforcing failure chain. When "+t0[0]+" reaches critical levels, it directly amplifies "+(t1?t1[0]:"secondary risks")+", undermining the ability to respond effectively.":avg>=45?"The interaction between "+t0[0]+" and "+(t1?t1[0]:"other risks")+" is creating compounding pressure. Each risk elevates the impact of the others, making isolated fixes insufficient.":"The risk profile shows concentration in "+t0[0]+" as the primary concern. Addressing this early will prevent it from triggering secondary cascades.";
 return["**Situation Assessment**",e.entity+" ("+e.label+") is "+status+" after "+yrs+" year"+(yrs>1?"s":"")+". Overall risk load: "+avg+"% — stability score: "+stb+"%. The dominant risk is "+t0[0]+" at "+t0[1]+"%. "+urgent+(e.warn?" ⚠ "+e.warn:""),"","**Root Cause Analysis**",rootExplain,"","1. "+t0[0]+" ("+t0[1]+"%) is the primary failure driver — this risk has the highest weighted impact on overall system stability.",t1?"2. "+t1[0]+" ("+t1[1]+"%) is compounding the situation — its interaction with "+t0[0]+" creates a multiplier effect that is difficult to address independently.":null,t2?"3. "+t2[0]+" ("+t2[1]+"%) represents a third vulnerability — if left unaddressed, it could become the dominant risk within "+Math.ceil(yrs/2)+" years.":null,"","**Priority Action Plan**","1. Reduce "+t0[0]+" by 20-30% within the next 12 months. This is the highest-leverage intervention available and will produce the greatest stabilisation effect.","2. Break the "+t0[0]+(t1?" → "+t1[0]:"")+" cascade within 6 months by addressing the shared root cause — likely in governance, resource allocation, or operational processes.","3. Leverage "+bot[0]+" ("+bot[1]+"%) as a resilience anchor. This is your strongest area — invest in it to buffer the impact of the risks above.","","**5-Year Trajectory Forecast**",forecast].filter(l=>l!=null).join("\n");
}catch(err){return"**Analysis**\nError: "+String(err);}
}

function DonutChart({risks,color}){
const entries=Object.entries(risks).sort((a,b)=>b[1]-a[1]);
const total=entries.reduce((s,[,v])=>s+v,0)||1;
const R=54,r=32,cx=64,cy=64;
const colors=[J,Q,"#ffaa00","#ffd700","#a3e635",V];
let angle=-Math.PI/2;
const slices=entries.map(([name,val],i)=>{
 const pct=val/total;
 const a=pct*2*Math.PI;
 const x1=cx+R*Math.cos(angle),y1=cy+R*Math.sin(angle);
 angle+=a;
 const x2=cx+R*Math.cos(angle),y2=cy+R*Math.sin(angle);
 const xi=cx+r*Math.cos(angle-a/2),yi=cy+r*Math.sin(angle-a/2);
 const large=a>Math.PI?1:0;
 const col=colors[Math.min(i,colors.length-1)];
 return{name,val,pct:Math.round(pct*100),path:`M${cx},${cy} L${x1},${y1} A${R},${R},0,${large},1,${x2},${y2} Z`,col};
});
const high=entries.filter(([,v])=>v>=70).length;
const elev=entries.filter(([,v])=>v>=50&&v<70).length;
const stable=entries.filter(([,v])=>v<50).length;
return (<div>
 <div style={{display:"flex",gap:12,alignItems:E,marginBottom:10}}>
  <svg width={128} height={128} viewBox="0 0 128 128">
   {slices.map((s,i)=>(<path key={i} d={s.path} fill={s.col} opacity={0.9} stroke="#060810" strokeWidth={1.5}/>))}
   <circle cx={cx} cy={cy} r={r} fill="#111827"/>
   <text x={cx} y={cy-6} textAnchor="middle" fill="#e2e8f0" fontSize={14} fontWeight={800} fontFamily={O}>{Math.round(total/entries.length)}%</text>
   <text x={cx} y={cy+10} textAnchor="middle" fill={G} fontSize={8} fontFamily={O}>avg load</text>
  </svg>
  <div style={{flex:1}}>
   {[{l:"⚠ Critical",c:J,n:high},{l:"▲ Elevated",c:Q,n:elev},{l:"✓ Stable",c:V,n:stable}].map(g=>(<div key={g.l} style={{display:"flex",justifyContent:"space-between",alignItems:E,marginBottom:6}}><span style={{fontSize:11,color:g.c}}>{g.l}</span><div style={{display:"flex",alignItems:E,gap:6}}><div style={{width:60,height:4,background:K,borderRadius:2,overflow:I}}><div style={{height:"100%",width:(g.n/entries.length*100)+"%",background:g.c,borderRadius:2}}></div></div><span style={{fontSize:11,fontFamily:O,color:g.c,minWidth:16,textAlign:Y}}>{g.n}</span></div></div>))}
   <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #1e2d40",fontSize:10,color:G}}>
    {entries.slice(0,3).map(([n,v])=>(<div key={n} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{color:B,overflow:I,textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{n}</span><span style={{color:J,fontFamily:O,fontWeight:700,flexShrink:0,marginLeft:4}}>{v}%</span></div>))}
   </div>
  </div>
 </div>
 <div style={{marginBottom:4,fontSize:10,color:G,letterSpacing:1,textTransform:U,fontFamily:O}}>Overall Risk Scale</div>
 <div style={{position:"relative",height:20,borderRadius:4,overflow:I,background:"linear-gradient(90deg,#00ff9d 0%,#ffd700 35%,#ff6b35 60%,#ff2d55 80%,#cc0033 100%)"}}>
  <div style={{position:"absolute",top:0,bottom:0,left:Math.min(95,Math.round(total/entries.length))+"%",width:3,background:"#fff",borderRadius:2,boxShadow:"0 0 6px rgba(255,255,255,0.8)",transform:"translateX(-50%)"}}></div>
 </div>
 <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:G,marginTop:2,fontFamily:O}}><span>0%</span><span>Stable</span><span>Elevated</span><span>Critical</span><span>100%</span></div>
</div>);
}

function Chart({yearly,color}){
if(!yearly||yearly.length<2)return null;
const W=300,H=68,pad=8,vals=yearly.map(y=>y.stability);
const lo=Math.min(...vals)-5,hi=Math.max(...vals)+5;
const px=i=>pad+(i/(vals.length-1))*(W-2*pad);
const py=v=>H-pad-((v-lo)/((hi-lo)||1))*(H-2*pad);
return (<svg width="100%" viewBox={"0 0 "+W+" "+H} style={{overflow:"visible"}}><defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.25"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs><path d={"M"+px(0)+","+H+" "+vals.map((v,i)=>"L"+px(i)+","+py(v)).join(" ")+" L"+px(vals.length-1)+","+H+" Z"} fill="url(#cg)"/><polyline points={vals.map((v,i)=>px(i)+","+py(v)).join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round"/>{vals.map((v,i)=><circle key={i} cx={px(i)} cy={py(v)} r="3" fill={color}/>)}</svg>);
}
function MD({text,color}){
if(!text)return null;
return (<div>{text.split("\n").map((line,i)=>{
 if(line.startsWith("**")&&line.endsWith("**"))return <div key={i} style={{color,fontWeight:800,fontSize:12,letterSpacing:1,textTransform:U,marginTop:i>0?14:0,marginBottom:5,fontFamily:O,borderBottom:"1px solid "+color+"30",paddingBottom:3}}>{line.slice(2,-2)}</div>;
 if(!line.trim())return <div key={i} style={{height:5}}/>;
 return <div key={i} style={{fontSize:13,color:"#c4cfdf",lineHeight:1.8}}>{line}</div>;
})}</div>);
}

function NodeCanvas(){
const ref=useRef();
useEffect(()=>{
 const cv=ref.current;if(!cv)return;
 const ctx=cv.getContext("2d");
 let W=cv.offsetWidth||300,H=cv.offsetHeight||300,raf;
 cv.width=W;cv.height=H;
 const N=16;
 const C=["#ff4444","#ffd700",V];
 const nodes=Array.from({length:N},(_,i)=>({
  x:(i%4+.5)*(W/4)+(Math.random()-.5)*(W*.15),
  y:(Math.floor(i/4)*.34+Math.random()*.28)*(H*.34),
  vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.3,
  r:Math.random()*2+2,pulse:Math.random()*Math.PI*2,
  col:C[i%3]
 }));
 function draw(){
  ctx.clearRect(0,0,W,H);
  nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H*.34)n.vy*=-1;n.pulse+=.02;});
  for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
   const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);
   if(d<110){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle="rgba(255,200,50,"+((1-d/110)*.25)+")";ctx.lineWidth=.8;ctx.stroke();}
  }
  nodes.forEach(n=>{
   const dx=n.x-W/2,dy=n.y-H*.28,d=Math.sqrt(dx*dx+dy*dy);if(d<72){const a=Math.atan2(dy,dx);n.x=W/2+Math.cos(a)*73;n.y=H*.28+Math.sin(a)*73;}
   const p=Math.sin(n.pulse)*.5+1.5;
   ctx.beginPath();ctx.arc(n.x,n.y,n.r*p,0,Math.PI*2);ctx.fillStyle=n.col;ctx.globalAlpha=.7;ctx.fill();ctx.globalAlpha=1;
  });
  raf=requestAnimationFrame(draw);
 }
 draw();
 return ()=>{cancelAnimationFrame(raf);};
},[]);
return <canvas ref={ref} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} />;
}


const rc=v=>v>=70?J:v>=50?Q:v>=30?"#ffd700":V;
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input[type=range]{-webkit-appearance:none;width:100%;height:4px;background:#1e2d40;border-radius:2px;outline:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#00d4ff;cursor:pointer}input[type=number]::-webkit-inner-spin-button{opacity:1}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e2d40}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(0,212,255,0.3)}50%{box-shadow:0 0 45px rgba(0,212,255,0.6)}}@keyframes spin{to{transform:rotate(360deg)}}.F{animation:fadeUp .35s ease forwards}`;
const STEPS=["Reading parameters","Simulating system","Calculating risks","Preparing analysis","Result ready"];
const SRANGES=[[0,20],[20,50],[50,75],[75,95],[95,100]];
const PLAN_CLS={free:["1","7","8","9"],pro:["1","4","7","8","9","10"]};
const DAILY_LIMIT=1;

export default function App(){
const[page,setPage]=useState("home");
const[cls,setCls]=useState("");
const[profIdx,setProfIdx]=useState(0);
const[params,setParams]=useState({});
const[entity,setEntity]=useState("");
const[years,setYears]=useState(5);
const[sty,setSty]=useState("stable");
const[loading,setLoading]=useState(false);
const[loadPct,setLoadPct]=useState(0);
const[result,setResult]=useState(null);
const[history,setHistory]=useState([]);
const[aiText,setAiText]=useState("");
const[aiLoad,setAiLoad]=useState(false);
const[plan,setPlan]=useState("free");
const[usage,setUsage]=useState(()=>({date:new Date().toDateString(),count:0}));

const cfg=cls?CLS[cls]:null;
const limited=plan==="free";
const today=new Date().toDateString();
const usedToday=usage.date===today?usage.count:0;
const atLimit=limited&&usedToday>=DAILY_LIMIT;
function trackUsage(){if(limited){setUsage(u=>({date:today,count:(u.date===today?u.count:0)+1}));}}

useEffect(()=>{
 if(!cfg)return;
 const pr=cfg.profiles[profIdx]?.p;
 const init={};cfg.fields.forEach(f=>{init[f.k]=pr?(pr[f.k]??f.d):f.d;});
 if(cfg.hasTraits)init.traits=pr?.traits||[];
 setParams(init);setSty(pr?.style||"stable");
 const maxY=cfg.maxYears||20;
 if(cls==="10")setYears(cl((init.retire_age||65)-(init.age||35),1,maxY));
 else setYears(y=>Math.min(y,maxY));
},[cls,profIdx]);

useEffect(()=>{if(cls==="10")setYears(cl((params.retire_age||65)-(params.age||35),1,CLS["10"].maxYears||20));},[params.age,params.retire_age,cls]);

const sp=(k,v)=>setParams(p=>({...p,[k]:v}));
const toggleTrait=k=>setParams(p=>{const t=p.traits||[];if(t.includes(k))return{...p,traits:t.filter(x=>x!==k)};if(t.length>=3)return p;return{...p,traits:[...t,k]};});
function startLoad(ms,cb){setLoading(true);setLoadPct(0);let p=0;const iv=setInterval(()=>{p+=100/(ms/40);const pct=Math.min(100,Math.round(p));setLoadPct(pct);if(pct>=100){clearInterval(iv);setTimeout(()=>{setLoading(false);cb();},200);}},40);}
function buildEntry(p,yr){
 const res=simAny(cls,p,yr);
 const rk={};Object.entries(res.risks).forEach(([k,v])=>{rk[k]=cl(v);});
 const avg=Math.round(Object.values(rk).reduce((a,b)=>a+b,0)/Object.values(rk).length);
 const sorted=Object.entries(rk).sort((a,b)=>b[1]-a[1]);
 return{id:Date.now(),cls,label:cfg.label,icon:cfg.icon,entity,years:yr,params:p,stability:res.stability,avg,worst:sorted[0][0],best:sorted[sorted.length-1][0],risks:rk,yearly:res.yearly,wealth:projectWealth(cls,p,yr,res.stability),netWorth:cls==="9"?projectNetWorth(p,yr,res.stability):null,date:new Date().toLocaleDateString(),cst:cfg.fields.filter(f=>(p[f.k]??f.d)!==f.d).length,ctt:cfg.fields.length,warn:sanityWarn(cls,p)};
}
function finish(entry){setResult(entry);setHistory(h=>[entry,...h.slice(0,99)]);setAiText("");setPage("results");setTimeout(()=>{setAiLoad(true);setTimeout(()=>{setAiText(localAI(entry));setAiLoad(false);},1200);},300);}
function runStd(){if(!cls||!entity.trim()||atLimit)return;trackUsage();const clean={...params};cfg.fields.forEach(f=>{if(clean[f.k]===""||clean[f.k]==null)clean[f.k]=f.d;});startLoad(20000,()=>finish(buildEntry({...clean,style:sty},years)));}

const bg={minHeight:"100vh",background:"#060810",color:"#e2e8f0",fontFamily:"'Exo 2','Segoe UI',sans-serif",overflowX:I};
const grd={position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,212,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.025) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0};
const sc={position:"relative",zIndex:1,padding:"20px 16px 100px",maxWidth:520,margin:"0 auto"};
const card=(ac)=>({background:"#111827",border:"1px solid "+(ac||K),borderRadius:8,padding:16,marginBottom:12});
const lbl={fontSize:10,color:G,letterSpacing:2,textTransform:U,fontFamily:O,marginBottom:10,display:"block"};

if(loading){
 const ai=SRANGES.findIndex(r=>loadPct>=r[0]&&loadPct<r[1]);
 const aIdx=ai===-1?4:ai;
 return (<div style={{...bg,display:"flex",flexDirection:"column",alignItems:E,justifyContent:E,padding:"40px 24px"}}>
  <style>{CSS}</style>
  <div style={{fontFamily:O,fontSize:10,color:G,letterSpacing:4,marginBottom:28}}>SIMULATION RUNNING</div>
  <div style={{width:"100%",maxWidth:320,marginBottom:28}}>
   {STEPS.map((step,i)=>{
    const done=loadPct>=SRANGES[i][1],active=i===aIdx;
    const sp2=active?Math.round((loadPct-SRANGES[i][0])/(SRANGES[i][1]-SRANGES[i][0])*100):0;
    return (<div key={i} style={{display:"flex",alignItems:E,gap:12,padding:"9px 0",borderBottom:"1px solid #0d1117",opacity:done||active?1:0.25,transition:"opacity .4s"}}>
     <div style={{width:30,height:30,borderRadius:"50%",background:done?V:active?D:K,display:"flex",alignItems:E,justifyContent:E,fontSize:13,flexShrink:0,fontWeight:800,color:done||active?"#000":G}}>{done?"✓":active?"…":i+1}</div>
     <div style={{flex:1}}>
      <div style={{fontSize:12,fontWeight:active||done?700:400,color:done?V:active?"#e2e8f0":G,marginBottom:active?5:0}}>{step}</div>
      {active&&<div style={{height:2,background:K,borderRadius:1,overflow:I}}><div style={{height:"100%",width:sp2+"%",background:"linear-gradient(90deg,#00d4ff,#00ff9d)",transition:"width .04s linear"}}></div></div>}
     </div>
     <div style={{fontFamily:O,fontSize:10,color:done?V:active?D:T,minWidth:36,textAlign:Y}}>{done?"done":active?sp2+"%":""}</div>
    </div>);
   })}
  </div>
  <div style={{fontFamily:O,fontSize:28,color:D,fontWeight:800,marginBottom:8}}>{loadPct}%</div>
  <div style={{width:280,height:3,background:K,borderRadius:2,overflow:I}}><div style={{height:"100%",width:loadPct+"%",background:"linear-gradient(90deg,#00d4ff,#00ff9d)",transition:"width .04s linear"}}></div></div>
 </div>);
}

return (<div style={bg}><style>{CSS}</style><div style={grd}/>

 {page==="home"&&(<div className="F" style={{...sc,paddingTop:0}}>
  <div style={{position:"relative",overflow:I,borderRadius:12}}>
   <NodeCanvas/>
   <div style={{display:"flex",flexDirection:"column",alignItems:E,textAlign:E,paddingTop:48,paddingBottom:36,position:"relative",zIndex:1}}>
   <div style={{width:80,height:80,borderRadius:"50%",border:"2px solid #00d4ff",display:"flex",alignItems:E,justifyContent:E,fontSize:32,marginBottom:18,animation:"pulse 2.5s infinite"}}>🛡</div>
   <div style={{fontFamily:O,fontSize:28,color:D,letterSpacing:4,textShadow:"0 0 24px rgba(0,212,255,0.4)",marginBottom:4}}>RiskAI</div>
   <div style={{fontSize:10,color:"#2d3748",letterSpacing:5,fontFamily:O,marginBottom:16}}>RISK SECURITY SYSTEM 3.2.1</div>
   <div style={{fontSize:14,color:B,maxWidth:340,lineHeight:1.8,marginBottom:28,textWrap:A}}>Strategic risk simulation for <span style={{color:V}}>companies, real estate, investments, healthcare, personal finances & retirement</span> — with a full strategic report after every run.</div>
   <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:280}}>
    <button onClick={()=>setPage("sim")} style={{background:D,color:"#000",border:"none",borderRadius:4,padding:"14px 20px",fontWeight:800,fontSize:14,cursor:P,boxShadow:"0 0 24px rgba(0,212,255,0.35)"}}>▶ START SIMULATION</button>
    <button onClick={()=>setPage("pricing")} style={{background:T,color:D,border:"1.5px solid #00d4ff",borderRadius:4,padding:"11px 20px",fontWeight:700,fontSize:13,cursor:P}}>💎 PLANS & PRICING</button>
   </div>
  </div>
  </div>
  <div style={{...card("#00d4ff20"),marginBottom:12}}>
   <div style={{fontSize:11,color:D,fontWeight:800,letterSpacing:1,textTransform:U,fontFamily:O,marginBottom:12}}>What is RiskAI?</div>
   <div style={{fontSize:13,color:"#c4cfdf",lineHeight:1.75,marginBottom:12,textWrap:A}}>RiskAI calculates how systems accumulate and respond to risk over time. Enter parameters, choose your class, get a detailed strategic risk assessment in seconds.</div>
   <div style={{fontSize:11,color:D,fontWeight:700,letterSpacing:1,textTransform:U,fontFamily:O,marginBottom:8}}>How it works</div>
   {[{h:"Input your parameters",d:"Up to 17 levers — Cybersecurity, Cashflow, Debt, Culture and more. Each value shapes your risk fingerprint."},{h:"Category-specific weighting",d:"Startups and Tech Giants face fundamentally different risks. RiskAI applies class-specific formulas."},{h:"S-curve risk modelling",d:"Each risk grows along a calibrated S-curve. Extreme inputs produce extreme outcomes — no flat averages."},{h:"Strategic analysis report",d:"Our engine reads your numbers and generates a situation assessment, root cause breakdown, and action plan."}].map((item,i)=>(<div key={i} style={{background:"rgba(0,212,255,0.04)",border:"1px solid #1e2d40",borderRadius:6,padding:"10px 12px",marginBottom:6}}><div style={{fontSize:12,color:D,fontWeight:700,marginBottom:3}}>{item.h}</div><div style={{fontSize:12,color:B,lineHeight:1.6,textWrap:A}}>{item.d}</div></div>))}
  </div>
  {[{icon:"🏛",t:"6 Critical System Classes",d:"Company, Real Estate, Stocks/ETF, Healthcare, Lifestyle & Retirement — each with unique risk logic."},{icon:"💰",t:"Wealth Projection",d:"For Real Estate, Stocks/ETF & Retirement, see a projected asset value years into the future based on your inputs and stability score."},{icon:"📊",t:"Risk Distribution Chart",d:"Every result includes a donut chart and overall risk scale showing exactly how your risks are weighted and distributed."},{icon:"🎯",t:"Detailed Strategic Report",d:"Every simulation ends with a full report: root causes, priority actions, and an adjustable forecast (5yr default) — plus Mission Engine, Impact Simulator, Risk Evolution & more."}].map(f=>(<div key={f.t} style={{...card(),display:"flex",gap:14,marginBottom:10}}><div style={{fontSize:22,flexShrink:0,marginTop:2}}>{f.icon}</div><div><div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{f.t}</div><div style={{fontSize:12,color:B,lineHeight:1.65,textWrap:A}}>{f.d}</div></div></div>))}
  <div style={{...card("#00ff9d15"),border:"1px solid #00ff9d30",marginBottom:16}}>
   <div style={{fontSize:11,color:V,fontWeight:800,letterSpacing:1,textTransform:U,fontFamily:O,marginBottom:10}}>Why RiskAI is different</div>
   {["Real mathematical differentiation, not flat 80% risk","6 focused systems, one platform","Parameters mirror real governance and financial levers","Actionable missions & progress tracking, not just numbers","Designed for mobile — simulate anywhere"].map(pt=>(<div key={pt} style={{display:"flex",gap:10,marginBottom:7,fontSize:12,color:"#c4cfdf"}}><span style={{color:V,flexShrink:0}}>→</span><span style={{textWrap:A}}>{pt}</span></div>))}
  </div>
  <div style={{...card(),textAlign:E,padding:"20px 16px",marginBottom:12}}>
   <div style={{fontSize:11,color:"#ffd700",fontWeight:800,letterSpacing:1,textTransform:U,fontFamily:O,marginBottom:10}}>Our Mission</div>
   <div style={{fontSize:13,color:B,lineHeight:1.8,fontStyle:"italic",textWrap:A}}>"Critical infrastructure fails from compounding risks no one modelled. RiskAI exists to change that."</div>
  </div>
  <div style={{...card("#a78bfa20"),marginBottom:16}}>
   <div style={{fontSize:11,color:"#a78bfa",fontWeight:800,letterSpacing:1,textTransform:U,fontFamily:O,marginBottom:10}}>🚀 What's Next</div>
   <div style={{fontSize:12,color:B,lineHeight:1.7,marginBottom:8,textWrap:A}}>RiskAI keeps evolving — new system classes, refined risk models, and deeper financial projections are ahead.</div>
   <div style={{fontSize:11,color:"#a78bfa",fontWeight:700,textWrap:A}}>Pro members get early access to new classes and functions.</div>
  </div>
  <button onClick={()=>setPage("sim")} style={{width:"100%",background:D,color:"#000",border:"none",borderRadius:4,padding:"14px",fontWeight:800,fontSize:14,cursor:P,boxShadow:"0 0 24px rgba(0,212,255,0.3)",marginBottom:16}}>▶ START YOUR FIRST SIMULATION</button>
  <div style={{textAlign:E,fontSize:10,color:"#2d3748",fontFamily:O,marginBottom:8}}>v3.2.1 · 6 System Classes · Strategic Reports · <span onClick={()=>setPage("legal")} style={{textDecoration:"underline"}}>Impressum</span></div>
 </div>)}

 {page==="sim"&&(<div className="F" style={sc}>
  <div style={{display:"flex",alignItems:E,justifyContent:"space-between",marginBottom:12}}>
   <div style={{fontFamily:O,fontSize:12,color:D,letterSpacing:2}}>◈ NEW SIMULATION</div>
   <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:G,cursor:P,fontSize:18}}>✕</button>
  </div>
  <div style={{display:"flex",gap:6,marginBottom:20}}>{["free","pro"].map(pp=>(<button key={pp} onClick={()=>setPlan(pp)} style={{flex:1,padding:"6px",borderRadius:6,border:"1px solid "+(plan===pp?D:K),background:plan===pp?"#00d4ff15":T,color:plan===pp?D:G,fontSize:10,letterSpacing:1,textTransform:U,cursor:P,fontFamily:O}}>{pp}</button>))}</div>
  <div style={card()}><span style={lbl}>01 — System Class</span>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{Object.entries(CLS).map(([k,v])=>{const isLocked=!PLAN_CLS[plan].includes(k);return (<button key={k} onClick={()=>{if(isLocked){setPage("pricing");return;}setCls(k);setProfIdx(0);}} style={{background:cls===k?v.color+"15":X,border:"1.5px solid "+(cls===k?v.color:K),borderRadius:6,padding:"10px 8px",cursor:P,textAlign:"left",position:"relative",opacity:isLocked?0.45:1}}><div style={{fontSize:18,marginBottom:2}}>{v.icon}</div><div style={{fontSize:11,color:cls===k?v.color:B,fontWeight:700}}>{v.label}</div>{isLocked&&<div style={{position:"absolute",top:6,right:6,fontSize:11}}>🔒</div>}{!isLocked&&plan==="free"&&<div style={{position:"absolute",top:6,right:6,fontSize:9,color:G}}>shared limit</div>}</button>);})}</div>
  </div>
  {cfg&&(<>
   <div style={card()}><span style={lbl}>02 — Entity & Duration</span>
    <div style={{marginBottom:14}}><div style={{fontSize:10,color:G,marginBottom:6,letterSpacing:1,textTransform:U}}>{cfg.eLabel}</div><input value={entity} onChange={e=>setEntity(e.target.value)} placeholder="Enter name..." style={{width:"100%",background:X,border:"1px solid #1e2d40",color:"#e2e8f0",borderRadius:4,padding:"10px 12px",fontSize:14,outline:"none",fontFamily:"inherit"}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:B}}>Simulation Years</span><span style={{fontFamily:O,fontSize:14,color:cfg.color,fontWeight:700}}>{years}</span></div>
    <input type="range" min={1} max={cfg.maxYears||20} value={years} onChange={e=>setYears(+e.target.value)} style={{accentColor:cfg.color}}/>
   </div>
   <div style={card()}><span style={lbl}>03 — Profile</span>
    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{cfg.profiles.map((pr,i)=>(<button key={i} onClick={()=>setProfIdx(i)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid "+(profIdx===i?cfg.color:K),background:T,color:profIdx===i?cfg.color:G,fontSize:11,cursor:P,fontWeight:profIdx===i?700:400}}>{pr.n}</button>))}</div>
   </div>
   <div style={card()}><span style={lbl}>04 — Parameters</span>
    {cfg.fields.map(f=>(<div key={f.k} style={{marginBottom:11}}>
     <div style={{display:"flex",justifyContent:"space-between",alignItems:E,marginBottom:4}}>
      <span style={{fontSize:12,color:B}}>{f.l}</span>
      <input type="number" min={f.lo??1} max={f.hi??10} value={params[f.k]??f.d} onChange={e=>{const raw=e.target.value;if(raw===""){sp(f.k,"");return;}const n=parseInt(raw,10);if(!isNaN(n))sp(f.k,n);}} onBlur={e=>{const lo=f.lo??1,hi=f.hi??10;let n=parseInt(e.target.value,10);if(isNaN(n))n=f.d;sp(f.k,Math.min(hi,Math.max(lo,n)));}} style={{width:84,background:X,border:"1px solid #1e2d40",color:cfg.color,borderRadius:4,padding:"2px 6px",fontSize:12,fontWeight:700,fontFamily:O,textAlign:Y,outline:"none"}}/>
     </div>
     <input type="range" min={f.lo??1} max={f.hi??10} value={params[f.k]===""?f.d:(params[f.k]??f.d)} onChange={e=>sp(f.k,+e.target.value)} style={{accentColor:cfg.color}}/>
    </div>))}
    {cfg.hasStyle&&(<div style={{marginTop:10}}><div style={{fontSize:10,color:G,letterSpacing:2,textTransform:U,marginBottom:7,fontFamily:O}}>Leadership Style</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["stable","visionary","aggressive","cooperative","authoritarian","democratic"].map(s=>(<button key={s} onClick={()=>setSty(s)} style={{padding:"5px 11px",borderRadius:20,border:"1px solid "+(sty===s?cfg.color:K),background:T,color:sty===s?cfg.color:G,fontSize:11,cursor:P}}>{s}</button>))}</div></div>)}
    {cfg.hasTraits&&(<div style={{marginTop:10}}><div style={{fontSize:10,color:G,letterSpacing:2,textTransform:U,marginBottom:3,fontFamily:O}}>Characteristics (choose up to 3)</div><div style={{fontSize:10,color:"#2d3748",marginBottom:7}}>{(params.traits||[]).length}/3 selected</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TRAITS.map(t=>{const sel=(params.traits||[]).includes(t.k);return (<button key={t.k} onClick={()=>toggleTrait(t.k)} style={{padding:"6px 12px",borderRadius:20,border:"1px solid "+(sel?cfg.color:K),background:sel?cfg.color+"15":T,color:sel?cfg.color:G,fontSize:11,cursor:P,fontWeight:sel?700:400}}>{t.l}</button>);})}</div></div>)}
   </div>
   <div style={card()}>
    {limited&&<div style={{background:atLimit?"rgba(255,45,85,0.08)":"rgba(0,212,255,0.06)",border:"1px solid "+(atLimit?"#ff2d5530":"#00d4ff25"),padding:"10px 12px",borderRadius:8,marginBottom:10,fontSize:12,color:atLimit?J:B}}>{atLimit?"⚠ Daily limit reached ("+DAILY_LIMIT+"/day) on the Free plan. Upgrade to Pro for unlimited access.":"🔓 Free plan: "+(DAILY_LIMIT-usedToday)+" of "+DAILY_LIMIT+" daily simulations remaining (total, across all classes)."}</div>}
    <button onClick={runStd} disabled={!entity.trim()||atLimit} style={{width:"100%",background:(entity.trim()&&!atLimit)?V:K,color:"#000",border:"none",borderRadius:4,padding:"13px",fontWeight:800,fontSize:14,cursor:(entity.trim()&&!atLimit)?P:"not-allowed",opacity:(entity.trim()&&!atLimit)?1:0.5,boxShadow:(entity.trim()&&!atLimit)?"0 0 20px rgba(0,255,157,0.3)":"none"}}>{atLimit?"🔒 Upgrade to Pro":"▶ RUN SIMULATION"}</button>
    {!entity.trim()&&!atLimit&&<div style={{fontSize:11,color:Q,textAlign:E,marginTop:6}}>Enter entity name above</div>}
    {atLimit&&<button onClick={()=>setPage("pricing")} style={{width:"100%",marginTop:8,background:T,border:"1px solid #00d4ff40",color:D,borderRadius:4,padding:"9px",fontSize:12,cursor:P}}>View Plans →</button>}
   </div>
  </>)}
 </div>)}

 {page==="results"&&result&&(<div className="F" style={sc}>
  <div style={{display:"flex",alignItems:E,justifyContent:"space-between",marginBottom:20}}>
   <div style={{fontFamily:O,fontSize:11,color:CLS[result.cls]?.color,letterSpacing:2}}>◈ RESULTS — {result.label.toUpperCase()}</div>
   <button onClick={()=>{setPage("sim");setCls("");setResult(null);}} style={{background:T,border:"1px solid #1e2d40",color:B,borderRadius:4,padding:"5px 12px",cursor:P,fontSize:11}}>+ New</button>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
   {[{v:result.stability+"%",l:"Stability",c:V},{v:result.avg+"%",l:result.avg>=65?"⚠ CRITICAL":result.avg>=45?"▲ ELEVATED":"✓ STABLE",c:result.avg>=65?J:result.avg>=45?Q:V},{v:result.worst,l:"Dominant Risk",c:J},{v:result.best,l:"Strongest Area",c:V}].map(({v,l,c})=>(<div key={l} style={{...card(),textAlign:E,marginBottom:0}}><div style={{fontFamily:O,fontSize:v.length>12?11:18,color:c,fontWeight:800,marginBottom:2,wordBreak:"break-word"}}>{v}</div><div style={{fontSize:9,color:G,letterSpacing:1,textTransform:U}}>{l}</div></div>))}
  </div>
  <div style={card()}><span style={lbl}>◈ Risk Distribution · {result.entity}</span>
   <DonutChart risks={result.risks} color={CLS[result.cls]?.color||D}/>
  </div>

  {result.wealth&&<div style={{...card("#00ff9d30"),background:"linear-gradient(135deg,#0d1117,#0a1f17)"}}>
   <span style={lbl}>💰 Projected Asset Value · {result.years}yr</span>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
    <div><div style={{fontSize:10,color:G,marginBottom:2}}>Today</div><div style={{fontFamily:O,fontSize:16,color:B,fontWeight:700}}>€{result.wealth.start.toLocaleString()}</div></div>
    <div style={{fontSize:18,color:V}}>→</div>
    <div style={{textAlign:Y}}><div style={{fontSize:10,color:G,marginBottom:2}}>In {result.years} years (median)</div><div style={{fontFamily:O,fontSize:24,color:V,fontWeight:800}}>€{result.wealth.final.toLocaleString()}</div></div>
   </div>
   {result.wealth.method==="monte-carlo"?
   <div style={{fontSize:12,color:B,lineHeight:1.6,marginBottom:8}}>500-path Monte Carlo simulation, {(result.wealth.meanReturn*100).toFixed(1)}%/yr expected return based on historical market statistics. Range: <span style={{color:J}}>€{result.wealth.p10.toLocaleString()}</span> (weak decade) to <span style={{color:V}}>€{result.wealth.p90.toLocaleString()}</span> (strong decade).</div>
   :<div style={{fontSize:12,color:B,lineHeight:1.6,marginBottom:8}}>{result.wealth.final>=result.wealth.start?"📈 +":"📉 −"}<span style={{color:result.wealth.final>=result.wealth.start?V:J,fontWeight:700}}>{Math.abs(Math.round((result.wealth.final-result.wealth.start)/Math.max(1,Math.abs(result.wealth.start))*100))}%</span> at {(result.wealth.rate*100).toFixed(1)}%/yr (stability-adjusted).</div>}
   <Chart yearly={result.wealth.pts.map(p=>({stability:p.value}))} color={V}/>
   <div style={{fontSize:10,color:G,lineHeight:1.5,marginTop:8,paddingTop:8,borderTop:"1px solid #1e2d40",textWrap:A}}>⚠ Illustrative projection — not financial advice. Actual returns depend on market conditions.</div>
  </div>}
  {result.netWorth&&<div style={{...card("#fbbf2430"),background:"linear-gradient(135deg,#0d1117,#1f1a0a)"}}>
   <span style={lbl}>💰 Net Worth Projection · {result.years}yr</span>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
    <div><div style={{fontSize:10,color:G,marginBottom:4}}>Today</div>
     <div style={{fontSize:12,color:Q}}>Debt: €{result.netWorth.startDebt.toLocaleString()}</div>
     <div style={{fontSize:12,color:V}}>Savings: €{result.netWorth.startSavings.toLocaleString()}</div>
     <div style={{fontFamily:O,fontSize:14,color:"#e2e8f0",fontWeight:800,marginTop:4}}>Net: €{result.netWorth.startNet.toLocaleString()}</div>
    </div>
    <div style={{textAlign:Y}}><div style={{fontSize:10,color:G,marginBottom:4}}>In {result.years} years</div>
     <div style={{fontSize:12,color:Q}}>Debt: €{result.netWorth.finalDebt.toLocaleString()}</div>
     <div style={{fontSize:12,color:V}}>Savings: €{result.netWorth.finalSavings.toLocaleString()}</div>
     <div style={{fontFamily:O,fontSize:14,color:"#fbbf24",fontWeight:800,marginTop:4}}>Net: €{result.netWorth.finalNet.toLocaleString()}</div>
    </div>
   </div>
   <Chart yearly={result.netWorth.pts.map(p=>({stability:p.net}))} color="#fbbf24"/>
   <div style={{fontSize:10,color:G,lineHeight:1.5,marginTop:8,paddingTop:8,borderTop:"1px solid #1e2d40",textWrap:A}}>⚠ Illustrative projection assuming consistent savings rate and debt repayment — not financial advice. Net = Savings − Debt.</div>
  </div>}
  {result.warn&&<div style={{background:"rgba(255,45,85,0.08)",border:"1px solid "+J+"30",padding:"10px 12px",borderRadius:8,marginBottom:12,fontSize:12,color:J}}>⚠ {result.warn}</div>}
  <div style={card()}><span style={lbl}>Risk Overview · {result.entity}</span>
   <div style={{fontSize:10,color:G,marginBottom:10}}>{result.cst}/{result.ctt} parameters customized</div>
   {Object.entries(result.risks).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const c=rc(v);return (<div key={k} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#e2e8f0"}}>{k}{v>=70?" ⚠":v>=50?" ▲":v<=30?" ✓":""}</span><span style={{fontFamily:O,fontSize:12,color:c,fontWeight:700}}>{v}%</span></div><div style={{height:5,background:K,borderRadius:3,overflow:I}}><div style={{height:"100%",width:v+"%",background:c,borderRadius:3,transition:"width 1s ease"}}></div></div></div>);})}
  </div>
  <div style={card("#00d4ff30")}><span style={lbl}>◈ Strategic Analysis Engine</span>
   <div style={{fontSize:11,color:G,lineHeight:1.6,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1e2d40",textWrap:A}}>This report is generated by a rule-based analysis engine using the risk model above — not a live AI consultation. Formulas are designed to be directionally plausible but are not empirically validated. Use as a starting point for discussion, not as financial, medical, or legal advice.</div>
   {aiLoad?(<div style={{display:"flex",alignItems:E,gap:10,color:B,fontSize:13}}><div style={{width:14,height:14,border:"2px solid #00d4ff",borderTopColor:T,borderRadius:"50%",animation:"spin .7s linear infinite"}}></div>Generating report for {result.entity}...</div>):(<div><MD text={aiText} color={CLS[result.cls]?.color||D}/><button onClick={()=>{setAiLoad(true);setTimeout(()=>{setAiText(localAI(result));setAiLoad(false);},900);}} style={{marginTop:12,background:T,border:"1px solid #1e2d40",color:G,borderRadius:4,padding:"6px 14px",cursor:P,fontSize:11}}>↻ Regenerate</button></div>)}
  </div>
  <RiskIntelligencePanel currentResult={result} previousResult={history.find(h=>h.cls===result.cls&&h.id!==result.id)||null} historyForClass={history.filter(h=>h.cls===result.cls)} accentColor={CLS[result.cls]?.color}/>
  {plan==="free"&&<div style={{...card(D+"40"),background:"linear-gradient(135deg,#0d1117,#0a1520)",marginBottom:12}}>
   <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}><span style={{fontSize:18}}>💎</span><span style={{fontSize:13,fontWeight:800,color:D}}>Want to track how {result.worst} evolves?</span></div>
   <div style={{fontSize:12,color:B,lineHeight:1.6,marginBottom:12}}>You get 1 free simulation per day — Pro removes that limit, unlocks all 6 domains (incl. Healthcare &amp; Retirement), and builds real trend history so Risk Evolution actually has something to compare against.</div>
   <button onClick={()=>setPage("pricing")} style={{width:"100%",background:D,color:"#000",border:"none",borderRadius:4,padding:"11px",fontWeight:800,fontSize:13,cursor:P}}>💎 Go Pro from €8.99/mo →</button>
  </div>}
  <button onClick={()=>{setPage("sim");setCls("");setResult(null);}} style={{width:"100%",background:T,border:"1px solid #1e2d40",color:B,borderRadius:4,padding:"12px",cursor:P,fontSize:13,marginTop:4}}>+ Run Another Simulation</button>
 </div>)}

 {page==="history"&&(<div className="F" style={sc}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:E,marginBottom:20}}>
   <div style={{fontFamily:O,fontSize:12,color:D,letterSpacing:2}}>◈ HISTORY {history.length>0&&"("+history.length+")"}</div>
   {history.length>0&&<button onClick={()=>{if(confirm("Clear all "+history.length+" entries?"))setHistory([]);}} style={{background:T,border:"1px solid #1e2d40",color:G,borderRadius:4,padding:"5px 12px",cursor:P,fontSize:11}}>Clear</button>}
  </div>
  {history.length===0?<div style={card()}><div style={{textAlign:E,color:G,padding:"20px 0"}}>No simulations yet.</div></div>:history.map(e=>{const c=e.avg>=65?J:e.avg>=45?Q:V;return (<div key={e.id} onClick={()=>{setResult(e);setPage("results");}} style={{...card(),cursor:P}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontWeight:700}}>{e.icon} {e.entity}</span><span style={{fontSize:10,color:G,fontFamily:O}}>{e.date}</span></div><div style={{fontSize:11,color:G,marginBottom:8}}>{e.label} · {e.years}yr</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[{tx:"Load: "+e.avg+"%",c},{tx:"Stability: "+e.stability+"%",c:V},{tx:"⚠ "+e.worst,c:J}].map(({tx,c:co})=>(<span key={tx} style={{fontSize:10,padding:"2px 8px",borderRadius:20,border:"1px solid "+co,color:co}}>{tx}</span>))}</div></div>);})}
 </div>)}

 {page==="pricing"&&(<div className="F" style={sc}>
  <div style={{fontFamily:O,fontSize:12,color:D,letterSpacing:2,marginBottom:8}}>◈ PRICING</div>
  <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>Choose your plan</div>
  <div style={{fontSize:13,color:B,lineHeight:1.65,marginBottom:10,textWrap:A}}>Start free and upgrade when you need more. Every plan includes the full simulation engine and strategic reports.</div>
  <div style={{fontSize:11,color:G,marginBottom:16,fontFamily:O}}>Stripe · Cancel anytime</div>
  <div style={{...card(),marginBottom:16}}><span style={lbl}>Class Access by Plan</span>
   {[{p:"Free",c:"🏢 Company · 🏠 Real Estate · 📈 Stocks/ETF · 🧍 Lifestyle",sub:"limited to "+DAILY_LIMIT+" sims/day total",col:G},{p:"Pro",c:"All 6 classes incl. 🏥 Healthcare & 🏦 Retirement",sub:"unlimited simulations & history",col:D}].map(r=>(<div key={r.p} style={{marginBottom:8}}><div style={{display:"flex",gap:8,alignItems:"baseline"}}><span style={{fontSize:11,fontWeight:800,color:r.col,minWidth:70}}>{r.p}</span><span style={{fontSize:12,color:"#c4cfdf"}}>{r.c}</span></div><div style={{fontSize:10,color:G,marginLeft:78}}>{r.sub}</div></div>))}
  </div>
  {[{n:"Free",p:"€0",per:"Forever",col:G,ok:["Company simulation","5 preset profiles","Standard mode","Full strategic report","Risk distribution chart"],no:["All system classes","Wealth projections","Unlimited history"]},{n:"Pro",p:"€8.99",per:"/month",orig:"€29.99",sale:"70% OFF",col:D,feat:true,ok:["No usage limits","Early access to new system classes","All 6 system classes","Strategic analysis reports","Wealth projections","100 history slots","All profiles & styles"],no:[]}].map(pl=>(<div key={pl.n} style={{...card(pl.feat?pl.col+"50":undefined),boxShadow:pl.feat?"0 0 24px "+pl.col+"18":"none",marginBottom:12}}>{pl.feat&&<div style={{fontSize:10,color:pl.col,letterSpacing:2,fontFamily:O,marginBottom:8}}>★ MOST POPULAR</div>}<div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:18,fontWeight:800}}>{pl.n}</div><div style={{fontSize:11,color:G}}>{pl.per}</div></div><div style={{textAlign:Y}}>{pl.sale&&<div style={{display:"flex",alignItems:E,gap:6,justifyContent:"flex-end",marginBottom:2}}><span style={{fontSize:12,color:G,textDecoration:"line-through"}}>{pl.orig}</span><span style={{fontSize:10,color:V,background:"rgba(0,255,157,0.12)",padding:"2px 6px",borderRadius:4,fontWeight:800}}>{pl.sale}</span></div>}<div style={{fontFamily:O,fontSize:28,color:pl.col,fontWeight:800}}>{pl.p}</div></div></div>{pl.ok.map(f=><div key={f} style={{fontSize:12,color:B,padding:"4px 0",borderBottom:"1px solid #0d1117",display:"flex",gap:8}}><span style={{color:V}}>✓</span>{f}</div>)}{pl.no.map(f=><div key={f} style={{fontSize:12,color:"#2d3748",padding:"4px 0",borderBottom:"1px solid #0d1117",display:"flex",gap:8}}><span>✗</span>{f}</div>)}<button onClick={()=>alert("Stripe integration coming soon. Plan: "+pl.n)} style={{width:"100%",marginTop:14,background:pl.feat?pl.col:T,color:pl.feat?"#000":pl.col,border:"1.5px solid "+pl.col,borderRadius:4,padding:"11px",fontWeight:700,fontSize:12,cursor:P}}>{pl.p==="€0"?"Get Started Free":"Subscribe €8.99/mo →"}</button></div>))}
  <div style={{...card(),marginBottom:12}}><span style={lbl}>💎 Annual Plan — Best Value</span>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:E,marginBottom:10}}>
    <div><div style={{fontSize:16,fontWeight:800,color:D}}>Pro Yearly</div><div style={{fontSize:11,color:G}}>Everything in Pro · billed annually</div></div>
    <div style={{textAlign:Y}}><div style={{fontSize:10,color:V,background:"rgba(0,255,157,0.12)",padding:"2px 8px",borderRadius:4,fontWeight:800,marginBottom:4,display:"inline-block"}}>save 44%</div><div style={{fontFamily:O,fontSize:24,color:D,fontWeight:800}}>€59.99<span style={{fontSize:12,color:G,fontWeight:400}}>/yr</span></div><div style={{fontSize:11,color:V}}>≈ €5.00/month — save 44%</div></div>
   </div>
   <button onClick={()=>alert("Stripe integration coming soon. Plan: Pro Yearly")} style={{width:"100%",background:T,color:D,border:"1.5px solid #00d4ff",borderRadius:4,padding:"11px",fontWeight:700,fontSize:12,cursor:P}}>Subscribe €59.99/yr →</button>
  </div>
  <div style={{...card(),textAlign:E,border:"1px dashed #1e2d40"}}>
   <div style={{fontSize:11,color:B,fontWeight:800,letterSpacing:1,textTransform:U,marginBottom:6}}>🏢 Enterprise</div>
   <div style={{fontSize:12,color:G,lineHeight:1.6,marginBottom:10,textWrap:A}}>Custom deployments, dedicated support, and API access for organisations.</div>
   <button onClick={()=>alert("Contact: hello@riskai.app")} style={{background:T,border:"1.5px solid #4a5568",color:B,borderRadius:4,padding:"9px 20px",fontWeight:700,fontSize:12,cursor:P}}>Contact Us</button>
  </div>
 </div>)}

 {page==="legal"&&<LegalPage/>}

 <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,8,16,0.97)",borderTop:"1px solid #1e2d40",display:"grid",gridTemplateColumns:"repeat(4,1fr)",zIndex:100}}>
  {[["sim","⚡","Simulate"],["history","📋","History"],["pricing","💎","Pricing"],["home","📖","About"]].map(([id,icon,lb])=>(<button key={id} onClick={()=>setPage(id)} style={{background:"none",border:"none",color:page===id?D:G,cursor:P,padding:"10px 4px 14px",fontSize:9,letterSpacing:.5,textTransform:U,display:"flex",flexDirection:"column",alignItems:E,gap:4}}><span style={{fontSize:20}}>{icon}</span>{lb}</button>))}
 </div>
</div>);
}
