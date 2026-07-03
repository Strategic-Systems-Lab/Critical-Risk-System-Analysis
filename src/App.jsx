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
