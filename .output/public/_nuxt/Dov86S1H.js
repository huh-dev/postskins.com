function o(e,t="USD"){const r=(e??0)/100;try{return new Intl.NumberFormat(void 0,{style:"currency",currency:t}).format(r)}catch{return`${r.toFixed(2)} ${t}`}}export{o as f};
