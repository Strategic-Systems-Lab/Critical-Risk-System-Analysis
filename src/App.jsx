import{useState,useEffect,useRef}from"react";

function cl(v,lo=1,hi=100){return Math.min(hi,Math.max(lo,Math.round(v)));}
function risk(bad,good,y,s=1,ceil=88,fl=8){return cl(Math.max(fl,(38+(bad-good)/10*55*s)*(1+(y-1)*.01)),fl,ceil);}
function applySpread(r){const vals=Object.values(r),mx=Math.max(...vals);if(mx>=45)return r;const ks=Object.keys(r).sort((a,b)=>r[b]-r[a]),o={...r};[42,34,26].forEach((f,i)=>{if(ks[i])o[ks[i]]=Math.min(58,Math.max(o[ks[i]],f));});return o;}
function stab(g,b,base=65){return cl(base+(g.reduce((a,v)=>a+v,0)/g.length-5)*3.5-(b.reduce((a,v)=>a+v,0)/b.length-5)*4,24,91);}
function mkY(st,y){return Array.from({length:y},(_,i)=>({year:i+1,stability:i===y-1?st:cl(st+(y-1-i)*2-i*1.2+(Math.random()*5-2.5),15,95)}));}
function projectWealth(cls,p,years,stability){
const rate=(stability-50)/100*0.06+0.04;
let start=0,monthly=0;
if(cls==="7"){start=(p.rent_income*12)/0.05-p.mortgage;monthly=(p.rent_income-p.monthly_costs);}
else if(cls==="8"){start=p.capital;monthly=p.monthly_savings;}
else if(cls==="10"){start=p.pension_assets;monthly=p.monthly_contribution;}
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
const sm=({aggressive:1.5,cooperative:.75,authoritarian:1.65,visionary:1.05,stable:1})[(p.style||"stable").toLowerCase()]||1;
const R={
 "1":()=>applySpread({Burnout:risk(p.risk_tolerance*sm,(p.training+p.culture)/2,y,1.2,90,10),Financial:risk((p.debt/Math.max(1,p.revenue))*0.8+(10-p.cashflow)*0.5,(p.assets/1500)+Math.max(0,(p.revenue-p.expenses)/Math.max(1,p.revenue)*10),y,1.05,82,8),Cyber:risk(p.ai_usage*1.05,p.cybersec*1.1,y,1.3,88,12),Governance:risk(10-p.compliance,p.transparency,y,.85,74,8),Market:risk(10-p.adaptability,p.innovation*.95,y,.95,72,12),Dependency:risk(p.risk_tolerance,p.redundancy*1.2,y,.95,76,8),Operational:risk(10-p.compliance,p.redundancy,y,.75,65,7),"Knowledge loss":risk(10-p.training,p.culture*.8,y,.85,66,12),Automation:risk(p.ai_usage,p.compliance*1.05,y,1.1,80,12),Reputation:risk(10-p.transparency,p.culture*.9,y,.65,60,7)}),
 "4":()=>applySpread({"Staff burnout":risk(p.burnout*1.2,(p.funding+Math.min(10,p.staff/1000))/2,y,1.35,92,10),"Supply failure":risk(10-p.pharma_supply,p.funding*.9,y,1.1,84,8),Cyber:risk(p.digitization*.95,p.cybersec*1.1,y,1.3,88,12),"Capacity overload":risk(10-p.beds,p.crisis_capacity,y,1.2,86,8),"Equity gap":risk(10-p.equity,p.funding,y,1,80,8),"Prevention failure":risk(10-p.prevention,p.funding*.8,y,.95,76,10),"Research lag":risk(10-p.research,p.digitization*.8,y,.75,68,10),"Regulation gap":risk(10-p.regulation,p.funding*.5,y,.85,72,7),"Financial strain":risk(10-p.funding,p.regulation*.4,y,1.15,88,8),"System collapse":risk((10-p.funding+10-p.crisis_capacity)/2,p.prevention,y,1,80,7)}),
 "7":()=>applySpread({"Price correction":risk(p.leverage*1.1,p.location_quality*.9,y,1.2,88,8),"Vacancy risk":risk(10-p.occupancy,p.location_quality*.7,y,1,80,8),"Interest rate exposure":risk(p.leverage*1.2+(p.mortgage/Math.max(1,p.rent_income*12))*0.6,p.cashflow*.8,y,1.3,90,8),"Maintenance backlog":risk(10-p.maintenance,p.cashflow*.6,y,.9,75,8),"Liquidity risk":risk(p.leverage,p.market_liquidity+Math.max(0,(p.rent_income-p.monthly_costs)/Math.max(1,p.rent_income)*10),y,1,80,8),"Regulatory risk":risk(10-p.regulation_fit,p.location_quality*.5,y,.85,72,7),"Tenant default":risk(10-p.tenant_quality,p.cashflow*.7,y,1.05,82,8),"Insurance gap":risk(10-p.insurance,p.maintenance*.5,y,.8,70,7),"Concentration risk":risk(10-p.diversification,p.market_liquidity*.6,y,.95,78,8),"Climate exposure":risk(p.climate_exposure*1.1,p.insurance*.6,y,1.1,84,7)}),
 "8":()=>applySpread({"Market volatility":risk(p.volatility*1.15,p.diversification*.9,y,1.3,90,8),"Concentration risk":risk((10-p.diversification)+Math.abs(p.stock_pct-50)/10,p.hedging*.6,y,1.1,84,8),"Leverage risk":risk(p.leverage*1.2,p.liquidity*.6,y,1.35,92,8),"Liquidity risk":risk(10-p.liquidity,p.discipline*.6,y,1,80,8),"Sector exposure":risk(p.sector_concentration*1.1,p.diversification*.7,y,1.05,82,8),"Currency risk":risk(p.fx_exposure,p.hedging*.8,y,.95,78,7),"Interest rate sensitivity":risk(p.rate_sensitivity*1.1,p.hedging*.7,y,1.15,86,8),"Drawdown risk":risk(p.volatility,(p.monthly_savings*12/Math.max(1,p.capital)*10)+p.discipline*.5,y,1.1,84,8),"Behavioural risk":risk(10-p.discipline,p.volatility*.6,y,.9,76,8),"Tax inefficiency":risk(10-p.tax_efficiency,p.discipline*.5,y,.75,68,7)}),
 "9":()=>{const tr=p.traits||[];const has=t=>tr.includes(t)?1:0;const sv=(p.income-p.expenses)/Math.max(1,p.income);return applySpread({"Income shock":risk(5+has("variable")*2.5+has("single")*1.5,p.income/1000+sv*10,y,1.2,90,8),"Lifestyle inflation":risk(10-p.discipline,sv*10,y,1,82,8),"Emergency preparedness":risk(5+has("noEmergency")*3,p.savings/Math.max(1,p.expenses)*2,y,1.25,88,8),"Debt burden":risk(p.debt/Math.max(1,p.income*12)*10+has("highDebt")*2,p.discipline*.6,y,1.2,86,8),"Career stability":risk(5+has("careerRisk")*2.5+has("variable")*1.5,p.income/1200,y,1.05,82,8),"Dependent load":risk(5+has("dependents")*3,p.income/1000,y,.95,78,8),"Housing exposure":risk(5+has("renting")*2,p.savings/Math.max(1,p.expenses),y,.85,74,8),"Health cost exposure":risk(5+has("healthCond")*3,p.savings/Math.max(1,p.expenses)*1.5,y,1,80,8),"Retirement gap":risk(10-p.discipline,sv*8+p.savings/Math.max(1,p.income*12),y,.9,78,8),"Lifestyle volatility":risk(has("variable")*3+has("careerRisk")*2+5,p.discipline*.5,y,1,80,8)});},
 "10":()=>{const yrsLeft=Math.max(1,p.retire_age-p.age);return applySpread({"Sequence-of-returns risk":risk(p.equity_pct/10,(10-Math.max(0,10-yrsLeft/3))*.6+p.diversification*.4,y,1.25,90,8),"Inflation erosion":risk(10-p.inflation_protection,p.equity_pct/12,y,1.1,84,8),"Contribution gap":risk(10-(p.monthly_contribution/Math.max(1,p.pension_assets/100+50)*10),p.discipline*.5,y,1.05,82,8),"Longevity risk":risk(p.life_expectancy/10,p.pension_assets/Math.max(1,p.monthly_contribution*1200)*2+p.diversification*.3,y,1.15,86,8),"Healthcare cost exposure":risk(10-p.healthcare_buffer,p.diversification*.4,y,1.1,84,8),"State pension shortfall":risk(10-p.state_pension_reliance,p.pension_assets/Math.max(1,p.monthly_contribution*1500)*2,y,.95,78,8),"Early retirement risk":risk(Math.max(0,10-yrsLeft),p.pension_assets/Math.max(1,p.monthly_contribution*1000)*2,y,1,80,7),"Market concentration":risk(10-p.diversification,p.equity_pct<80?6:3,y,.9,76,8),"Withdrawal rate risk":risk(p.equity_pct/15+3,p.diversification*.5+p.healthcare_buffer*.3,y,1.05,82,8),"Behavioural risk":risk(10-p.discipline,p.diversification*.4,y,.85,74,8)});},
}[id]();
const ST={"1":stab([p.culture,p.training,p.redundancy,p.compliance,p.cashflow],[p.risk_tolerance*sm,10-p.cybersec,10-p.adaptability]),"4":stab([p.funding,p.prevention,p.regulation,p.crisis_capacity,Math.min(10,p.staff/1000+3)],[p.burnout*1.1,10-p.pharma_supply,10-p.beds]),"7":stab([p.location_quality,p.occupancy,p.tenant_quality,p.cashflow,p.diversification],[p.leverage*1.1,10-p.maintenance,p.climate_exposure*.8]),"8":stab([p.diversification,p.hedging,p.discipline,p.liquidity,p.tax_efficiency],[p.volatility*1.1,p.leverage*1.1,p.sector_concentration*.8]),"9":(()=>{const tr=p.traits||[],pen=tr.length*3,sv=(p.income-p.expenses)/Math.max(1,p.income);return stab([p.discipline,sv*10+5,p.savings/Math.max(1,p.expenses)+3,8,8],[pen,p.debt/Math.max(1,p.income*12)*5,5]);})(),"10":(()=>{const yrsLeft=Math.max(1,p.retire_age-p.age);return stab([p.discipline,p.diversification,p.inflation_protection,p.healthcare_buffer,Math.min(10,yrsLeft/3+3)],[p.equity_pct/12,10-p.state_pension_reliance,p.life_expectancy/12]);})()}[id];
return{risks:R,stability:ST,yearly:mkY(ST,y)};
}

