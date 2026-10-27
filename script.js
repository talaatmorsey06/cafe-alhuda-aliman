(function(){
var mem={};
function ld(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return k in mem?mem[k]:d}}
function sv(k,v){mem[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function $(i){return document.getElementById(i)}
function hash(s){var h=5381;for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return String(h)}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function money(n){return (Math.round(n*100)/100).toLocaleString("ar-EG")+" ج.م"}
function say(id,t,ok){var e=$(id);e.textContent=t;e.className="msg "+(ok?"o":"e")}

var users=ld("cf_users",null);
if(!users){users=[{u:"admin",n:"المدير",role:"manager",p:hash("admin123"),q:"ما اسم مدينتك؟",a:hash("القاهرة")}];sv("cf_users",users)}
var menu=ld("cf_menu",null);
if(!menu){menu=[{id:1,n:"شاي",c:"مشروبات ساخنة",p:10},{id:2,n:"قهوة تركي",c:"مشروبات ساخنة",p:20},{id:3,n:"نسكافيه",c:"مشروبات ساخنة",p:25},{id:4,n:"عصير ليمون",c:"مشروبات باردة",p:25},{id:5,n:"آيس كوفي",c:"مشروبات باردة",p:40},{id:6,n:"كيك",c:"حلويات",p:35},{id:7,n:"ساندوتش جبنة",c:"وجبات خفيفة",p:30}];sv("cf_menu",menu)}
var orders=ld("cf_orders",[]);
var cur=null;
var drawer=ld("cf_drawer",[]);var dopen=false;
function roleOf(r){return r.role||(r.u==="admin"?"manager":"employee")}
function isMgr(){return !!cur&&roleOf(cur)==="manager"}

function show(id){["login","signup","reset","app"].forEach(function(x){$(x).classList.toggle("hide",x!==id)});
  ["lm","sm","rm"].forEach(function(m){say(m,"")})}
document.querySelectorAll("[data-go]").forEach(function(a){a.onclick=function(){show(a.dataset.go);if(a.dataset.go==="reset")resetFlow(0)}});

/* Login */
$("lbtn").onclick=function(){
  var u=$("lu").value.trim(),p=$("lp").value;
  var x=users.find(function(r){return r.u===u&&r.p===hash(p)});
  if(!x)return say("lm","اسم المستخدم أو كلمة المرور غير صحيحة");
  cur=x;$("lp").value="";enter();
};
$("lp").onkeydown=function(e){if(e.key==="Enter")$("lbtn").click()};

/* Signup */
$("sbtn").onclick=function(){
  var n=$("sn").value.trim(),u=$("su").value.trim(),p=$("sp").value,a=$("sa").value.trim();
  if(!n||!u||!a)return say("sm","يرجى ملء جميع الحقول");
  if(p.length<6)return say("sm","كلمة المرور يجب ألا تقل عن 6 أحرف");
  if(p!==$("sp2").value)return say("sm","كلمتا المرور غير متطابقتين");
  if(users.some(function(r){return r.u===u}))return say("sm","اسم المستخدم مستخدم بالفعل");
  users.push({u:u,n:n,role:"employee",p:hash(p),q:$("sq").value,a:hash(a.toLowerCase())});sv("cf_users",users);
  say("sm","تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن",true);
  ["sn","su","sp","sp2","sa"].forEach(function(i){$(i).value=""});
};

/* Reset */
var rUser=null;
function resetFlow(s){rUser=null;$("rstep2").classList.toggle("hide",s===0);$("rbtn").textContent=s?"تغيير كلمة المرور":"متابعة";$("ru").disabled=!!s;if(!s){$("ru").value="";["ra","rp","rp2"].forEach(function(i){$(i).value=""})}}
$("rbtn").onclick=function(){
  if(!rUser){
    var x=users.find(function(r){return r.u===$("ru").value.trim()});
    if(!x)return say("rm","اسم المستخدم غير موجود");
    rUser=x;$("rq").textContent=x.q;$("rstep2").classList.remove("hide");$("ru").disabled=true;$("rbtn").textContent="تغيير كلمة المرور";say("rm","");return;
  }
  if(rUser.a!==hash($("ra").value.trim().toLowerCase()))return say("rm","إجابة سؤال الأمان غير صحيحة");
  var p=$("rp").value;
  if(p.length<6)return say("rm","كلمة المرور يجب ألا تقل عن 6 أحرف");
  if(p!==$("rp2").value)return say("rm","كلمتا المرور غير متطابقتين");
  rUser.p=hash(p);sv("cf_users",users);
  say("rm","تم تغيير كلمة المرور بنجاح",true);resetFlow(0);$("ru").disabled=false;
};

/* App */
function enter(){
  document.body.classList.toggle("emp",!isMgr());
  $("who").textContent="مرحبًا، "+cur.n+" ("+(isMgr()?"مدير":"موظف")+")";
  show("app");document.querySelector("#tabs button").click();render();
}
$("out").onclick=function(){cur=null;dopen=false;document.body.classList.remove("emp");show("login")};
$("tabs").onclick=function(e){var t=e.target.dataset.t;if(!t)return;
  document.querySelectorAll("#tabs button").forEach(function(b){b.classList.toggle("on",b===e.target)});
  ["dash","menu","orders","drawer","sales","users"].forEach(function(x){$("t-"+x).classList.toggle("hide",x!==t)})};

$("madd").onclick=function(){
  var n=$("mn").value.trim(),p=parseFloat($("mpz").value);
  if(!n||isNaN(p)||p<0)return;
  menu.push({id:Date.now(),n:n,c:$("mc").value,p:p});sv("cf_menu",menu);$("mn").value="";$("mpz").value="";render();
};
$("op").onchange=function(){var v=$("op").value==="visa";$("ocashw").classList.toggle("hide",v);$("ovisaw").classList.toggle("hide",!v)};
function logDrawer(why){drawer.unshift({id:Date.now(),un:cur.u,u:cur.n,r:isMgr()?"مدير":"موظف",why:why,d:new Date().toISOString()});sv("cf_drawer",drawer);dopen=true}
$("dopen").onclick=function(){logDrawer($("dr").value);say("dm","تم تسجيل وإرسال أمر فتح الدرج",true);render()};
$("dclose").onclick=function(){dopen=false;say("dm","");render()};
$("oadd").onclick=function(){
  var it=menu.find(function(m){return String(m.id)===$("oi").value}),q=parseInt($("oq").value,10),t=$("ot").value,pm=$("op").value;
  if(!it||!q||q<1||!t)return say("om","أدخل رقم الطاولة والصنف والكمية");
  var tot=it.p*q,msg="تم تسجيل الطلب";
  var o={id:Date.now(),t:t,i:it.n,q:q,tot:tot,pm:pm,by:cur.n,d:new Date().toISOString()};
  if(pm==="cash"){
    var rc=parseFloat($("orc").value);
    if(!isNaN(rc)){if(rc<tot)return say("om","المبلغ المستلم أقل من الإجمالي");msg+=" — الباقي للعميل: "+money(rc-tot)}
    logDrawer("بيع نقدي");msg+=" — تم فتح الدرج";
  }else{
    var rf=$("orf").value.trim();
    if(/^\d{13,19}$/.test(rf.replace(/\s/g,"")))return say("om","لا تُدخل رقم البطاقة، اكتب رقم إيصال الماكينة فقط");
    o.ref=rf;
  }
  orders.unshift(o);sv("cf_orders",orders);$("orc").value="";$("orf").value="";
  say("om",msg,true);render();
};
document.addEventListener("click",function(e){
  var m=e.target.dataset.dm,o=e.target.dataset.do;
  if(m&&isMgr()){menu=menu.filter(function(x){return String(x.id)!==m});sv("cf_menu",menu);render()}
  if(o&&isMgr()){orders=orders.filter(function(x){return String(x.id)!==o});sv("cf_orders",orders);render()}
});

function render0(){
  var today=new Date().toDateString();
  var td=orders.filter(function(o){return new Date(o.d).toDateString()===today});
  var sum=function(a){return a.reduce(function(s,o){return s+o.tot},0)};
  $("d1").textContent=td.length;$("d2").textContent=money(sum(td));$("d3").textContent=money(sum(orders));$("d4").textContent=menu.length;
  $("mt").innerHTML=menu.map(function(m){return "<tr><td>"+esc(m.n)+"</td><td>"+esc(m.c)+"</td><td>"+money(m.p)+"</td><td>"+(isMgr()?"<button class='x' data-dm='"+m.id+"'>حذف</button>":"")+"</td></tr>"}).join("");
  $("oi").innerHTML=menu.map(function(m){return "<option value='"+m.id+"'>"+esc(m.n)+" — "+money(m.p)+"</option>"}).join("");
  $("ot-b").innerHTML=orders.map(function(o,i){return "<tr><td>"+(orders.length-i)+"</td><td>"+esc(o.t)+"</td><td>"+esc(o.i)+"</td><td>"+o.q+"</td><td>"+money(o.tot)+"</td><td>"+(o.pm==="visa"?"فيزا":"كاش")+"</td><td>"+new Date(o.d).toLocaleString("ar-EG")+"</td><td>"+(isMgr()?"<button class='x' data-do='"+o.id+"'>حذف</button>":"")+"</td></tr>"}).join("");
  $("s1").textContent=orders.length;$("s2").textContent=money(sum(orders));$("s3").textContent=orders.length?money(sum(orders)/orders.length):money(0);
  var by={};orders.forEach(function(o){by[o.i]=by[o.i]||{q:0,t:0};by[o.i].q+=o.q;by[o.i].t+=o.tot});
  $("st").innerHTML=Object.keys(by).map(function(k){return "<tr><td>"+esc(k)+"</td><td>"+by[k].q+"</td><td>"+money(by[k].t)+"</td></tr>"}).join("");
}

document.addEventListener("change",function(e){
  var u=e.target.dataset.ur;if(!u||!isMgr())return;
  var x=users.find(function(r){return r.u===u}),nr=e.target.value;
  if(nr==="employee"&&roleOf(x)==="manager"&&users.filter(function(r){return roleOf(r)==="manager"}).length<2){e.target.value="manager";return}
  x.role=nr;sv("cf_users",users);
  if(x.u===cur.u){cur=x;enter()}else render();
});
function render(){
  render0();
  var today=new Date().toDateString(),mg=isMgr();
  var sum=function(a){return a.reduce(function(s,o){return s+o.tot},0)};
  var cash=orders.filter(function(o){return o.pm!=="visa"}),visa=orders.filter(function(o){return o.pm==="visa"});
  $("s4").textContent=money(sum(cash));$("s5").textContent=money(sum(visa));
  $("dcash").textContent=money(sum(cash.filter(function(o){return new Date(o.d).toDateString()===today})));
  $("dcnt").textContent=drawer.filter(function(x){return new Date(x.d).toDateString()===today}).length;
  $("dstate").textContent=dopen?"🔓 الدرج مفتوح":"🔒 الدرج مغلق";$("dstate").className="drawer"+(dopen?" open":"");
  $("dt").innerHTML=drawer.filter(function(x){return mg||x.un===cur.u}).map(function(x){return "<tr><td>"+new Date(x.d).toLocaleString("ar-EG")+"</td><td>"+esc(x.u)+"</td><td>"+x.r+"</td><td>"+esc(x.why)+"</td></tr>"}).join("");
  $("ut").innerHTML=users.map(function(r){var m=roleOf(r)==="manager";return "<tr><td>"+esc(r.n)+"</td><td>"+esc(r.u)+"</td><td><select data-ur=\""+esc(r.u)+"\"><option value=\"employee\""+(m?"":" selected")+">موظف</option><option value=\"manager\""+(m?" selected":"")+">مدير</option></select></td></tr>"}).join("");
}
})();
