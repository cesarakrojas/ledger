import{j as e,b as M,q as w,s as Y,t as U,v as W,w as q,x as X,c as C,d as A,r as g,e as z,p as k}from"./index-CD6owFN-.js";import{L as J,C as K,T as Q,u as Z,v as ee,S as se,w as P,n as ae,o as te,E as B,F as b,c as y,d as G,x as V,a as le,D as ne,h as oe,i as re,j as ce,k as de,g as ie,e as xe}from"./styles-CB0P9xDY.js";import{b as _,f as h,a as $}from"./formatters-DWUGc6Uu.js";import{g as L,h as F,S as me,E as H,e as he,f as ue,k as pe}from"./index-CBIxuy-n.js";import{D}from"./DetailRow-D8yzI8xM.js";const ge=({transaction:s,currencyCode:r,onClick:d})=>{const c=s.type==="inflow",n=s.description;return e.jsxs("li",{onClick:d,className:J,children:[e.jsxs("div",{className:"flex items-center gap-4 flex-1 min-w-0 pr-4",children:[e.jsx("div",{className:`p-3 rounded-xl shrink-0 ${c?"bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400":"bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"}`,children:c?e.jsx(L,{className:"w-6 h-6"}):e.jsx(F,{className:"w-6 h-6"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"font-semibold text-slate-800 dark:text-slate-100 truncate",children:n}),e.jsxs("div",{className:"flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400",children:[e.jsx("span",{className:"whitespace-nowrap",children:_(s.timestamp)}),s.category&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"•"}),e.jsx("span",{className:"italic truncate text-slate-400 dark:text-slate-500",children:s.category})]})]})]})]}),e.jsxs("div",{className:`shrink-0 font-bold text-lg whitespace-nowrap text-right ${c?"text-emerald-600 dark:text-emerald-400":"text-red-600 dark:text-red-400"}`,children:[e.jsx("span",{children:c?"+":"-"}),e.jsx("span",{className:"ml-1",children:h(s.amount,r)})]})]})},fe=({message:s,buttonLabel:r,onBack:d})=>e.jsx("div",{className:"w-full h-full flex items-center justify-center",children:e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xl text-slate-600 dark:text-slate-400",children:s}),e.jsx("button",{onClick:d,className:le+" mt-4",children:r})]})}),Ce=s=>{const r=M(),d=w(Y),c=w(U),n=w(W),m=w(q),u=w(X),i=C(o=>o.currencyCode),t=s.transactions??d,f=s.currencyCode??i,l=s.totalInflows??c,T=s.totalOutflows??n,p=s.inflowCount??m,v=s.outflowCount??u,j=o=>{s.onTransactionClick?s.onTransactionClick(o):r(k.transactionDetail(o))},E=()=>{s.onNewInflow?s.onNewInflow():r(k.newInflow())},N=()=>{s.onNewExpense?s.onNewExpense():r(k.newExpense())};return e.jsx("div",{className:"w-full space-y-6",children:e.jsxs("div",{className:K,children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",children:[e.jsxs("div",{className:"flex w-full sm:w-auto justify-between items-center sm:gap-8",children:[e.jsxs("div",{children:[e.jsx("h2",{className:Q,children:"Transacciones"}),e.jsxs("p",{className:"text-slate-500 dark:text-slate-400 mt-1",children:[e.jsx("span",{className:"bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded mr-2",children:"HOY"}),new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"}).replace(/^\w/,o=>o.toUpperCase())]})]}),e.jsx("button",{className:"p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800",children:e.jsx(me,{className:"w-6 h-6"})})]}),e.jsxs("div",{className:"w-full sm:w-auto grid grid-cols-2 gap-2",children:[e.jsxs("button",{onClick:E,className:Z,children:[e.jsx(L,{className:"w-5 h-5"})," Ingreso"]}),e.jsxs("button",{onClick:N,className:ee,children:[e.jsx(F,{className:"w-5 h-5"})," Gasto"]})]})]}),e.jsxs("div",{className:"mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-center",children:[e.jsxs("div",{className:se,children:[e.jsx("p",{className:"text-sm font-medium text-emerald-700 dark:text-emerald-400",children:"Total Ingresos"}),e.jsx("p",{className:`${P} text-emerald-700 dark:text-emerald-300`,children:h(l,f)}),e.jsxs("p",{className:"text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1",children:[p," transacción",p!==1?"es":""]})]}),e.jsxs("div",{className:ae,children:[e.jsx("p",{className:"text-sm font-medium text-red-700 dark:text-red-300",children:"Total Gastos"}),e.jsx("p",{className:`${P} text-red-700 dark:text-red-300`,children:h(T,f)}),e.jsxs("p",{className:"text-xs text-red-600/70 dark:text-red-400/70 mt-1",children:[v," transacción",v!==1?"es":""]})]})]}),e.jsx("div",{className:te}),e.jsx("div",{children:t.length===0?e.jsx("div",{className:"text-center py-10 text-slate-500 dark:text-slate-400",children:e.jsx("p",{children:"No hay transacciones de hoy."})}):e.jsx("ul",{className:"divide-y divide-slate-200 dark:divide-slate-700 -mx-2",children:t.map(o=>e.jsx(ge,{transaction:o,currencyCode:f,onClick:()=>j(o.id)},o.id))})})]})})},Te=s=>{const r=M(),d=w(a=>a.addTransaction),c=C(a=>a.categoryConfig),n=C(a=>a.currencyCode),m=C(a=>a.paymentMethods),u=A(a=>a.showSuccessModal),i=s.categoryConfig??c,t=s.currencyCode??n,f=s.paymentMethods??m,[l,T]=g.useState(""),[p,v]=g.useState(""),[j,E]=g.useState(""),[N,o]=g.useState(""),[S,I]=g.useState(null),O=async a=>{a.preventDefault(),I(null);const x=parseFloat(p);if(!x||x<=0){I("Ingresa un monto válido.");return}const R=l.trim()||"Ingreso";s.onAddTransaction?s.onAddTransaction({description:R,amount:x,type:"inflow",category:j||void 0,paymentMethod:N||void 0}):d("inflow",R,x,j||void 0,N||void 0),T(""),v(""),E(""),o(""),s.onSuccess?s.onSuccess("¡Ingreso Registrado!",`Ingreso de ${h(x,t)} registrado`):u("¡Ingreso Registrado!",`Ingreso de ${h(x,t)} registrado`),s.onClose?s.onClose():r(k.home())};return e.jsxs("form",{onSubmit:O,className:"flex flex-col h-full",children:[e.jsxs("div",{className:"flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container",children:[S&&e.jsxs("div",{className:B,children:[e.jsx(H,{className:"w-5 h-5 flex-shrink-0"}),S]}),e.jsxs("div",{children:[e.jsx("label",{className:b,children:"Descripción"}),e.jsx("input",{type:"text",value:l,onChange:a=>T(a.target.value),placeholder:"Ej: Servicio de consultoría",className:y})]}),e.jsxs("div",{children:[e.jsxs("label",{className:b,children:["Monto ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"number",value:p,onChange:a=>v(a.target.value),placeholder:"0.00",min:"0.01",step:"0.01",required:!0,className:y})]}),i.enabled&&i.inflowCategories.length>0&&e.jsxs("div",{children:[e.jsx("label",{className:b,children:"Categoría"}),e.jsxs("select",{value:j,onChange:a=>E(a.target.value),className:y,children:[e.jsx("option",{value:"",children:"Seleccionar categoría..."}),i.inflowCategories.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:b,children:"Método de Pago"}),e.jsxs("select",{value:N,onChange:a=>o(a.target.value),className:y,children:[e.jsx("option",{value:"",children:"Seleccionar método"}),f.map(a=>e.jsx("option",{value:a,children:a},a))]})]})]}),e.jsxs("div",{className:G,children:[e.jsx("div",{className:"px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-4",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-semibold text-slate-700 dark:text-slate-300",children:"Total:"}),e.jsx("span",{className:"text-2xl font-bold text-emerald-600 dark:text-emerald-400",children:h(parseFloat(p||"0"),t)})]})}),e.jsx("button",{type:"submit",className:V,children:"Registrar Ingreso"})]})]})},Ee=s=>{const r=M(),d=w(a=>a.addTransaction),c=C(a=>a.categoryConfig),n=C(a=>a.currencyCode),m=C(a=>a.paymentMethods),u=A(a=>a.showSuccessModal),i=s.categoryConfig??c,t=s.currencyCode??n,f=s.paymentMethods??m,[l,T]=g.useState(""),[p,v]=g.useState(""),[j,E]=g.useState(""),[N,o]=g.useState(""),[S,I]=g.useState(null),O=async a=>{a.preventDefault(),I(null);const x=parseFloat(N);if(!l.trim()){I("Ingresa una descripción para el gasto.");return}if(!x||x<=0){I("Ingresa un monto válido.");return}const R=l.trim();s.onAddTransaction?s.onAddTransaction({description:R,amount:x,type:"outflow",category:p||void 0,paymentMethod:j||void 0}):d("outflow",R,x,p||void 0,j||void 0),T(""),o(""),v(""),E(""),s.onSuccess?s.onSuccess("¡Gasto Registrado!",`Gasto de ${h(x,t)} registrado`):u("¡Gasto Registrado!",`Gasto de ${h(x,t)} registrado`),s.onClose?s.onClose():r(k.home())};return e.jsxs("form",{onSubmit:O,className:"flex flex-col h-full",children:[e.jsxs("div",{className:"flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container",children:[S&&e.jsxs("div",{className:B,children:[e.jsx(H,{className:"w-5 h-5 flex-shrink-0"}),S]}),e.jsxs("div",{children:[e.jsxs("label",{className:b,children:["Descripción ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"text",value:l,onChange:a=>T(a.target.value),placeholder:"Ej: Pago de servicios",required:!0,className:y})]}),e.jsxs("div",{children:[e.jsxs("label",{className:b,children:["Monto ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"number",value:N,onChange:a=>o(a.target.value),placeholder:"0.00",min:"0.01",step:"0.01",required:!0,className:y})]}),i.enabled&&i.outflowCategories.length>0&&e.jsxs("div",{children:[e.jsx("label",{className:b,children:"Categoría"}),e.jsxs("select",{value:p,onChange:a=>v(a.target.value),className:y,children:[e.jsx("option",{value:"",children:"Seleccionar categoría..."}),i.outflowCategories.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:b,children:"Método de Pago"}),e.jsxs("select",{value:j,onChange:a=>E(a.target.value),className:y,children:[e.jsx("option",{value:"",children:"Seleccionar método"}),f.map(a=>e.jsx("option",{value:a,children:a},a))]})]})]}),e.jsxs("div",{className:G,children:[e.jsx("div",{className:"px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-semibold text-slate-700 dark:text-slate-300",children:"Total:"}),e.jsx("span",{className:"text-2xl font-bold text-red-600 dark:text-red-400",children:h(parseFloat(N||"0"),t)})]})}),e.jsx("button",{type:"submit",className:V,children:"Registrar Gasto"})]})]})},je=({transaction:s,onClose:r,onEdit:d,currencyCode:c})=>{const n=s.type==="inflow",m=()=>{const u=s.type==="inflow"?"INGRESO":"GASTO",i=`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Recibo - ${s.description}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              max-width: 300px;
              margin: 20px auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            .row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
            }
            .label {
              font-weight: bold;
            }
            .amount {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin: 20px 0;
              padding: 15px;
              border: 2px solid #000;
            }
            .footer {
              text-align: center;
              border-top: 2px dashed #000;
              padding-top: 10px;
              margin-top: 15px;
              font-size: 12px;
            }
            .type-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-weight: bold;
              ${s.type==="inflow"?"background-color: #d1fae5; color: #065f46;":"background-color: #fee2e2; color: #991b1b;"}
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RECIBO DE ${u}</h2>
            <p>ID: ${s.id}</p>
          </div>

          <div class="row">
            <span class="label">Tipo:</span>
            <span class="type-badge">${s.type==="inflow"?"Ingreso":"Gasto"}</span>
          </div>

          <div class="row">
            <span class="label">Fecha:</span>
            <span>${$(s.timestamp)}</span>
          </div>

          <div class="row">
            <span class="label">Hora:</span>
            <span>${_(s.timestamp)}</span>
          </div>

          <div class="row">
            <span class="label">Descripción:</span>
            <span>${s.description}</span>
          </div>

          ${s.category?`
                <div class="row">
                  <span class="label">Categoría:</span>
                  <span>${s.category}</span>
                </div>
              `:""}

          ${s.paymentMethod?`
                <div class="row">
                  <span class="label">Método de Pago:</span>
                  <span>${s.paymentMethod}</span>
                </div>
              `:""}

          <div class="amount">
            TOTAL: ${h(s.amount,c)}
          </div>

          <div class="footer">
            <p>Generado el ${$(new Date().toISOString())}</p>
            <p>a las ${_(new Date().toISOString())}</p>
          </div>
        </body>
      </html>
    `,t=window.open("","_blank");t&&(t.document.write(i),t.document.close(),t.focus(),t.onload=()=>{t.print()})};return e.jsxs("div",{className:ne,children:[e.jsx("div",{className:oe,children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("button",{onClick:r,"aria-label":"Volver",className:re,children:e.jsx(he,{className:"w-5 h-5"})}),e.jsx("h2",{className:ce,children:"Detalles"})]})}),e.jsxs("div",{className:"flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container",children:[e.jsxs("div",{className:"bg-white dark:bg-slate-800 pb-8 pt-8 px-6 text-center shadow-sm",children:[e.jsxs("div",{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${n?"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400":"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`,children:[n?e.jsx(L,{className:"w-4 h-4"}):e.jsx(F,{className:"w-4 h-4"}),n?"Ingreso Confirmado":"Gasto Registrado"]}),e.jsxs("h1",{className:"text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white",children:[n?"+":"-",h(s.amount,c)]}),e.jsxs("p",{className:"text-slate-500 dark:text-slate-400 mt-2 text-sm",children:[$(s.timestamp)," • ",_(s.timestamp)]})]}),e.jsxs("div",{className:"mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4",children:[e.jsx(D,{label:"Descripción",value:s.description}),s.category&&e.jsx(D,{label:"Categoría",value:s.category}),s.paymentMethod&&e.jsx(D,{label:"Método de Pago",value:s.paymentMethod}),e.jsx(D,{label:"ID Referencia",value:s.id,monospace:!0})]}),e.jsx("div",{className:"h-6"})]}),e.jsx("div",{className:de,children:e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:d,className:ie,children:[e.jsx(ue,{className:"w-5 h-5"}),e.jsx("span",{children:"Editar"})]}),e.jsxs("button",{onClick:m,className:xe,children:[e.jsx(pe,{className:"w-5 h-5"}),e.jsx("span",{children:"Recibo"})]})]})})]})},Ie=s=>{const r=M(),d=w(l=>l.transactions),c=C(l=>l.currencyCode),n=A(l=>l.setHideAppShell),m=A(l=>l.setHideBottomNav);z.useEffect(()=>(n(!0),m(!0),()=>{n(!1),m(!1)}),[n,m]);const u=s.transaction??(s.transactionId?d.find(l=>l.id===s.transactionId):void 0),i=s.currencyCode??c,t=()=>{s.onClose?s.onClose():r(k.home())};if(!u)return e.jsx(fe,{message:"Transacción no encontrada",buttonLabel:"Volver al Inicio",onBack:t});const f=()=>{alert("La función de editar estará disponible próximamente")};return e.jsx("div",{className:"w-full h-full animate-fade-in",children:e.jsx(je,{transaction:u,onClose:t,onEdit:f,currencyCode:i})})};export{Ce as H,Te as N,Ie as T,Ee as a,fe as b};