const CLS={
"1":{icon:"🏢",label:"Company",eLabel:"Company name",color:"#00d4ff",hasStyle:true,
 profiles:[{n:"Startup",p:{employees:50,assets:500,debt:200000,revenue:80000,expenses:90000,cashflow:4,innovation:8,risk_tolerance:7,digitization:7,cybersec:4,training:4,compliance:3,culture:7,redundancy:2,ai_usage:5,adaptability:8,transparency:6,style:"visionary"}},{n:"Corporation",p:{employees:5000,assets:8000,debt:3000000,revenue:1500000,expenses:1100000,cashflow:7,innovation:6,risk_tolerance:4,digitization:6,cybersec:7,training:6,compliance:8,culture:6,redundancy:7,ai_usage:6,adaptability:5,transparency:6,style:"stable"}},{n:"Crisis Co.",p:{employees:800,assets:2000,debt:1800000,revenue:300000,expenses:380000,cashflow:2,innovation:3,risk_tolerance:6,digitization:3,cybersec:3,training:3,compliance:4,culture:3,redundancy:3,ai_usage:4,adaptability:3,transparency:3,style:"authoritarian"}},{n:"Tech Giant",p:{employees:12000,assets:9500,debt:1200000,revenue:4000000,expenses:2200000,cashflow:9,innovation:9,risk_tolerance:5,digitization:9,cybersec:8,training:7,compliance:7,culture:7,redundancy:8,ai_usage:9,adaptability:8,transparency:6,style:"visionary"}},{n:"Manual",p:null}],
 fields:[{k:"employees",l:"Employees",d:500,lo:1,hi:15000},{k:"assets",l:"Assets (€)",d:3000,lo:1,hi:10000},{k:"debt",l:"Total Debt (€)",d:500000,lo:0,hi:3500000},{k:"revenue",l:"Monthly Revenue (€)",d:200000,lo:0,hi:4500000},{k:"expenses",l:"Monthly Expenses (€)",d:150000,lo:0,hi:2500000},{k:"cashflow",l:"Cashflow",d:5},{k:"innovation",l:"Innovation",d:5},{k:"risk_tolerance",l:"Risk Tolerance",d:5},{k:"digitization",l:"Digitization",d:5},{k:"cybersec",l:"Cybersecurity",d:5},{k:"training",l:"Training",d:5},{k:"compliance",l:"Compliance",d:5},{k:"culture",l:"Culture",d:5},{k:"redundancy",l:"Redundancy",d:5},{k:"ai_usage",l:"AI Usage",d:5},{k:"adaptability",l:"Adaptability",d:5},{k:"transparency",l:"Transparency",d:5}]},
"4":{icon:"🏥",label:"Healthcare",eLabel:"Hospital / System",color:"#ff6b9d",
 profiles:[{n:"National Health",p:{funding:7,staff:5000,beds:8,digitization:6,cybersec:5,pharma_supply:7,prevention:6,research:6,equity:6,crisis_capacity:6,burnout:4,regulation:7}},{n:"Regional Hospital",p:{funding:5,staff:600,beds:5,digitization:5,cybersec:4,pharma_supply:6,prevention:5,research:3,equity:5,crisis_capacity:4,burnout:6,regulation:6}},{n:"Underfunded",p:{funding:2,staff:800,beds:3,digitization:2,cybersec:2,pharma_supply:3,prevention:2,research:2,equity:2,crisis_capacity:2,burnout:9,regulation:3}},{n:"Manual",p:null}],
 fields:[{k:"funding",l:"Funding",d:5},{k:"staff",l:"Staff",d:1000,lo:1,hi:3000},{k:"beds",l:"Bed Capacity",d:5},{k:"digitization",l:"Digitization",d:5},{k:"cybersec",l:"Cybersecurity",d:5},{k:"pharma_supply",l:"Pharma Supply",d:5},{k:"prevention",l:"Prevention",d:5},{k:"research",l:"Research",d:5},{k:"equity",l:"Equity",d:5},{k:"crisis_capacity",l:"Crisis Capacity",d:5},{k:"burnout",l:"Burnout Risk",d:4},{k:"regulation",l:"Regulation",d:5}]},
"7":{icon:"🏠",label:"Real Estate",eLabel:"Property / Portfolio name",color:"#34d399",
 profiles:[{n:"Rental Portfolio",p:{location_quality:7,mortgage:400000,rent_income:3200,monthly_costs:1400,occupancy:8,tenant_quality:7,cashflow:6,leverage:5,maintenance:6,market_liquidity:5,regulation_fit:6,insurance:6,diversification:5,climate_exposure:4}},{n:"Commercial RE",p:{location_quality:6,mortgage:650000,rent_income:5000,monthly_costs:2600,occupancy:6,tenant_quality:5,cashflow:5,leverage:7,maintenance:5,market_liquidity:4,regulation_fit:5,insurance:5,diversification:4,climate_exposure:5}},{n:"Overleveraged",p:{location_quality:4,mortgage:900000,rent_income:2200,monthly_costs:2100,occupancy:5,tenant_quality:4,cashflow:3,leverage:9,maintenance:3,market_liquidity:2,regulation_fit:4,insurance:3,diversification:2,climate_exposure:6}},{n:"Manual",p:null}],
 fields:[{k:"location_quality",l:"Location Quality",d:5},{k:"mortgage",l:"Mortgage / Debt (€)",d:300000,lo:0,hi:2000000},{k:"rent_income",l:"Monthly Rent (€)",d:2500,lo:0,hi:20000},{k:"monthly_costs",l:"Monthly Costs (€)",d:1200,lo:0,hi:10000},{k:"occupancy",l:"Occupancy Rate",d:5},{k:"tenant_quality",l:"Tenant Quality",d:5},{k:"cashflow",l:"Cashflow",d:5},{k:"leverage",l:"Leverage / LTV",d:5},{k:"maintenance",l:"Maintenance",d:5},{k:"market_liquidity",l:"Market Liquidity",d:5},{k:"regulation_fit",l:"Regulation Fit",d:5},{k:"insurance",l:"Insurance Coverage",d:5},{k:"diversification",l:"Diversification",d:5},{k:"climate_exposure",l:"Climate Exposure",d:5}]},
"8":{icon:"📈",label:"Stocks/ETF",eLabel:"Portfolio name",color:"#f472b6",
 profiles:[{n:"Balanced ETF",p:{capital:15000,monthly_savings:400,stock_pct:40,diversification:8,hedging:6,leverage:2,liquidity:8,sector_concentration:3,fx_exposure:3,rate_sensitivity:4,volatility:4,discipline:7,tax_efficiency:6}},{n:"Growth/Tech",p:{capital:8000,monthly_savings:600,stock_pct:80,diversification:4,hedging:3,leverage:3,liquidity:7,sector_concentration:8,fx_exposure:5,rate_sensitivity:7,volatility:8,discipline:5,tax_efficiency:5}},{n:"Leveraged Trader",p:{capital:5000,monthly_savings:200,stock_pct:95,diversification:2,hedging:2,leverage:8,liquidity:5,sector_concentration:7,fx_exposure:6,rate_sensitivity:8,volatility:9,discipline:3,tax_efficiency:3}},{n:"Manual",p:null}],
 fields:[{k:"capital",l:"Starting Capital (€)",d:10000,lo:0,hi:100000},{k:"monthly_savings",l:"Monthly Savings (€)",d:300,lo:0,hi:3000},{k:"stock_pct",l:"Stocks Alloc. (%)",d:50,lo:0,hi:100},{k:"diversification",l:"Diversification",d:5},{k:"hedging",l:"Hedging",d:5},{k:"leverage",l:"Leverage",d:5},{k:"liquidity",l:"Liquidity",d:5},{k:"sector_concentration",l:"Sector Concentration",d:5},{k:"fx_exposure",l:"FX Exposure",d:5},{k:"rate_sensitivity",l:"Rate Sensitivity",d:5},{k:"volatility",l:"Volatility",d:5},{k:"discipline",l:"Discipline",d:5},{k:"tax_efficiency",l:"Tax Efficiency",d:5}]},
"9":{icon:"🧍",label:"Lifestyle",eLabel:"Your name / household",color:"#fbbf24",hasTraits:true,
 profiles:[{n:"Young Professional",p:{income:3200,expenses:2400,savings:8000,monthly_savings:350,debt:5000,discipline:6,traits:["variable","noEmergency"]}},{n:"Family Household",p:{income:5500,expenses:4600,savings:15000,monthly_savings:450,debt:180000,discipline:6,traits:["dependents","highDebt"]}},{n:"Freelancer",p:{income:2800,expenses:2200,savings:4000,monthly_savings:250,debt:2000,discipline:5,traits:["variable","single","careerRisk"]}},{n:"Manual",p:null}],
 fields:[{k:"income",l:"Monthly Net Income (€)",d:3000,lo:0,hi:15000},{k:"expenses",l:"Monthly Expenses (€)",d:2400,lo:0,hi:12000},{k:"savings",l:"Current Savings (€)",d:5000,lo:0,hi:25000},{k:"monthly_savings",l:"Monthly Savings Rate (€)",d:300,lo:0,hi:5000},{k:"debt",l:"Total Debt (€)",d:0,lo:0,hi:500000},{k:"discipline",l:"Financial Discipline",d:5}]},
"10":{icon:"🏦",label:"Retirement",eLabel:"Your name / plan",color:"#a78bfa",maxYears:60,
 profiles:[{n:"Early Planner",p:{age:30,retire_age:65,pension_assets:25000,monthly_contribution:400,equity_pct:80,diversification:7,inflation_protection:6,healthcare_buffer:5,state_pension_reliance:4,life_expectancy:6,discipline:7}},{n:"Mid-Career Catchup",p:{age:45,retire_age:67,pension_assets:90000,monthly_contribution:600,equity_pct:55,diversification:6,inflation_protection:5,healthcare_buffer:5,state_pension_reliance:6,life_expectancy:6,discipline:6}},{n:"Pre-Retirement",p:{age:58,retire_age:65,pension_assets:280000,monthly_contribution:800,equity_pct:30,diversification:5,inflation_protection:6,healthcare_buffer:6,state_pension_reliance:7,life_expectancy:7,discipline:7}},{n:"Manual",p:null}],
 fields:[{k:"age",l:"Current Age",d:35,lo:18,hi:75},{k:"retire_age",l:"Target Retirement Age",d:65,lo:50,hi:75},{k:"pension_assets",l:"Current Pension Assets (€)",d:40000,lo:0,hi:500000},{k:"monthly_contribution",l:"Monthly Contribution (€)",d:400,lo:0,hi:3000},{k:"equity_pct",l:"Equity Allocation (%)",d:60,lo:0,hi:100},{k:"diversification",l:"Diversification",d:5},{k:"inflation_protection",l:"Inflation Protection",d:5},{k:"healthcare_buffer",l:"Healthcare Buffer",d:5},{k:"state_pension_reliance",l:"State Pension Reliance",d:5},{k:"life_expectancy",l:"Family Longevity",d:5},{k:"discipline",l:"Contribution Discipline",d:5}]},
};

