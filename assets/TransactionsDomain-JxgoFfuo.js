import{j as e,b as A,k as v,s as Y,l as U,m as W,n as X,o as q,c as y,d as P,r as u,p as k}from"./index-Bh3Pq5fI.js";import{L as z,C as J,T as K,t as Q,u as Z,S as ee,v as F,m as se,n as ae,E as B,F as w,b,c as G,w as V,B as te,D as le,g as ne,h as oe,i as re,j as ce,f as de,d as ie}from"./styles-QfzEYZlC.js";import{b as _,f as x,a as O}from"./formatters-BwYXHfTr.js";import{g as $,h as L,S as xe,E as H,e as me,f as he,k as ue}from"./index-DI_LCI5M.js";import{D as R}from"./DetailRow-Dl1o5bfI.js";const pe=({transaction:s,currencyCode:o,onClick:c})=>{const r=s.type==="inflow",l=s.description;return e.jsxs("li",{onClick:c,className:z,children:[e.jsxs("div",{className:"flex items-center gap-4 flex-1 min-w-0 pr-4",children:[e.jsx("div",{className:`p-3 rounded-xl shrink-0 ${r?"bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400":"bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"}`,children:r?e.jsx($,{className:"w-6 h-6"}):e.jsx(L,{className:"w-6 h-6"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"font-semibold text-slate-800 dark:text-slate-100 truncate",children:l}),e.jsxs("div",{className:"flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400",children:[e.jsx("span",{className:"whitespace-nowrap",children:_(s.timestamp)}),s.category&&e.jsxs(e.Fragment,{children:[e.jsx("span",{children:"•"}),e.jsx("span",{className:"italic truncate text-slate-400 dark:text-slate-500",children:s.category})]})]})]})]}),e.jsxs("div",{className:`shrink-0 font-bold text-lg whitespace-nowrap text-right ${r?"text-emerald-600 dark:text-emerald-400":"text-red-600 dark:text-red-400"}`,children:[e.jsx("span",{children:r?"+":"-"}),e.jsx("span",{className:"ml-1",children:x(s.amount,o)})]})]})},ge=({message:s,buttonLabel:o,onBack:c})=>e.jsx("div",{className:"w-full h-full flex items-center justify-center",children:e.jsxs("div",{className:"text-center",children:[e.jsx("p",{className:"text-xl text-slate-600 dark:text-slate-400",children:s}),e.jsx("button",{onClick:c,className:te+" mt-4",children:o})]})}),ye=s=>{const o=A(),c=v(Y),r=v(U),l=v(W),p=v(X),m=v(q),d=y(n=>n.currencyCode),t=s.transactions??c,C=s.currencyCode??d,j=s.totalInflows??r,T=s.totalOutflows??l,h=s.inflowCount??p,N=s.outflowCount??m,g=n=>{s.onTransactionClick?s.onTransactionClick(n):o(k.transactionDetail(n))},E=()=>{s.onNewInflow?s.onNewInflow():o(k.newInflow())},f=()=>{s.onNewExpense?s.onNewExpense():o(k.newExpense())};return e.jsx("div",{className:"w-full space-y-6",children:e.jsxs("div",{className:J,children:[e.jsxs("div",{className:"flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4",children:[e.jsxs("div",{className:"flex w-full sm:w-auto justify-between items-center sm:gap-8",children:[e.jsxs("div",{children:[e.jsx("h2",{className:K,children:"Transacciones"}),e.jsxs("p",{className:"text-slate-500 dark:text-slate-400 mt-1",children:[e.jsx("span",{className:"bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded mr-2",children:"HOY"}),new Date().toLocaleDateString("es-ES",{weekday:"long",day:"numeric",month:"long"}).replace(/^\w/,n=>n.toUpperCase())]})]}),e.jsx("button",{className:"p-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800",children:e.jsx(xe,{className:"w-6 h-6"})})]}),e.jsxs("div",{className:"w-full sm:w-auto grid grid-cols-2 gap-2",children:[e.jsxs("button",{onClick:E,className:Q,children:[e.jsx($,{className:"w-5 h-5"})," Ingreso"]}),e.jsxs("button",{onClick:f,className:Z,children:[e.jsx(L,{className:"w-5 h-5"})," Gasto"]})]})]}),e.jsxs("div",{className:"mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-center",children:[e.jsxs("div",{className:ee,children:[e.jsx("p",{className:"text-sm font-medium text-emerald-700 dark:text-emerald-400",children:"Total Ingresos"}),e.jsx("p",{className:`${F} text-emerald-700 dark:text-emerald-300`,children:x(j,C)}),e.jsxs("p",{className:"text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-1",children:[h," transacción",h!==1?"es":""]})]}),e.jsxs("div",{className:se,children:[e.jsx("p",{className:"text-sm font-medium text-red-700 dark:text-red-300",children:"Total Gastos"}),e.jsx("p",{className:`${F} text-red-700 dark:text-red-300`,children:x(T,C)}),e.jsxs("p",{className:"text-xs text-red-600/70 dark:text-red-400/70 mt-1",children:[N," transacción",N!==1?"es":""]})]})]}),e.jsx("div",{className:ae}),e.jsx("div",{children:t.length===0?e.jsx("div",{className:"text-center py-10 text-slate-500 dark:text-slate-400",children:e.jsx("p",{children:"No hay transacciones de hoy."})}):e.jsx("ul",{className:"divide-y divide-slate-200 dark:divide-slate-700 -mx-2",children:t.map(n=>e.jsx(pe,{transaction:n,currencyCode:C,onClick:()=>g(n.id)},n.id))})})]})})},Ce=s=>{const o=A(),c=v(a=>a.addTransaction),r=y(a=>a.categoryConfig),l=y(a=>a.currencyCode),p=y(a=>a.paymentMethods),m=P(a=>a.showSuccessModal),d=s.categoryConfig??r,t=s.currencyCode??l,C=s.paymentMethods??p,[j,T]=u.useState(""),[h,N]=u.useState(""),[g,E]=u.useState(""),[f,n]=u.useState(""),[S,I]=u.useState(null),M=async a=>{a.preventDefault(),I(null);const i=parseFloat(h);if(!i||i<=0){I("Ingresa un monto válido.");return}const D=j.trim()||"Ingreso";s.onAddTransaction?s.onAddTransaction({description:D,amount:i,type:"inflow",category:g||void 0,paymentMethod:f||void 0}):c("inflow",D,i,g||void 0,f||void 0),T(""),N(""),E(""),n(""),s.onSuccess?s.onSuccess("¡Ingreso Registrado!",`Ingreso de ${x(i,t)} registrado`):m("¡Ingreso Registrado!",`Ingreso de ${x(i,t)} registrado`),s.onClose?s.onClose():o(k.home())};return e.jsxs("form",{onSubmit:M,className:"flex flex-col h-full",children:[e.jsxs("div",{className:"flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container",children:[S&&e.jsxs("div",{className:B,children:[e.jsx(H,{className:"w-5 h-5 flex-shrink-0"}),S]}),e.jsxs("div",{children:[e.jsx("label",{className:w,children:"Descripción"}),e.jsx("input",{type:"text",value:j,onChange:a=>T(a.target.value),placeholder:"Ej: Servicio de consultoría",className:b})]}),e.jsxs("div",{children:[e.jsxs("label",{className:w,children:["Monto ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"number",value:h,onChange:a=>N(a.target.value),placeholder:"0.00",min:"0.01",step:"0.01",required:!0,className:b})]}),d.enabled&&d.inflowCategories.length>0&&e.jsxs("div",{children:[e.jsx("label",{className:w,children:"Categoría"}),e.jsxs("select",{value:g,onChange:a=>E(a.target.value),className:b,children:[e.jsx("option",{value:"",children:"Seleccionar categoría..."}),d.inflowCategories.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:w,children:"Método de Pago"}),e.jsxs("select",{value:f,onChange:a=>n(a.target.value),className:b,children:[e.jsx("option",{value:"",children:"Seleccionar método"}),C.map(a=>e.jsx("option",{value:a,children:a},a))]})]})]}),e.jsxs("div",{className:G,children:[e.jsx("div",{className:"px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-4",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-semibold text-slate-700 dark:text-slate-300",children:"Total:"}),e.jsx("span",{className:"text-2xl font-bold text-emerald-600 dark:text-emerald-400",children:x(parseFloat(h||"0"),t)})]})}),e.jsx("button",{type:"submit",className:V,children:"Registrar Ingreso"})]})]})},Te=s=>{const o=A(),c=v(a=>a.addTransaction),r=y(a=>a.categoryConfig),l=y(a=>a.currencyCode),p=y(a=>a.paymentMethods),m=P(a=>a.showSuccessModal),d=s.categoryConfig??r,t=s.currencyCode??l,C=s.paymentMethods??p,[j,T]=u.useState(""),[h,N]=u.useState(""),[g,E]=u.useState(""),[f,n]=u.useState(""),[S,I]=u.useState(null),M=async a=>{a.preventDefault(),I(null);const i=parseFloat(f);if(!j.trim()){I("Ingresa una descripción para el gasto.");return}if(!i||i<=0){I("Ingresa un monto válido.");return}const D=j.trim();s.onAddTransaction?s.onAddTransaction({description:D,amount:i,type:"outflow",category:h||void 0,paymentMethod:g||void 0}):c("outflow",D,i,h||void 0,g||void 0),T(""),n(""),N(""),E(""),s.onSuccess?s.onSuccess("¡Gasto Registrado!",`Gasto de ${x(i,t)} registrado`):m("¡Gasto Registrado!",`Gasto de ${x(i,t)} registrado`),s.onClose?s.onClose():o(k.home())};return e.jsxs("form",{onSubmit:M,className:"flex flex-col h-full",children:[e.jsxs("div",{className:"flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-container",children:[S&&e.jsxs("div",{className:B,children:[e.jsx(H,{className:"w-5 h-5 flex-shrink-0"}),S]}),e.jsxs("div",{children:[e.jsxs("label",{className:w,children:["Descripción ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"text",value:j,onChange:a=>T(a.target.value),placeholder:"Ej: Pago de servicios",required:!0,className:b})]}),e.jsxs("div",{children:[e.jsxs("label",{className:w,children:["Monto ",e.jsx("span",{className:"text-red-500",children:"*"})]}),e.jsx("input",{type:"number",value:f,onChange:a=>n(a.target.value),placeholder:"0.00",min:"0.01",step:"0.01",required:!0,className:b})]}),d.enabled&&d.outflowCategories.length>0&&e.jsxs("div",{children:[e.jsx("label",{className:w,children:"Categoría"}),e.jsxs("select",{value:h,onChange:a=>N(a.target.value),className:b,children:[e.jsx("option",{value:"",children:"Seleccionar categoría..."}),d.outflowCategories.map(a=>e.jsx("option",{value:a,children:a},a))]})]}),e.jsxs("div",{children:[e.jsx("label",{className:w,children:"Método de Pago"}),e.jsxs("select",{value:g,onChange:a=>E(a.target.value),className:b,children:[e.jsx("option",{value:"",children:"Seleccionar método"}),C.map(a=>e.jsx("option",{value:a,children:a},a))]})]})]}),e.jsxs("div",{className:G,children:[e.jsx("div",{className:"px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded-xl mb-4",children:e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-base font-semibold text-slate-700 dark:text-slate-300",children:"Total:"}),e.jsx("span",{className:"text-2xl font-bold text-red-600 dark:text-red-400",children:x(parseFloat(f||"0"),t)})]})}),e.jsx("button",{type:"submit",className:V,children:"Registrar Gasto"})]})]})},fe=({transaction:s,onClose:o,onEdit:c,currencyCode:r})=>{const l=s.type==="inflow",p=()=>{const m=s.type==="inflow"?"INGRESO":"GASTO",d=`
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
            <h2>RECIBO DE ${m}</h2>
            <p>ID: ${s.id}</p>
          </div>

          <div class="row">
            <span class="label">Tipo:</span>
            <span class="type-badge">${s.type==="inflow"?"Ingreso":"Gasto"}</span>
          </div>

          <div class="row">
            <span class="label">Fecha:</span>
            <span>${O(s.timestamp)}</span>
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
            TOTAL: ${x(s.amount,r)}
          </div>

          <div class="footer">
            <p>Generado el ${O(new Date().toISOString())}</p>
            <p>a las ${_(new Date().toISOString())}</p>
          </div>
        </body>
      </html>
    `,t=window.open("","_blank");t&&(t.document.write(d),t.document.close(),t.focus(),t.onload=()=>{t.print()})};return e.jsxs("div",{className:le,children:[e.jsx("div",{className:ne,children:e.jsxs("div",{className:"flex items-center",children:[e.jsx("button",{onClick:o,"aria-label":"Volver",className:oe,children:e.jsx(me,{className:"w-5 h-5"})}),e.jsx("h2",{className:re,children:"Detalles"})]})}),e.jsxs("div",{className:"flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-container",children:[e.jsxs("div",{className:"bg-white dark:bg-slate-800 pb-8 pt-8 px-6 text-center shadow-sm",children:[e.jsxs("div",{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-3 ${l?"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400":"bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`,children:[l?e.jsx($,{className:"w-4 h-4"}):e.jsx(L,{className:"w-4 h-4"}),l?"Ingreso Confirmado":"Gasto Registrado"]}),e.jsxs("h1",{className:"text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white",children:[l?"+":"-",x(s.amount,r)]}),e.jsxs("p",{className:"text-slate-500 dark:text-slate-400 mt-2 text-sm",children:[O(s.timestamp)," • ",_(s.timestamp)]})]}),e.jsxs("div",{className:"mt-4 bg-white dark:bg-slate-800 border-y border-slate-200 dark:border-slate-700 px-4",children:[e.jsx(R,{label:"Descripción",value:s.description}),s.category&&e.jsx(R,{label:"Categoría",value:s.category}),s.paymentMethod&&e.jsx(R,{label:"Método de Pago",value:s.paymentMethod}),e.jsx(R,{label:"ID Referencia",value:s.id,monospace:!0})]}),e.jsx("div",{className:"h-6"})]}),e.jsx("div",{className:ce,children:e.jsxs("div",{className:"grid grid-cols-2 gap-3",children:[e.jsxs("button",{onClick:c,className:de,children:[e.jsx(he,{className:"w-5 h-5"}),e.jsx("span",{children:"Editar"})]}),e.jsxs("button",{onClick:p,className:ie,children:[e.jsx(ue,{className:"w-5 h-5"}),e.jsx("span",{children:"Recibo"})]})]})})]})},Ee=s=>{const o=A(),c=v(t=>t.transactions),r=y(t=>t.currencyCode),l=s.transaction??(s.transactionId?c.find(t=>t.id===s.transactionId):void 0),p=s.currencyCode??r,m=()=>{s.onClose?s.onClose():o(k.home())};if(!l)return e.jsx(ge,{message:"Transacción no encontrada",buttonLabel:"Volver al Inicio",onBack:m});const d=()=>{alert("La función de editar estará disponible próximamente")};return e.jsx("div",{className:"w-full h-full mx-auto animate-fade-in animate-slide-in-right flex items-stretch",children:e.jsx(fe,{transaction:l,onClose:m,onEdit:d,currencyCode:p})})};export{ye as H,Ce as N,Ee as T,Te as a,ge as b};
