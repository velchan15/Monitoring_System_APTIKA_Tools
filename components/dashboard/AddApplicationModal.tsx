"use client";

import React, { useState, useEffect } from "react";
import { X, Globe, Server, Building2, Loader2, ChevronDown } from "lucide-react";

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddApplicationModal({ isOpen, onClose, onSuccess }: AddApplicationModalProps) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [isCustomOpd, setIsCustomOpd] = useState(false);
  
  const [opdList, setOpdList] = useState<{code: string, name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // State untuk custom dropdown
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setUrl("");
      setDepartmentCode("");
      setIsCustomOpd(false);
      setIsDropdownOpen(false);
      setError("");

      fetch("http://localhost:3001/api/applications")
        .then(res => res.json())
        .then(json => {
          const data = json.data || json;
          if (Array.isArray(data)) {
            const uniqueOpds = new Map();
            data.forEach((app: any) => {
              if (app.department?.code) {
                uniqueOpds.set(app.department.code, app.department.name || app.department.code);
              }
            });
            setOpdList(Array.from(uniqueOpds, ([code, name]) => ({ code, name })));
          }
        })
        .catch(err => console.error("Gagal load daftar OPD:", err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          url,
          status: "ONLINE",
          departmentCode: departmentCode.toLowerCase().replace(/\s+/g, ''),
          isActive: true
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal menambahkan aplikasi");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Mencari label OPD yang sedang dipilih untuk ditampilkan di tombol
  const selectedOpdLabel = isCustomOpd
    ? "+ Tambah OPD Lainnya (Custom)"
    : departmentCode
    ? opdList.find(o => o.code === departmentCode)?.code.toUpperCase() + " - " + opdList.find(o => o.code === departmentCode)?.name
    : "-- Pilih Perangkat Daerah --";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-visible animate-in fade-in zoom-in duration-200">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800">Tambah Website Baru</h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nama Aplikasi / Layanan</label>
            <div className="relative">
              <Server className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Misal: Portal Diskominfo"
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">URL Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://diskominfo.jabarprov.go.id"
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Perangkat Daerah (OPD)</label>
            
            {/* Custom Dropdown */}
            <div className="relative">
              <div 
                className={`flex items-center w-full pl-9 pr-8 py-2 text-sm border rounded-xl cursor-pointer transition bg-white ${isDropdownOpen ? 'border-teal-500 ring-1 ring-teal-500' : 'border-slate-200 hover:border-teal-400'}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Building2 className="absolute left-3 w-4 h-4 text-slate-400" />
                <span className={`block truncate ${!departmentCode && !isCustomOpd ? 'text-slate-500' : 'text-slate-800 font-medium'} ${isCustomOpd ? 'text-teal-600' : ''}`}>
                  {selectedOpdLabel}
                </span>
                <ChevronDown className={`absolute right-3 w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Invisible overlay to detect click outside */}
              {isDropdownOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
              )}

              {/* Dropdown Menu (Fixed Scrollable) */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto py-1 animate-in fade-in slide-in-from-top-1">
                  {opdList.map((opd) => (
                    <button
                      key={opd.code}
                      type="button"
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors truncate"
                      onClick={() => {
                        setDepartmentCode(opd.code);
                        setIsCustomOpd(false);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span className="font-bold">{opd.code.toUpperCase()}</span> - {opd.name}
                    </button>
                  ))}
                  
                  {/* Option Custom */}
                  <div className="h-px bg-slate-100 my-1"></div>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors"
                    onClick={() => {
                      setDepartmentCode("");
                      setIsCustomOpd(true);
                      setIsDropdownOpen(false);
                    }}
                  >
                    + Tambah OPD Lainnya (Custom)
                  </button>
                </div>
              )}
            </div>

            {/* Input Text muncul kalau pilih Custom */}
            {isCustomOpd && (
              <div className="mt-2 relative animate-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  required
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  placeholder="Ketik kode OPD baru (contoh: disdik, bapenda)"
                  className="w-full pl-3 pr-4 py-2 text-sm border border-teal-200 bg-teal-50/30 rounded-xl focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition uppercase"
                />
              </div>
            )}
            
            <p className="text-[10px] text-slate-400 mt-1.5">
              *Aplikasi akan langsung muncul di dashboard ringkasan milik OPD yang dipilih.
            </p>
          </div>

          {/* Footer Tombol */}
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !departmentCode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isLoading ? "Menyimpan..." : "Simpan Aplikasi"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}