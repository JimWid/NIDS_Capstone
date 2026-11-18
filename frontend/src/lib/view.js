export function filterRows(rows,query,field,value){
 const q=query.trim().toLowerCase();
 return rows.filter(row=>(!q||Object.values(row).some(v=>String(v).toLowerCase().includes(q)))&&(!field||value==='all'||row[field]===value));
}
export function formatBytes(value){if(value<1000)return `${value} B`;if(value<1e6)return `${(value/1e3).toFixed(1)} KB`;return `${(value/1e6).toFixed(1)} MB`;}
// Protect spreadsheets from formula execution when exporting untrusted text.
export function toCsv(rows,columns){
 const cell=(value)=>{let text=String(value??'');if(/^[=+@\-\t\r\n]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"'};
 return [columns.map(c=>cell(c.label)).join(','),...rows.map(r=>columns.map(c=>cell(r[c.key])).join(','))].join('\r\n');
}
