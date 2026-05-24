if(sessionStorage.getItem('od_admin')!=='1') window.location.href='admin-login.html';
function logout(){sessionStorage.removeItem('od_admin');window.location.href='admin-login.html';}

const K={rev:'od_rev',cost:'od_cost',exp:'od_exp',staff:'od_staff',inv:'od_inv'};
const load=k=>JSON.parse(localStorage.getItem(k)||'[]');
const save=(k,d)=>localStorage.setItem(k,JSON.stringify(d));
const f=n=>'$'+parseFloat(n||0).toFixed(2);

function go(id,btn){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.sitem').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+id).classList.add('on');
  btn.classList.add('active');
  if(id==='pnl') renderPnL();
  if(id==='dashboard') renderDash();
}

document.addEventListener('DOMContentLoaded',()=>{
  const today=new Date().toISOString().split('T')[0];
  const mon=today.slice(0,7);
  const d=document.getElementById('rDate'); if(d) d.value=today;
  const em=document.getElementById('eMonth'); if(em) em.value=mon;
  const pm=document.getElementById('pMonth'); if(pm) pm.value=mon;
  document.getElementById('curMonth').textContent=new Date().toLocaleString('en-SG',{month:'long',year:'numeric'});
  renderAll();
});

function renderAll(){renderRev();renderCost();renderExp();renderStaff();renderInv();renderDash();}

