'use client'
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function WalletPicker({ open, list, onSelect, onClose }) {
  const [el, setEl] = useState(null);
  useEffect(() => {
    const node = document.createElement("div");
    document.body.appendChild(node);
    setEl(node);
    return () => document.body.removeChild(node);
  }, []);
  if (!open || !el) return null;

  return createPortal(
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.5)",
      display:"grid", placeItems:"center", padding:16, zIndex:9999
    }} onClick={onClose}>
      <div
        onClick={(e)=>e.stopPropagation()}
        style={{
          background:"var(--card,#fff)", color:"inherit", borderRadius:16,
          width:"100%", maxWidth:420, padding:16, boxShadow:"0 10px 30px rgba(0,0,0,.35)"
        }}
      >
        <h3 style={{margin:"0 0 8px", fontSize:18}}>Choose a wallet</h3>
        <p style={{margin:"0 0 12px", opacity:.7, fontSize:13}}>
          Injected wallets (desktop extensions). If none fits, use WalletConnect.
        </p>

        <div style={{display:"grid", gap:8}}>
          {list.map(({ info, provider }) => (
            <button key={info.uuid}
              onClick={()=>onSelect(provider)}
              style={{
                display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                borderRadius:12, border:"1px solid var(--ring, rgba(0,0,0,.08))",
                background:"var(--card,#fff)", cursor:"pointer"
              }}
            >
              <img
                src={info.icon}
                alt=""
                width={18} height={18}
                style={{display:"block", borderRadius:4}}
              />
              <span style={{fontWeight:600}}>{info.name}</span>
              <span style={{marginLeft:"auto", opacity:.6, fontSize:12}}>{info.rdns}</span>
            </button>
          ))}
        </div>

        <div style={{display:"flex", gap:8, marginTop:12}}>
          <button
            onClick={()=>onSelect(null)} // => fallback WalletConnect
            style={{
              flex:1, padding:"10px 12px", borderRadius:12,
              border:"0", background:"var(--btn-bg,#0b0b0b)", color:"var(--btn-fg,#fff)",
              cursor:"pointer", fontWeight:700
            }}
          >
            Use WalletConnect
          </button>
          <button
            onClick={onClose}
            style={{padding:"10px 12px", borderRadius:12, border:"1px solid var(--ring, rgba(0,0,0,.08))", background:"transparent", cursor:"pointer"}}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    el
  );
}