const TRAITS=[{k:"single",l:"Single Income"},{k:"dependents",l:"Has Dependents"},{k:"variable",l:"Variable Income"},{k:"highDebt",l:"High Debt Load"},{k:"noEmergency",l:"No Emergency Fund"},{k:"renting",l:"Renting (not Owning)"},{k:"healthCond",l:"Ongoing Health Costs"},{k:"careerRisk",l:"Career Instability"}];

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
 return["**Situation Assessment**",e.entity+" ("+e.label+") is "+status+" after "+yrs+" year"+(yrs>1?"s":"")+". Overall risk load: "+avg+"% — stability score: "+stb+"%. The dominant risk is "+t0[0]+" at "+t0[1]+"%. "+urgent,"","**Root Cause Analysis**",rootExplain,"","1. "+t0[0]+" ("+t0[1]+"%) is the primary failure driver — this risk has the highest weighted impact on overall system stability.",t1?"2. "+t1[0]+" ("+t1[1]+"%) is compounding the situation — its interaction with "+t0[0]+" creates a multiplier effect that is difficult to address independently.":null,t2?"3. "+t2[0]+" ("+t2[1]+"%) represents a third vulnerability — if left unaddressed, it could become the dominant risk within "+Math.ceil(yrs/2)+" years.":null,"","**Priority Action Plan**","1. Reduce "+t0[0]+" by 20-30% within the next 12 months. This is the highest-leverage intervention available and will produce the greatest stabilisation effect.","2. Break the "+t0[0]+(t1?" → "+t1[0]:"")+" cascade within 6 months by addressing the shared root cause — likely in governance, resource allocation, or operational processes.","3. Leverage "+bot[0]+" ("+bot[1]+"%) as a resilience anchor. This is your strongest area — invest in it to buffer the impact of the risks above.","","**5-Year Trajectory Forecast**",forecast].filter(l=>l!=null).join("\n");
}catch(err){return"**Analysis**\nError: "+String(err);}
}