function calcRev(){
  const h=+document.getElementById('rH').value||0;
  const bw=+document.getElementById('rBW').value||0;
  const mix=+document.getElementById('rMix').value||0;
  const oth=+document.getElementById('rOth').value||0;
  document.getElementById('revCalc').textContent='Daily Total: '+f((h*7.5)+(bw*4)+(mix*5)+oth);
}
function addRev(){
  const date=document.getElementById('rDate').value;
  const h=+document.getElementById('rH').value||0;
  const bw=+document.getElementById('rBW').value||0;
  const mix=+document.getElementById('rMix').value||0;
  const oth=+document.getElementById('rOth').value||0;
  if(!date) return alert('Please select a date.');
  const total=(h*7.5)+(bw*4)+(mix*5)+oth;
  const data=load(K.rev);
  data.unshift({id:Date.now(),date,h,bw,mix,oth,total});
  save(K.rev,data);
  ['rH','rBW','rMix','rOth'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('revCalc').textContent='Daily Total: $0.00';
  renderRev();renderDash();
}
function renderRev(){
  const data=load(K.rev);
  const tb=document.getElementById('revBody');
  if(!tb) return;
  tb.innerHTML=data.length?data.map(r=>`<tr>
    <td>${r.date}</td>
    <td>${r.h} × $7.50 = ${f(r.h*7.5)}</td>
    <td>${r.bw} × $4.00 = ${f(r.bw*4)}</td>
    <td>${r.mix} × $5.00 = ${f(r.mix*5)}</td>
    <td>${f(r.oth)}</td>
    <td><strong>${f(r.total)}</strong></td>
    <td><button class="dbtn" onclick="del('${K.rev}',${r.id},renderRev)">✕</button></td>
  </tr>`).join(''):'<tr><td colspan="7" style="text-align:center;color:#aaa;padding:24px">No entries yet.</td></tr>';
}
function clearRev(){if(confirm('Clear all revenue data?')){save(K.rev,[]);renderRev();renderDash();}}

function addCost(){
  const dish=document.getElementById('cDish').value.trim();
  const sell=+document.getElementById('cSell').value;
  const ingr=+document.getElementById('cIngr').value;
  const pack=+document.getElementById('cPack').value;
  if(!dish||!sell) return alert('Dish name and selling price required.');
  const tc=ingr+pack,profit=sell-tc,margin=sell>0?((profit/sell)*100).toFixed(1):0;
  const data=load(K.cost);
  data.push({id:Date.now(),dish,sell,ingr,pack,tc,profit,margin});
  save(K.cost,data);
  ['cDish','cSell','cIngr','cPack'].forEach(id=>document.getElementById(id).value='');
  renderCost();
}
function renderCost(){
  const data=load(K.cost);
  const tb=document.getElementById('costBody');
  if(!tb) return;
  tb.innerHTML=data.length?data.map(c=>`<tr>
    <td><strong>${c.dish}</strong></td>
    <td>${f(c.sell)}</td><td>${f(c.ingr)}</td><td>${f(c.pack)}</td><td>${f(c.tc)}</td>
    <td class="${c.profit>=0?'gn':'rd'}">${f(c.profit)}</td>
    <td class="${c.margin>=60?'gn':c.margin>=40?'':'rd'}">${c.margin}%</td>
    <td><button class="dbtn" onclick="del('${K.cost}',${c.id},renderCost)">✕</button></td>
  </tr>`).join(''):'<tr><td colspan="8" style="text-align:center;color:#aaa;padding:24px">No dishes added yet.</td></tr>';
}

function addExp(){
  const month=document.getElementById('eMonth').value;
  const cat=document.getElementById('eCat').value;
  const desc=document.getElementById('eDesc').value.trim();
  const amt=+document.getElementById('eAmt').value;
  if(!month||!amt) return alert('Month and amount required.');
  const data=load(K.exp);
  data.unshift({id:Date.now(),month,cat,desc,amt});
  save(K.exp,data);
  document.getElementById('eDesc').value='';
  document.getElementById('eAmt').value='';
  renderExp();renderDash();
}
function renderExp(){
  const data=load(K.exp);
  const tb=document.getElementById('expBody');
  if(!tb) return;
  tb.innerHTML=data.length?data.map(e=>`<tr>
    <td>${e.month}</td><td>${e.cat}</td><td>${e.desc||'—'}</td><td>${f(e.amt)}</td>
    <td><button class="dbtn" onclick="del('${K.exp}',${e.id},renderExp)">✕</button></td>
  </tr>`).join(''):'<tr><td colspan="5" style="text-align:center;color:#aaa;padding:24px">No expenses yet.</td></tr>';
}
function clearExp(){if(confirm('Clear all expenses?')){save(K.exp,[]);renderExp();renderDash();}}

function addStaff(){
  const name=document.getElementById('sName').value.trim();
  const role=document.getElementById('sRole').value.trim();
  const sal=+document.getElementById('sSal').value;
  const cpf=+document.getElementById('sCPF').value;
  if(!name) return alert('Name required.');
  const data=load(K.staff);
  data.push({id:Date.now(),name,role,sal,cpf,total:sal+cpf});
  save(K.staff,data);
  ['sName','sRole','sSal','sCPF'].forEach(id=>document.getElementById(id).value='');
  renderStaff();renderDash();
}
function renderStaff(){
  const data=load(K.staff);
  const tb=document.getElementById('staffBody');
  if(!tb) return;
  tb.innerHTML=data.length?data.map(s=>`<tr>
    <td><strong>${s.name}</strong></td><td>${s.role||'—'}</td>
    <td>${f(s.sal)}</td><td>${f(s.cpf)}</td><td>${f(s.total)}</td>
    <td><button class="dbtn" onclick="del('${K.staff}',${s.id},renderStaff)">✕</button></td>
  </tr>`).join(''):'<tr><td colspan="6" style="text-align:center;color:#aaa;padding:24px">No staff yet.</td></tr>';
}
function clearStaff(){if(confirm('Clear all staff?')){save(K.staff,[]);renderStaff();renderDash();}}

function addInv(){
  const name=document.getElementById('iName').value.trim();
  const total=+document.getElementById('iTotal').value;
  const paid=+document.getElementById('iPaid').value;
  const notes=document.getElementById('iNotes').value.trim();
  if(!name||!total) return alert('Name and total required.');
  const rem=total-paid,pct=Math.min(100,(paid/total)*100).toFixed(0);
  const data=load(K.inv);
  data.push({id:Date.now(),name,total,paid,rem,pct,notes});
  save(K.inv,data);
  ['iName','iTotal','iPaid','iNotes'].forEach(id=>document.getElementById(id).value='');
  renderInv();
}
function renderInv(){
  const data=load(K.inv);
  const tb=document.getElementById('invBody');
  if(!tb) return;
  tb.innerHTML=data.length?data.map(inv=>`<tr>
    <td><strong>${inv.name}</strong></td>
    <td>${f(inv.total)}</td>
    <td class="gn">${f(inv.paid)}</td>
    <td class="${inv.rem>0?'rd':'gn'}">${f(inv.rem)}</td>
    <td><div class="pbar-wrap"><div class="pbar" style="width:${inv.pct}%"></div></div><span style="font-size:0.76rem;color:#666">${inv.pct}%</span></td>
    <td>${inv.notes||'—'}</td>
    <td><button class="dbtn" onclick="del('${K.inv}',${inv.id},renderInv)">✕</button></td>
  </tr>`).join(''):'<tr><td colspan="7" style="text-align:center;color:#aaa;padding:24px">No investors yet.</td></tr>';
}
function clearInv(){if(confirm('Clear investor data?')){save(K.inv,[]);renderInv();}}

function renderDash(){
  const mon=new Date().toISOString().slice(0,7);
  const rev=load(K.rev).filter(r=>r.date?.startsWith(mon)).reduce((a,r)=>a+r.total,0);
  const exp=load(K.exp).filter(e=>e.month===mon).reduce((a,e)=>a+e.amt,0);
  const staff=load(K.staff).reduce((a,s)=>a+s.total,0);
  const net=rev-exp-staff;
  const g=document.getElementById('kpiGrid');
  if(!g) return;
  g.innerHTML=`
    <div class="kcard"><div class="klbl">Revenue This Month</div><div class="kval g">${f(rev)}</div></div>
    <div class="kcard"><div class="klbl">Expenses This Month</div><div class="kval r">${f(exp)}</div></div>
    <div class="kcard"><div class="klbl">Monthly Staff Cost</div><div class="kval">${f(staff)}</div></div>
    <div class="kcard"><div class="klbl">Estimated Net Profit</div><div class="kval ${net>=0?'g':'r'}">${f(net)}</div><div class="ksub">${net>=0?'✅ In the green':'⚠️ Review your costs'}</div></div>`;
}

function renderPnL(){
  const mon=document.getElementById('pMonth')?.value; if(!mon) return;
  const rev=load(K.rev).filter(r=>r.date?.startsWith(mon)).reduce((a,r)=>a+r.total,0);
  const exp=load(K.exp).filter(e=>e.month===mon).reduce((a,e)=>a+e.amt,0);
  const staff=load(K.staff).reduce((a,s)=>a+s.total,0);
  const net=rev-exp-staff;
  const margin=rev>0?((net/rev)*100).toFixed(1):0;
  const k=document.getElementById('pnlKpis');
  if(k) k.innerHTML=`
    <div class="kcard"><div class="klbl">Revenue</div><div class="kval g">${f(rev)}</div></div>
    <div class="kcard"><div class="klbl">Expenses</div><div class="kval r">${f(exp)}</div></div>
    <div class="kcard"><div class="klbl">Staff Costs</div><div class="kval">${f(staff)}</div></div>
    <div class="kcard"><div class="klbl">Net Profit</div><div class="kval ${net>=0?'g':'r'}">${f(net)}</div><div class="ksub">Margin: ${margin}%</div></div>`;
  const pt=document.getElementById('pnlTable');
  if(pt) pt.innerHTML=`<h3>P&L — ${mon}</h3><table class="atable" style="margin-top:16px"><tbody>
    <tr><td>Revenue</td><td class="gn">${f(rev)}</td></tr>
    <tr><td>— Expenses</td><td class="rd">(${f(exp)})</td></tr>
    <tr><td>— Staff Costs</td><td class="rd">(${f(staff)})</td></tr>
    <tr style="border-top:2px solid #eee;font-weight:800"><td>Net Profit / (Loss)</td><td class="${net>=0?'gn':'rd'}">${f(net)}</td></tr>
    <tr><td>Profit Margin</td><td><strong>${margin}%</strong></td></tr>
  </tbody></table>`;
  const costs=load(K.cost);
  const hk=costs.find(c=>c.dish?.toLowerCase().includes('hokkien'));
  const be=document.getElementById('beResult');
  if(be){
    if(hk&&hk.tc>0){
      const cm=7.5-hk.tc,fixed=exp+staff;
      const bowls=Math.ceil(fixed/cm),perDay=Math.ceil(bowls/22);
      be.innerHTML=`${bowls} bowls/month<span>≈ ${perDay} bowls per working day to break even</span>`;
    } else {
      be.textContent='Add Hokkien Mee cost in the Food Costing tab first.';
    }
  }
}

function del(key,id,fn){if(!confirm('Delete this entry?')) return; save(key,load(key).filter(x=>x.id!==id)); fn(); renderDash();}