function DonutChart({risks,color}){
const entries=Object.entries(risks).sort((a,b)=>b[1]-a[1]);
const total=entries.reduce((s,[,v])=>s+v,0)||1;
const R=54,r=32,cx=64,cy=64;
const colors=["#ff2d55","#ff6b35","#ffaa00","#ffd700","#a3e635","#00ff9d"];
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
 <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10}}>
  <svg width={128} height={128} viewBox="0 0 128 128">
   {slices.map((s,i)=>(<path key={i} d={s.path} fill={s.col} opacity={0.9} stroke="#060810" strokeWidth={1.5}/>))}
   <circle cx={cx} cy={cy} r={r} fill="#111827"/>
   <text x={cx} y={cy-6} textAnchor="middle" fill="#e2e8f0" fontSize={14} fontWeight={800} fontFamily="monospace">{Math.round(total/entries.length)}%</text>
   <text x={cx} y={cy+10} textAnchor="middle" fill="#4a5568" fontSize={8} fontFamily="monospace">avg load</text>
  </svg>
  <div style={{flex:1}}>
   {[{l:"⚠ Critical",c:"#ff2d55",n:high},{l:"▲ Elevated",c:"#ff6b35",n:elev},{l:"✓ Stable",c:"#00ff9d",n:stable}].map(g=>(<div key={g.l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><span style={{fontSize:11,color:g.c}}>{g.l}</span><div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:60,height:4,background:"#1e2d40",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:(g.n/entries.length*100)+"%",background:g.c,borderRadius:2}}></div></div><span style={{fontSize:11,fontFamily:"monospace",color:g.c,minWidth:16,textAlign:"right"}}>{g.n}</span></div></div>))}
   <div style={{marginTop:8,paddingTop:8,borderTop:"1px solid #1e2d40",fontSize:10,color:"#4a5568"}}>
    {entries.slice(0,3).map(([n,v])=>(<div key={n} style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{color:"#8892a4",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{n}</span><span style={{color:"#ff2d55",fontFamily:"monospace",fontWeight:700,flexShrink:0,marginLeft:4}}>{v}%</span></div>))}
   </div>
  </div>
 </div>
 <div style={{marginBottom:4,fontSize:10,color:"#4a5568",letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace"}}>Overall Risk Scale</div>
 <div style={{position:"relative",height:20,borderRadius:4,overflow:"hidden",background:"linear-gradient(90deg,#00ff9d 0%,#ffd700 35%,#ff6b35 60%,#ff2d55 80%,#cc0033 100%)"}}>
  <div style={{position:"absolute",top:0,bottom:0,left:Math.min(95,Math.round(total/entries.length))+"%",width:3,background:"#fff",borderRadius:2,boxShadow:"0 0 6px rgba(255,255,255,0.8)",transform:"translateX(-50%)"}}></div>
 </div>
 <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#4a5568",marginTop:2,fontFamily:"monospace"}}><span>0%</span><span>Stable</span><span>Elevated</span><span>Critical</span><span>100%</span></div>
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
 if(line.startsWith("**")&&line.endsWith("**"))return <div key={i} style={{color,fontWeight:800,fontSize:12,letterSpacing:1,textTransform:"uppercase",marginTop:i>0?14:0,marginBottom:5,fontFamily:"monospace",borderBottom:"1px solid "+color+"30",paddingBottom:3}}>{line.slice(2,-2)}</div>;
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
 const C=["#ff4444","#ffd700","#00ff9d"];
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


const rc=v=>v>=70?"#ff2d55":v>=50?"#ff6b35":v>=30?"#ffd700":"#00ff9d";
const CSS=`@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}input[type=range]{-webkit-appearance:none;width:100%;height:4px;background:#1e2d40;border-radius:2px;outline:none}input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#00d4ff;cursor:pointer}input[type=number]::-webkit-inner-spin-button{opacity:1}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#1e2d40}@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{box-shadow:0 0 20px rgba(0,212,255,0.3)}50%{box-shadow:0 0 45px rgba(0,212,255,0.6)}}@keyframes spin{to{transform:rotate(360deg)}}.F{animation:fadeUp .35s ease forwards}`;
const STEPS=["Reading parameters","Simulating system","Calculating risks","Preparing analysis","Result ready"];
const SRANGES=[[0,20],[20,50],[50,75],[75,95],[95,100]];
const PLAN_CLS={free:["1","7","8","9"],pro:["1","4","7","8","9","10"]};
const DAILY_LIMIT=3;

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
const[billing,setBilling]=useState("monthly");

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

const sp=(k,v)=>setParams(p=>({...p,[k]:v}));
const toggleTrait=k=>setParams(p=>{const t=p.traits||[];if(t.includes(k))return{...p,traits:t.filter(x=>x!==k)};if(t.length>=3)return p;return{...p,traits:[...t,k]};});
function startLoad(ms,cb){setLoading(true);setLoadPct(0);let p=0;const iv=setInterval(()=>{p+=100/(ms/40);const pct=Math.min(100,Math.round(p));setLoadPct(pct);if(pct>=100){clearInterval(iv);setTimeout(()=>{setLoading(false);cb();},200);}},40);}
function buildEntry(p,yr){
 const res=simAny(cls,p,yr);
 const rk={};Object.entries(res.risks).forEach(([k,v])=>{rk[k]=cl(v);});
 const avg=Math.round(Object.values(rk).reduce((a,b)=>a+b,0)/Object.values(rk).length);
 const sorted=Object.entries(rk).sort((a,b)=>b[1]-a[1]);
 return{id:Date.now(),cls,label:cfg.label,icon:cfg.icon,entity,years:yr,params:p,stability:res.stability,avg,worst:sorted[0][0],best:sorted[sorted.length-1][0],risks:rk,yearly:res.yearly,wealth:projectWealth(cls,p,yr,res.stability),netWorth:cls==="9"?projectNetWorth(p,yr,res.stability):null,date:new Date().toLocaleDateString()};
}
function finish(entry){setResult(entry);setHistory(h=>[entry,...h.slice(0,99)]);setAiText("");setPage("results");setTimeout(()=>{setAiLoad(true);setTimeout(()=>{setAiText(localAI(entry));setAiLoad(false);},1200);},300);}
function runStd(){if(!cls||!entity.trim()||atLimit)return;trackUsage();const clean={...params};cfg.fields.forEach(f=>{if(clean[f.k]===""||clean[f.k]==null)clean[f.k]=f.d;});startLoad(20000,()=>finish(buildEntry({...clean,style:sty},years)));}

const bg={minHeight:"100vh",background:"#060810",color:"#e2e8f0",fontFamily:"'Exo 2','Segoe UI',sans-serif",overflowX:"hidden"};
const grd={position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(0,212,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.025) 1px,transparent 1px)",backgroundSize:"40px 40px",pointerEvents:"none",zIndex:0};
const sc={position:"relative",zIndex:1,padding:"20px 16px 100px",maxWidth:520,margin:"0 auto"};
const card=(ac)=>({background:"#111827",border:"1px solid "+(ac||"#1e2d40"),borderRadius:8,padding:16,marginBottom:12});
const lbl={fontSize:10,color:"#4a5568",letterSpacing:2,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10,display:"block"};

if(loading){
 const ai=SRANGES.findIndex(r=>loadPct>=r[0]&&loadPct<r[1]);
 const aIdx=ai===-1?4:ai;
 return (<div style={{...bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
  <style>{CSS}</style>
  <div style={{fontFamily:"monospace",fontSize:10,color:"#4a5568",letterSpacing:4,marginBottom:28}}>SIMULATION RUNNING</div>
  <div style={{width:"100%",maxWidth:320,marginBottom:28}}>
   {STEPS.map((step,i)=>{
    const done=loadPct>=SRANGES[i][1],active=i===aIdx;
    const sp2=active?Math.round((loadPct-SRANGES[i][0])/(SRANGES[i][1]-SRANGES[i][0])*100):0;
    return (<div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:"1px solid #0d1117",opacity:done||active?1:0.25,transition:"opacity .4s"}}>
     <div style={{width:30,height:30,borderRadius:"50%",background:done?"#00ff9d":active?"#00d4ff":"#1e2d40",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,fontWeight:800,color:done||active?"#000":"#4a5568"}}>{done?"✓":active?"…":i+1}</div>
     <div style={{flex:1}}>
      <div style={{fontSize:12,fontWeight:active||done?700:400,color:done?"#00ff9d":active?"#e2e8f0":"#4a5568",marginBottom:active?5:0}}>{step}</div>
      {active&&<div style={{height:2,background:"#1e2d40",borderRadius:1,overflow:"hidden"}}><div style={{height:"100%",width:sp2+"%",background:"linear-gradient(90deg,#00d4ff,#00ff9d)",transition:"width .04s linear"}}></div></div>}
     </div>
     <div style={{fontFamily:"monospace",fontSize:10,color:done?"#00ff9d":active?"#00d4ff":"transparent",minWidth:36,textAlign:"right"}}>{done?"done":active?sp2+"%":""}</div>
    </div>);
   })}
  </div>
  <div style={{fontFamily:"monospace",fontSize:28,color:"#00d4ff",fontWeight:800,marginBottom:8}}>{loadPct}%</div>
  <div style={{width:280,height:3,background:"#1e2d40",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:loadPct+"%",background:"linear-gradient(90deg,#00d4ff,#00ff9d)",transition:"width .04s linear"}}></div></div>
 </div>);
}

return (<div style={bg}><style>{CSS}</style><div style={grd}/>

 {page==="home"&&(<div className="F" style={{...sc,paddingTop:0}}>
  <div style={{position:"relative",overflow:"hidden",borderRadius:12}}>
   <NodeCanvas/>
   <div style={{display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center",paddingTop:48,paddingBottom:36,position:"relative",zIndex:1}}>
   <div style={{width:80,height:80,borderRadius:"50%",border:"2px solid #00d4ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,marginBottom:18,animation:"pulse 2.5s infinite"}}>🛡</div>
   <div style={{fontFamily:"monospace",fontSize:28,color:"#00d4ff",letterSpacing:4,textShadow:"0 0 24px rgba(0,212,255,0.4)",marginBottom:4}}>RiskAI</div>
   <div style={{fontSize:10,color:"#2d3748",letterSpacing:5,fontFamily:"monospace",marginBottom:16}}>RISK SECURITY SYSTEM 3.2.1</div>
   <div style={{fontSize:14,color:"#8892a4",maxWidth:320,lineHeight:1.8,marginBottom:28}}>Strategic risk simulation for <span style={{color:"#00ff9d"}}>companies, real estate, investments, healthcare, personal finances & retirement</span>. Get a detailed strategic report after every run.</div>
   <div style={{display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:280}}>
    <button onClick={()=>setPage("sim")} style={{background:"#00d4ff",color:"#000",border:"none",borderRadius:4,padding:"14px 20px",fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 0 24px rgba(0,212,255,0.35)"}}>▶ START SIMULATION</button>
    <button onClick={()=>setPage("pricing")} style={{background:"transparent",color:"#00d4ff",border:"1.5px solid #00d4ff",borderRadius:4,padding:"11px 20px",fontWeight:700,fontSize:13,cursor:"pointer"}}>💎 PLANS & PRICING</button>
   </div>
  </div>
  </div>
  <div style={{...card("#00d4ff20"),marginBottom:12}}>
   <div style={{fontSize:11,color:"#00d4ff",fontWeight:800,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:12}}>What is RiskAI?</div>
   <div style={{fontSize:13,color:"#c4cfdf",lineHeight:1.75,marginBottom:12}}>RiskAI calculates how systems accumulate and respond to risk over time. Enter parameters, choose your class, get a detailed strategic risk assessment in seconds.</div>
   <div style={{fontSize:11,color:"#00d4ff",fontWeight:700,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:8}}>How it works</div>
   {[{h:"Input your parameters",d:"Up to 17 levers — Cybersecurity, Cashflow, Debt, Culture and more. Each value shapes your risk fingerprint."},{h:"Category-specific weighting",d:"Startups and Tech Giants face fundamentally different risks. RiskAI applies class-specific formulas."},{h:"S-curve risk modelling",d:"Each risk grows along a calibrated S-curve. Extreme inputs produce extreme outcomes — no flat averages."},{h:"Strategic analysis report",d:"Our engine reads your numbers and generates a situation assessment, root cause breakdown, and action plan."}].map((item,i)=>(<div key={i} style={{background:"rgba(0,212,255,0.04)",border:"1px solid #1e2d40",borderRadius:6,padding:"10px 12px",marginBottom:6}}><div style={{fontSize:12,color:"#00d4ff",fontWeight:700,marginBottom:3}}>{item.h}</div><div style={{fontSize:12,color:"#8892a4",lineHeight:1.6}}>{item.d}</div></div>))}
  </div>
  {[{icon:"🏛",t:"6 Critical System Classes",d:"Company, Real Estate, Stocks/ETF, Healthcare, Lifestyle & Retirement — each with unique risk logic."},{icon:"💰",t:"Wealth Projection",d:"For Real Estate, Stocks/ETF & Retirement, see a projected asset value years into the future based on your inputs and stability score."},{icon:"📊",t:"Risk Distribution Chart",d:"Every result includes a donut chart and overall risk scale showing exactly how your risks are weighted and distributed."},{icon:"🎯",t:"Detailed Strategic Report",d:"Every simulation ends with a full report: root causes, priority actions, 5-year forecast."}].map(f=>(<div key={f.t} style={{...card(),display:"flex",gap:14,marginBottom:10}}><div style={{fontSize:22,flexShrink:0,marginTop:2}}>{f.icon}</div><div><div style={{fontSize:13,fontWeight:700,color:"#e2e8f0",marginBottom:4}}>{f.t}</div><div style={{fontSize:12,color:"#8892a4",lineHeight:1.65}}>{f.d}</div></div></div>))}
  <div style={{...card("#00ff9d15"),border:"1px solid #00ff9d30",marginBottom:16}}>
   <div style={{fontSize:11,color:"#00ff9d",fontWeight:800,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10}}>Why RiskAI is different</div>
   {["Real mathematical differentiation, not flat 80% risk","6 focused systems, one platform","Parameters mirror real governance and financial levers","Designed for mobile — simulate anywhere"].map(pt=>(<div key={pt} style={{display:"flex",gap:10,marginBottom:7,fontSize:12,color:"#c4cfdf"}}><span style={{color:"#00ff9d",flexShrink:0}}>→</span>{pt}</div>))}
  </div>
  <div style={{...card(),textAlign:"center",padding:"20px 16px",marginBottom:12}}>
   <div style={{fontSize:11,color:"#ffd700",fontWeight:800,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10}}>Our Mission</div>
   <div style={{fontSize:13,color:"#8892a4",lineHeight:1.8,fontStyle:"italic"}}>"Critical infrastructure fails from compounding risks no one modelled. RiskAI exists to change that."</div>
  </div>
  <div style={{...card("#a78bfa20"),marginBottom:16}}>
   <div style={{fontSize:11,color:"#a78bfa",fontWeight:800,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:10}}>🚀 What's Next</div>
   <div style={{fontSize:12,color:"#8892a4",lineHeight:1.7,marginBottom:8}}>RiskAI is actively evolving. New system classes, refined risk models, and deeper financial projections are on the roadmap.</div>
   <div style={{fontSize:11,color:"#a78bfa",fontWeight:700}}>Pro members get early access to every new class.</div>
  </div>
  <button onClick={()=>setPage("sim")} style={{width:"100%",background:"#00d4ff",color:"#000",border:"none",borderRadius:4,padding:"14px",fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 0 24px rgba(0,212,255,0.3)",marginBottom:16}}>▶ START YOUR FIRST SIMULATION</button>
  <div style={{textAlign:"center",fontSize:10,color:"#2d3748",fontFamily:"monospace",marginBottom:8}}>v3.2.1 · 6 System Classes · Strategic Reports</div>
 </div>)}

 {page==="sim"&&(<div className="F" style={sc}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
   <div style={{fontFamily:"monospace",fontSize:12,color:"#00d4ff",letterSpacing:2}}>◈ NEW SIMULATION</div>
   <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:"#4a5568",cursor:"pointer",fontSize:18}}>✕</button>
  </div>
  <div style={{display:"flex",gap:6,marginBottom:20}}>{["free","pro"].map(pp=>(<button key={pp} onClick={()=>setPlan(pp)} style={{flex:1,padding:"6px",borderRadius:6,border:"1px solid "+(plan===pp?"#00d4ff":"#1e2d40"),background:plan===pp?"#00d4ff15":"transparent",color:plan===pp?"#00d4ff":"#4a5568",fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontFamily:"monospace"}}>{pp}</button>))}</div>
  <div style={card()}><span style={lbl}>01 — System Class</span>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{Object.entries(CLS).map(([k,v])=>{const isLocked=!PLAN_CLS[plan].includes(k);return (<button key={k} onClick={()=>{if(isLocked){setPage("pricing");return;}setCls(k);setProfIdx(0);}} style={{background:cls===k?v.color+"15":"#0d1117",border:"1.5px solid "+(cls===k?v.color:"#1e2d40"),borderRadius:6,padding:"10px 8px",cursor:"pointer",textAlign:"left",position:"relative",opacity:isLocked?0.45:1}}><div style={{fontSize:18,marginBottom:2}}>{v.icon}</div><div style={{fontSize:11,color:cls===k?v.color:"#8892a4",fontWeight:700}}>{v.label}</div>{isLocked&&<div style={{position:"absolute",top:6,right:6,fontSize:11}}>🔒</div>}{!isLocked&&plan==="free"&&<div style={{position:"absolute",top:6,right:6,fontSize:9,color:"#4a5568"}}>shared limit</div>}</button>);})}</div>
  </div>
  {cfg&&(<>
   <div style={card()}><span style={lbl}>02 — Entity & Duration</span>
    <div style={{marginBottom:14}}><div style={{fontSize:10,color:"#4a5568",marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>{cfg.eLabel}</div><input value={entity} onChange={e=>setEntity(e.target.value)} placeholder="Enter name..." style={{width:"100%",background:"#0d1117",border:"1px solid #1e2d40",color:"#e2e8f0",borderRadius:4,padding:"10px 12px",fontSize:14,outline:"none",fontFamily:"inherit"}}/></div>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#8892a4"}}>Simulation Years</span><span style={{fontFamily:"monospace",fontSize:14,color:cfg.color,fontWeight:700}}>{years}</span></div>
    <input type="range" min={1} max={cfg.maxYears||20} value={years} onChange={e=>setYears(+e.target.value)} style={{accentColor:cfg.color}}/>
   </div>
   <div style={card()}><span style={lbl}>03 — Profile</span>
    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{cfg.profiles.map((pr,i)=>(<button key={i} onClick={()=>setProfIdx(i)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid "+(profIdx===i?cfg.color:"#1e2d40"),background:"transparent",color:profIdx===i?cfg.color:"#4a5568",fontSize:11,cursor:"pointer",fontWeight:profIdx===i?700:400}}>{pr.n}</button>))}</div>
   </div>
   <div style={card()}><span style={lbl}>04 — Parameters</span>
    {cfg.fields.map(f=>(<div key={f.k} style={{marginBottom:11}}>
     <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
      <span style={{fontSize:12,color:"#8892a4"}}>{f.l}</span>
      <input type="number" min={f.lo??1} max={f.hi??10} value={params[f.k]??f.d} onChange={e=>{const raw=e.target.value;if(raw===""){sp(f.k,"");return;}const n=parseInt(raw,10);if(!isNaN(n))sp(f.k,n);}} onBlur={e=>{const lo=f.lo??1,hi=f.hi??10;let n=parseInt(e.target.value,10);if(isNaN(n))n=f.d;sp(f.k,Math.min(hi,Math.max(lo,n)));}} style={{width:84,background:"#0d1117",border:"1px solid #1e2d40",color:cfg.color,borderRadius:4,padding:"2px 6px",fontSize:12,fontWeight:700,fontFamily:"monospace",textAlign:"right",outline:"none"}}/>
     </div>
     <input type="range" min={f.lo??1} max={f.hi??10} value={params[f.k]===""?f.d:(params[f.k]??f.d)} onChange={e=>sp(f.k,+e.target.value)} style={{accentColor:cfg.color}}/>
    </div>))}
    {cfg.hasStyle&&(<div style={{marginTop:10}}><div style={{fontSize:10,color:"#4a5568",letterSpacing:2,textTransform:"uppercase",marginBottom:7,fontFamily:"monospace"}}>Leadership Style</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["stable","visionary","aggressive","cooperative","authoritarian"].map(s=>(<button key={s} onClick={()=>setSty(s)} style={{padding:"5px 11px",borderRadius:20,border:"1px solid "+(sty===s?cfg.color:"#1e2d40"),background:"transparent",color:sty===s?cfg.color:"#4a5568",fontSize:11,cursor:"pointer"}}>{s}</button>))}</div></div>)}
    {cfg.hasTraits&&(<div style={{marginTop:10}}><div style={{fontSize:10,color:"#4a5568",letterSpacing:2,textTransform:"uppercase",marginBottom:3,fontFamily:"monospace"}}>Characteristics (choose up to 3)</div><div style={{fontSize:10,color:"#2d3748",marginBottom:7}}>{(params.traits||[]).length}/3 selected</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{TRAITS.map(t=>{const sel=(params.traits||[]).includes(t.k);return (<button key={t.k} onClick={()=>toggleTrait(t.k)} style={{padding:"6px 12px",borderRadius:20,border:"1px solid "+(sel?cfg.color:"#1e2d40"),background:sel?cfg.color+"15":"transparent",color:sel?cfg.color:"#4a5568",fontSize:11,cursor:"pointer",fontWeight:sel?700:400}}>{t.l}</button>);})}</div></div>)}
   </div>
   <div style={card()}>
    {limited&&<div style={{background:atLimit?"rgba(255,45,85,0.08)":"rgba(0,212,255,0.06)",border:"1px solid "+(atLimit?"#ff2d5530":"#00d4ff25"),padding:"10px 12px",borderRadius:8,marginBottom:10,fontSize:12,color:atLimit?"#ff2d55":"#8892a4"}}>{atLimit?"⚠ Daily limit reached ("+DAILY_LIMIT+"/day) on the Free plan. Upgrade to Pro for unlimited access.":"🔓 Free plan: "+(DAILY_LIMIT-usedToday)+" of "+DAILY_LIMIT+" daily simulations remaining (total, across all classes)."}</div>}
    <button onClick={runStd} disabled={!entity.trim()||atLimit} style={{width:"100%",background:(entity.trim()&&!atLimit)?"#00ff9d":"#1e2d40",color:"#000",border:"none",borderRadius:4,padding:"13px",fontWeight:800,fontSize:14,cursor:(entity.trim()&&!atLimit)?"pointer":"not-allowed",opacity:(entity.trim()&&!atLimit)?1:0.5,boxShadow:(entity.trim()&&!atLimit)?"0 0 20px rgba(0,255,157,0.3)":"none"}}>{atLimit?"🔒 Upgrade to Pro":"▶ RUN SIMULATION"}</button>
    {!entity.trim()&&!atLimit&&<div style={{fontSize:11,color:"#ff6b35",textAlign:"center",marginTop:6}}>Enter entity name above</div>}
    {atLimit&&<button onClick={()=>setPage("pricing")} style={{width:"100%",marginTop:8,background:"transparent",border:"1px solid #00d4ff40",color:"#00d4ff",borderRadius:4,padding:"9px",fontSize:12,cursor:"pointer"}}>View Plans →</button>}
   </div>
  </>)}
 </div>)}

 {page==="results"&&result&&(<div className="F" style={sc}>
  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
   <div style={{fontFamily:"monospace",fontSize:11,color:CLS[result.cls]?.color,letterSpacing:2}}>◈ RESULTS — {result.label.toUpperCase()}</div>
   <button onClick={()=>{setPage("sim");setCls("");setResult(null);}} style={{background:"transparent",border:"1px solid #1e2d40",color:"#8892a4",borderRadius:4,padding:"5px 12px",cursor:"pointer",fontSize:11}}>+ New</button>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
   {[{v:result.stability+"%",l:"Stability",c:"#00ff9d"},{v:result.avg+"%",l:result.avg>=65?"⚠ CRITICAL":result.avg>=45?"▲ ELEVATED":"✓ STABLE",c:result.avg>=65?"#ff2d55":result.avg>=45?"#ff6b35":"#00ff9d"},{v:result.worst,l:"Dominant Risk",c:"#ff2d55"},{v:result.best,l:"Strongest Area",c:"#00ff9d"}].map(({v,l,c})=>(<div key={l} style={{...card(),textAlign:"center",marginBottom:0}}><div style={{fontFamily:"monospace",fontSize:v.length>12?11:18,color:c,fontWeight:800,marginBottom:2,wordBreak:"break-word"}}>{v}</div><div style={{fontSize:9,color:"#4a5568",letterSpacing:1,textTransform:"uppercase"}}>{l}</div></div>))}
  </div>
  <div style={card()}><span style={lbl}>◈ Risk Distribution · {result.entity}</span>
   <DonutChart risks={result.risks} color={CLS[result.cls]?.color||"#00d4ff"}/>
  </div>

  {result.wealth&&<div style={{...card("#00ff9d30"),background:"linear-gradient(135deg,#0d1117,#0a1f17)"}}>
   <span style={lbl}>💰 Projected Asset Value · {result.years}yr</span>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:10}}>
    <div><div style={{fontSize:10,color:"#4a5568",marginBottom:2}}>Today</div><div style={{fontFamily:"monospace",fontSize:16,color:"#8892a4",fontWeight:700}}>€{result.wealth.start.toLocaleString()}</div></div>
    <div style={{fontSize:18,color:"#00ff9d"}}>→</div>
    <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#4a5568",marginBottom:2}}>In {result.years} years</div><div style={{fontFamily:"monospace",fontSize:24,color:"#00ff9d",fontWeight:800}}>€{result.wealth.final.toLocaleString()}</div></div>
   </div>
   <div style={{fontSize:12,color:"#8892a4",lineHeight:1.6,marginBottom:8}}>{result.wealth.final>=result.wealth.start?"📈 +":"📉 −"}<span style={{color:result.wealth.final>=result.wealth.start?"#00ff9d":"#ff2d55",fontWeight:700}}>{Math.abs(Math.round((result.wealth.final-result.wealth.start)/Math.max(1,Math.abs(result.wealth.start))*100))}%</span> at {(result.wealth.rate*100).toFixed(1)}%/yr (stability-adjusted).</div>
   <Chart yearly={result.wealth.pts.map(p=>({stability:p.value}))} color="#00ff9d"/>
   <div style={{fontSize:10,color:"#4a5568",lineHeight:1.5,marginTop:8,paddingTop:8,borderTop:"1px solid #1e2d40"}}>⚠ Illustrative projection — not financial advice. Actual returns depend on market conditions.</div>
  </div>}
  {result.netWorth&&<div style={{...card("#fbbf2430"),background:"linear-gradient(135deg,#0d1117,#1f1a0a)"}}>
   <span style={lbl}>💰 Net Worth Projection · {result.years}yr</span>
   <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
    <div><div style={{fontSize:10,color:"#4a5568",marginBottom:4}}>Today</div>
     <div style={{fontSize:12,color:"#ff6b35"}}>Debt: €{result.netWorth.startDebt.toLocaleString()}</div>
     <div style={{fontSize:12,color:"#00ff9d"}}>Savings: €{result.netWorth.startSavings.toLocaleString()}</div>
     <div style={{fontFamily:"monospace",fontSize:14,color:"#e2e8f0",fontWeight:800,marginTop:4}}>Net: €{result.netWorth.startNet.toLocaleString()}</div>
    </div>
    <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#4a5568",marginBottom:4}}>In {result.years} years</div>
     <div style={{fontSize:12,color:"#ff6b35"}}>Debt: €{result.netWorth.finalDebt.toLocaleString()}</div>
     <div style={{fontSize:12,color:"#00ff9d"}}>Savings: €{result.netWorth.finalSavings.toLocaleString()}</div>
     <div style={{fontFamily:"monospace",fontSize:14,color:"#fbbf24",fontWeight:800,marginTop:4}}>Net: €{result.netWorth.finalNet.toLocaleString()}</div>
    </div>
   </div>
   <Chart yearly={result.netWorth.pts.map(p=>({stability:p.net}))} color="#fbbf24"/>
   <div style={{fontSize:10,color:"#4a5568",lineHeight:1.5,marginTop:8,paddingTop:8,borderTop:"1px solid #1e2d40"}}>⚠ Illustrative projection assuming consistent savings rate and debt repayment — not financial advice. Net = Savings − Debt.</div>
  </div>}
  <div style={card()}><span style={lbl}>Risk Overview · {result.entity}</span>
   {Object.entries(result.risks).sort((a,b)=>b[1]-a[1]).map(([k,v])=>{const c=rc(v);return (<div key={k} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#e2e8f0"}}>{k}{v>=70?" ⚠":v>=50?" ▲":v<=30?" ✓":""}</span><span style={{fontFamily:"monospace",fontSize:12,color:c,fontWeight:700}}>{v}%</span></div><div style={{height:5,background:"#1e2d40",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:v+"%",background:c,borderRadius:3,transition:"width 1s ease"}}></div></div></div>);})}
  </div>
  <div style={card("#00d4ff30")}><span style={lbl}>◈ Strategic Analysis Engine</span>
   <div style={{fontSize:11,color:"#4a5568",lineHeight:1.6,marginBottom:10,paddingBottom:10,borderBottom:"1px solid #1e2d40"}}>This report is generated by a rule-based analysis engine using the risk model above — not a live AI consultation. Formulas are designed to be directionally plausible but are not empirically validated. Use as a starting point for discussion, not as financial, medical, or legal advice.</div>
   {aiLoad?(<div style={{display:"flex",alignItems:"center",gap:10,color:"#8892a4",fontSize:13}}><div style={{width:14,height:14,border:"2px solid #00d4ff",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}></div>Generating report for {result.entity}...</div>):(<div><MD text={aiText} color={CLS[result.cls]?.color||"#00d4ff"}/><button onClick={()=>{setAiLoad(true);setTimeout(()=>{setAiText(localAI(result));setAiLoad(false);},900);}} style={{marginTop:12,background:"transparent",border:"1px solid #1e2d40",color:"#4a5568",borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:11}}>↻ Regenerate</button></div>)}
  </div>
  <button onClick={()=>{setPage("sim");setCls("");setResult(null);}} style={{width:"100%",background:"transparent",border:"1px solid #1e2d40",color:"#8892a4",borderRadius:4,padding:"12px",cursor:"pointer",fontSize:13,marginTop:4}}>+ Run Another Simulation</button>
 </div>)}

 {page==="history"&&(<div className="F" style={sc}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
   <div style={{fontFamily:"monospace",fontSize:12,color:"#00d4ff",letterSpacing:2}}>◈ HISTORY {history.length>0&&"("+history.length+")"}</div>
   {history.length>0&&<button onClick={()=>{if(confirm("Clear all "+history.length+" entries?"))setHistory([]);}} style={{background:"transparent",border:"1px solid #1e2d40",color:"#4a5568",borderRadius:4,padding:"5px 12px",cursor:"pointer",fontSize:11}}>Clear</button>}
  </div>
  {history.length===0?<div style={card()}><div style={{textAlign:"center",color:"#4a5568",padding:"20px 0"}}>No simulations yet.</div></div>:history.map(e=>{const c=e.avg>=65?"#ff2d55":e.avg>=45?"#ff6b35":"#00ff9d";return (<div key={e.id} onClick={()=>{setResult(e);setPage("results");}} style={{...card(),cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontWeight:700}}>{e.icon} {e.entity}</span><span style={{fontSize:10,color:"#4a5568",fontFamily:"monospace"}}>{e.date}</span></div><div style={{fontSize:11,color:"#4a5568",marginBottom:8}}>{e.label} · {e.years}yr</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[{tx:"Load: "+e.avg+"%",c},{tx:"Stability: "+e.stability+"%",c:"#00ff9d"},{tx:"⚠ "+e.worst,c:"#ff2d55"}].map(({tx,c:co})=>(<span key={tx} style={{fontSize:10,padding:"2px 8px",borderRadius:20,border:"1px solid "+co,color:co}}>{tx}</span>))}</div></div>);})}
 </div>)}

 {page==="pricing"&&(<div className="F" style={sc}>
  <div style={{fontFamily:"monospace",fontSize:12,color:"#00d4ff",letterSpacing:2,marginBottom:8}}>◈ PRICING</div>
  <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>Choose your plan</div>
  <div style={{fontSize:13,color:"#8892a4",lineHeight:1.65,marginBottom:10}}>Start free and upgrade when you need more. Every plan includes the full simulation engine and strategic reports.</div>
  <div style={{fontSize:11,color:"#4a5568",marginBottom:16,fontFamily:"monospace"}}>Stripe · Cancel anytime</div>
  <div style={{...card(),marginBottom:16}}><span style={lbl}>Class Access by Plan</span>
   {[{p:"Free",c:"🏢 Company · 🏠 Real Estate · 📈 Stocks/ETF · 🧍 Lifestyle",sub:"limited to "+DAILY_LIMIT+" sims/day total",col:"#4a5568"},{p:"Pro",c:"All 6 classes incl. 🏥 Healthcare & 🏦 Retirement",sub:"unlimited simulations & history",col:"#00d4ff"}].map(r=>(<div key={r.p} style={{marginBottom:8}}><div style={{display:"flex",gap:8,alignItems:"baseline"}}><span style={{fontSize:11,fontWeight:800,color:r.col,minWidth:70}}>{r.p}</span><span style={{fontSize:12,color:"#c4cfdf"}}>{r.c}</span></div><div style={{fontSize:10,color:"#4a5568",marginLeft:78}}>{r.sub}</div></div>))}
  </div>
  {[{n:"Free",p:"€0",per:"Forever",col:"#4a5568",ok:["Company simulation","5 preset profiles","Standard mode","Full strategic report","Risk distribution chart"],no:["All system classes","Wealth projections","Unlimited history"]},{n:"Pro",p:"€29.99",per:"/month",orig:"€89.99",sale:"67% OFF",col:"#00d4ff",feat:true,ok:["No usage limits","Early access to new system classes","All 6 system classes","Strategic analysis reports","Wealth projections","100 history slots","All profiles & styles"],no:[]}].map(pl=>(<div key={pl.n} style={{...card(pl.feat?pl.col+"50":undefined),boxShadow:pl.feat?"0 0 24px "+pl.col+"18":"none",marginBottom:12}}>{pl.feat&&<div style={{fontSize:10,color:pl.col,letterSpacing:2,fontFamily:"monospace",marginBottom:8}}>★ MOST POPULAR</div>}<div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div><div style={{fontSize:18,fontWeight:800}}>{pl.n}</div><div style={{fontSize:11,color:"#4a5568"}}>{pl.per}</div></div><div style={{textAlign:"right"}}>{pl.sale&&<div style={{display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end",marginBottom:2}}><span style={{fontSize:12,color:"#4a5568",textDecoration:"line-through"}}>{pl.orig}</span><span style={{fontSize:10,color:"#00ff9d",background:"rgba(0,255,157,0.12)",padding:"2px 6px",borderRadius:4,fontWeight:800}}>{pl.sale}</span></div>}<div style={{fontFamily:"monospace",fontSize:28,color:pl.col,fontWeight:800}}>{pl.p}</div></div></div>{pl.ok.map(f=><div key={f} style={{fontSize:12,color:"#8892a4",padding:"4px 0",borderBottom:"1px solid #0d1117",display:"flex",gap:8}}><span style={{color:"#00ff9d"}}>✓</span>{f}</div>)}{pl.no.map(f=><div key={f} style={{fontSize:12,color:"#2d3748",padding:"4px 0",borderBottom:"1px solid #0d1117",display:"flex",gap:8}}><span>✗</span>{f}</div>)}<button onClick={()=>alert("Stripe integration coming soon. Plan: "+pl.n)} style={{width:"100%",marginTop:14,background:pl.feat?pl.col:"transparent",color:pl.feat?"#000":pl.col,border:"1.5px solid "+pl.col,borderRadius:4,padding:"11px",fontWeight:700,fontSize:12,cursor:"pointer"}}>{pl.p==="€0"?"Get Started Free":"Subscribe €29.99/mo →"}</button></div>))}
  <div style={{...card(),marginBottom:12}}><span style={lbl}>💎 Annual Plan — Best Value</span>
   <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
    <div><div style={{fontSize:16,fontWeight:800,color:"#00d4ff"}}>Pro Yearly</div><div style={{fontSize:11,color:"#4a5568"}}>Everything in Pro · billed annually</div></div>
    <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#00ff9d",background:"rgba(0,255,157,0.12)",padding:"2px 8px",borderRadius:4,fontWeight:800,marginBottom:4,display:"inline-block"}}>save 72%</div><div style={{fontFamily:"monospace",fontSize:24,color:"#00d4ff",fontWeight:800}}>€99.99<span style={{fontSize:12,color:"#4a5568",fontWeight:400}}>/yr</span></div><div style={{fontSize:11,color:"#00ff9d"}}>≈ €8.33/month — save 72%</div></div>
   </div>
   <button onClick={()=>alert("Stripe integration coming soon. Plan: Pro Yearly")} style={{width:"100%",background:"transparent",color:"#00d4ff",border:"1.5px solid #00d4ff",borderRadius:4,padding:"11px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Subscribe €99.99/yr →</button>
  </div>
  <div style={{...card(),textAlign:"center",border:"1px dashed #1e2d40"}}>
   <div style={{fontSize:11,color:"#8892a4",fontWeight:800,letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>🏢 Enterprise</div>
   <div style={{fontSize:12,color:"#4a5568",lineHeight:1.6,marginBottom:10}}>Custom deployments, dedicated support, and API access for organisations.</div>
   <button onClick={()=>alert("Contact: hello@riskai.app")} style={{background:"transparent",border:"1.5px solid #4a5568",color:"#8892a4",borderRadius:4,padding:"9px 20px",fontWeight:700,fontSize:12,cursor:"pointer"}}>Contact Us</button>
  </div>
 </div>)}

 <div style={{position:"fixed",bottom:0,left:0,right:0,background:"rgba(6,8,16,0.97)",borderTop:"1px solid #1e2d40",display:"grid",gridTemplateColumns:"repeat(4,1fr)",zIndex:100}}>
  {[["sim","⚡","Simulate"],["history","📋","History"],["pricing","💎","Pricing"],["home","📖","About"]].map(([id,icon,lb])=>(<button key={id} onClick={()=>setPage(id)} style={{background:"none",border:"none",color:page===id?"#00d4ff":"#4a5568",cursor:"pointer",padding:"10px 4px 14px",fontSize:9,letterSpacing:.5,textTransform:"uppercase",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:20}}>{icon}</span>{lb}</button>))}
 </div>
</div>);
}
