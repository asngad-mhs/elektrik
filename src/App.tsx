import React, { useState, useEffect } from 'react';
import {
  Zap,
  LogOut,
  UserCheck,
  FileText,
  ArrowRight,
  FolderOpen,
  XCircle,
  CheckCircle2,
  Loader2,
  Tv,
  Refrigerator,
  WashingMachine,
  Laptop,
  Wrench,
  Plug,
  Cable,
  Bell
} from 'lucide-react';

const ADMIN_WA = "6289670924182";

export default function App() {
  const [currentUser, setCurrentUser] = useState<{name: string, phone: string} | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deviceData, setDeviceData] = useState<{id: number, device: string, watt: number, hours: number}[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState('auth');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);
  
  const [toastMsg, setToastMsg] = useState("");
  const [showToast, setShowToast] = useState(false);
  
  // Forms state
  const [loginForm, setLoginForm] = useState({ name: '', phone: '' });
  const [serviceForm, setServiceForm] = useState({ type: 'Perbaikan', address: '' });
  const [isSubmittingService, setIsSubmittingService] = useState(false);
  const [calcForm, setCalcForm] = useState({ device: '', watt: '', hours: '' });
  
  const [adminLogin, setAdminLogin] = useState({ user: '', pass: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('elektrik_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setActiveTab('service');
    }
    const storedDevices = localStorage.getItem('devices');
    if (storedDevices) {
      setDeviceData(JSON.parse(storedDevices));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('elektrik_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('elektrik_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('devices', JSON.stringify(deviceData));
  }, [deviceData]);

  const displayToast = (msg: string) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUser(loginForm);
    displayToast("Berhasil Masuk!");
    setActiveTab('service');
  };

  const handleLogout = () => {
    if (window.confirm("Keluar dari aplikasi?")) {
      setCurrentUser(null);
      setActiveTab('auth');
      setIsAdmin(false);
      setLoginForm({ name: '', phone: '' });
    }
  };

  const handleAdminTitleClick = () => {
    setAdminClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setAdminModalOpen(true);
        return 0;
      }
      return newCount;
    });
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingService(true);
    
    const req = {
      id: 'TRX-' + Date.now().toString().slice(-4),
      name: currentUser?.name,
      phone: currentUser?.phone,
      type: serviceForm.type,
      address: serviceForm.address,
      status: 'Menunggu Respon Admin'
    };

    setTimeout(() => {
      localStorage.setItem('last_request', JSON.stringify(req));
      displayToast("Pengajuan Tersimpan!");
      setActiveTab('calc');
      setIsSubmittingService(false);
    }, 800);
  };

  const handleCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDeviceData([
      ...deviceData,
      {
        id: Date.now(),
        device: calcForm.device,
        watt: parseInt(calcForm.watt),
        hours: parseInt(calcForm.hours)
      }
    ]);
    setCalcForm({ device: '', watt: '', hours: '' });
  };

  const removeDevice = (id: number) => {
    setDeviceData(deviceData.filter(d => d.id !== id));
  };

  const finishOrder = () => {
    const rawReq = localStorage.getItem('last_request');
    if (!rawReq) {
      alert("Silahkan isi pengajuan layanan terlebih dahulu!");
      setActiveTab('service');
      return;
    }
    const req = JSON.parse(rawReq);
    const totalCost = `Rp ${(totalKwh * 1500).toLocaleString('id-ID')}`;
    
    const msg = `*HALO ADMIN ELEKTRIK*\n` +
                `--------------------------\n` +
                `*ID Order:* ${req.id}\n` +
                `*Klien:* ${req.name}\n` +
                `*Masalah:* ${req.type}\n` +
                `*Alamat:* ${req.address}\n` +
                `*Simulasi Kalkulator:* ${totalCost}\n` +
                `--------------------------\n` +
                `Mohon respon pengajuan saya.`;

    window.open(`https://wa.me/${ADMIN_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLogin.user === "admin" && adminLogin.pass === "123") {
      setIsAdmin(true);
      setAdminModalOpen(false);
      setActiveTab('history');
      setAdminLogin({ user: '', pass: '' });
      fetchFromRemote(); // Provide dummy data instead of google scripts
    } else {
      alert("Salah!");
    }
  };

  // Mock remote fetch since google sheets logic was requested
  const fetchFromRemote = () => {
    // using local storage as mock backend since we don't have sheets
    const req = localStorage.getItem('last_request');
    if (req) {
      setServiceRequests([JSON.parse(req)]);
    } else {
      setServiceRequests([]);
    }
  };

  const totalKwh = deviceData.reduce((acc, item) => acc + ((item.watt * item.hours * 30) / 1000), 0);
  const pendingCount = (isAdmin && serviceRequests.length > 0) ? serviceRequests.length : (localStorage.getItem('last_request') ? 1 : 0);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 selection:bg-yellow-200 flex flex-col">
      {/* Navbar */}
      <nav className="bg-yellow-500 p-4 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-2 md:px-0">
            <div className="flex items-center gap-2 md:gap-3">
              <a href="#" className="shrink-0 transition-transform hover:scale-105">
                <img src="/6e0c5381-0d5b-4f5b-910f-e3ce19497633.png" alt="Elektrik Logo" className="h-8 w-8 md:h-10 md:w-10 rounded-full object-cover bg-white shadow-sm border border-yellow-400/50" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                <Zap className="h-8 w-8 md:h-10 md:w-10 hidden bg-white text-yellow-500 rounded-full p-1.5 shadow-sm border border-yellow-400/50" fill="currentColor" />
              </a>
              <h1 className="text-xl md:text-2xl font-bold cursor-pointer select-none" onClick={handleAdminTitleClick}>
                  ELEKTRIK
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <button onClick={() => { if (isAdmin) { setActiveTab('history'); } }} className="relative p-2 md:p-2.5 rounded-lg hover:bg-yellow-600 transition" aria-label="Notifications">
                    <Bell className="h-5 w-5 md:h-6 md:w-6" />
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-yellow-500">
                        {pendingCount}
                    </span>
                </button>
              )}
              {currentUser && (
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-black uppercase leading-none">{currentUser.name}</p>
                        <p className="text-[9px] opacity-80">Pelanggan Terverifikasi</p>
                    </div>
                    <button onClick={handleLogout} className="bg-yellow-600 p-2 md:p-2.5 rounded-lg hover:bg-yellow-700 transition" aria-label="Logout">
                        <LogOut className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                </div>
              )}
            </div>
            
            {isAdmin && <div className="bg-red-600 px-2 py-1 md:px-3 md:py-1 rounded-full text-[9px] md:text-[10px] font-bold animate-pulse absolute left-1/2 -translate-x-1/2">ADMIN</div>}
        </div>
      </nav>

      {/* Stepper */}
      <div className="bg-white border-b sticky top-[68px] z-40 shadow-sm overflow-x-auto no-scrollbar">
        <div className="container mx-auto flex justify-start md:justify-center px-4 md:px-0 min-w-max gap-2 md:gap-8 text-[11px] md:text-sm font-black uppercase tracking-tight md:tracking-tighter text-slate-400">
            {!currentUser && (
              <button onClick={() => setActiveTab('auth')} className={`py-4 md:py-5 px-3 md:px-4 whitespace-nowrap transition-colors ${activeTab === 'auth' ? 'border-b-[3px] border-yellow-500 text-yellow-600' : 'hover:text-slate-600'}`}>1. Masuk / Daftar</button>
            )}
            <button onClick={() => currentUser && setActiveTab('service')} className={`py-4 md:py-5 px-3 md:px-4 whitespace-nowrap transition-colors ${!currentUser ? 'grayscale opacity-50 pointer-events-none' : 'hover:text-slate-600'} ${activeTab === 'service' ? 'border-b-[3px] border-yellow-500 text-yellow-600' : ''}`}>2. Pengajuan</button>
            <button onClick={() => currentUser && setActiveTab('calc')} className={`py-4 md:py-5 px-3 md:px-4 whitespace-nowrap transition-colors ${!currentUser ? 'grayscale opacity-50 pointer-events-none' : 'hover:text-slate-600'} ${activeTab === 'calc' ? 'border-b-[3px] border-yellow-500 text-yellow-600' : ''}`}>3. Cek Harga</button>
            {isAdmin && (
              <button onClick={() => setActiveTab('history')} className={`py-4 md:py-5 px-3 md:px-4 whitespace-nowrap transition-colors text-red-500 hover:text-red-700 ${activeTab === 'history' ? 'border-b-[3px] border-red-500 text-red-600' : ''}`}>Admin Panel</button>
            )}
        </div>
      </div>

      <main className="container mx-auto p-4 sm:p-6 md:p-8 flex-grow">
        {/* Step 1: Auth */}
        {activeTab === 'auth' && (
          <section className="max-w-md mx-auto py-6 sm:py-10 scale-up w-full">
              <div className="glass p-6 sm:p-8 rounded-[2rem] text-center">
                  <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <UserCheck className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Selamat Datang</h2>
                  <p className="text-slate-500 text-sm mb-8">Silahkan masukkan identitas Anda untuk mulai mengajukan layanan elektrik.</p>
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <input type="text" placeholder="Nama Lengkap" required value={loginForm.name} onChange={e => setLoginForm({...loginForm, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 focus:-translate-y-1 focus:shadow-md" />
                      <input type="tel" placeholder="Nomor WhatsApp (08...)" required value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 focus:-translate-y-1 focus:shadow-md" />
                      <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-black transition">MULAI SEKARANG</button>
                  </form>
              </div>
          </section>
        )}

        {/* Step 2: Service */}
        {activeTab === 'service' && (
          <section className="max-w-2xl mx-auto py-2 sm:py-6 scale-up w-full">
              <div className="glass p-6 sm:p-8 md:p-10 rounded-[2.5rem]">
                  <div className="flex justify-between items-start mb-6 md:mb-8">
                      <div>
                          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Ajukan Layanan</h2>
                          <p className="text-slate-500 text-xs md:text-sm mt-1">Lengkapi detail perbaikan yang Anda butuhkan.</p>
                      </div>
                      <FileText className="h-8 w-8 md:h-10 md:w-10 text-yellow-500 opacity-20 flex-shrink-0 ml-4" />
                  </div>
                  
                  <form onSubmit={handleServiceSubmit} className="space-y-6">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Jenis Layanan & Perbaikan</label>
                          <select value={serviceForm.type} onChange={e => setServiceForm({...serviceForm, type: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 focus:-translate-y-1 focus:shadow-md">
                              <option value="Perbaikan">Listrik Padam / Konsleting</option>
                              <option value="Pasang Baru">Pemasangan KWH Baru</option>
                              <option value="Instalasi">Instalasi Kabel / Titik Lampu</option>
                              <option value="Tambah Daya">Permohonan Tambah Daya</option>
                              <option value="Service TV">Service TV</option>
                              <option value="Service Kulkas">Service Kulkas</option>
                              <option value="Service Mesin Cuci">Service Mesin Cuci</option>
                              <option value="Service Laptop">Service Laptop</option>
                              <option value="Elektronik Lainnya">Barang Elektronik Lainnya</option>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Alamat Lengkap</label>
                          <textarea rows={3} required value={serviceForm.address} onChange={e => setServiceForm({...serviceForm, address: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300 focus:-translate-y-1 focus:shadow-md" placeholder="Jl. Nama Jalan, No Rumah, RT/RW..."></textarea>
                      </div>
                      <button type="submit" disabled={isSubmittingService} className="w-full bg-slate-900 overflow-hidden text-white font-black py-5 rounded-3xl shadow-xl flex justify-center items-center gap-3 text-lg disabled:opacity-70 transition-all hover:bg-slate-800">
                          {isSubmittingService ? <><Loader2 className="animate-spin h-5 w-5" /> MENYIMPAN...</> : <>LANJUT KE CEK HARGA <ArrowRight className="h-5 w-5" /></>}
                      </button>
                  </form>
              </div>
          </section>
        )}

        {/* Step 3: Calc */}
        {activeTab === 'calc' && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 scale-up">
              <div className="lg:col-span-1">
                  <div className="glass p-6 rounded-3xl">
                      <h2 className="text-xl font-bold mb-4 text-slate-800">Simulasi Biaya</h2>
                      <p className="text-xs text-slate-500 mb-6">Hitung estimasi tagihan bulanan Anda di sini.</p>
                      <form onSubmit={handleCalcSubmit} className="space-y-4">
                          <input type="text" placeholder="Nama Alat (TV/AC)" required value={calcForm.device} onChange={e => setCalcForm({...calcForm, device: e.target.value})} className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
                          <div className="grid grid-cols-2 gap-3">
                              <input type="number" placeholder="Watt" required value={calcForm.watt} onChange={e => setCalcForm({...calcForm, watt: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
                              <input type="number" max={24} placeholder="Jam/Hari" required value={calcForm.hours} onChange={e => setCalcForm({...calcForm, hours: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400" />
                          </div>
                          <button type="submit" className="w-full bg-yellow-500 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-md hover:bg-yellow-600 transition tracking-wide text-sm">TAMBAH PERANGKAT</button>
                      </form>
                  </div>
                  <div className="mt-6 bg-slate-900 text-white p-6 md:p-8 rounded-[2rem] shadow-2xl">
                      <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Total Estimasi</p>
                              <h3 className="text-3xl md:text-4xl font-black text-yellow-400 mt-1 break-words">Rp {(totalKwh * 1500).toLocaleString('id-ID')}</h3>
                      <div className="mt-6 pt-6 border-t border-slate-800">
                          <button onClick={finishOrder} className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-black text-[11px] md:text-xs uppercase tracking-wider md:tracking-widest transition">Konfirmasi & Hubungi Admin</button>
                      </div>
                  </div>
              </div>
              <div className="lg:col-span-2">
                  <div className="glass p-4 sm:p-6 flex flex-col rounded-3xl min-h-[300px]">
                      <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-400" />
                        Daftar Perangkat
                      </h2>
                      {deviceData.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-300">
                            <FolderOpen className="h-10 w-10 mb-2" />
                            <p className="text-xs font-medium">Daftar masih kosong</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left">
                                <tbody>
                                  {deviceData.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-100 last:border-0 group">
                                        <td className="py-4">
                                            <p className="font-bold text-slate-700">{item.device}</p>
                                            <p className="text-[9px] text-slate-400 font-bold uppercase">{item.watt}W | {item.hours}H</p>
                                        </td>
                                        <td className="text-right">
                                            <button onClick={() => removeDevice(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                              <XCircle className="h-5 w-5" />
                                            </button>
                                        </td>
                                    </tr>
                                  ))}
                                </tbody>
                            </table>
                        </div>
                      )}
                  </div>
              </div>
          </section>
        )}

        {/* Step 4: Admin Panel */}
        {activeTab === 'history' && (
          <section className="scale-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Antrian Pengajuan</h2>
                    <p className="text-sm text-slate-500 mt-1">Daftar pengajuan layanan terbaru</p>
                  </div>
                  <button onClick={fetchFromRemote} className="bg-yellow-500 hover:bg-yellow-600 transition text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md">Refresh Data</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceRequests.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">Belum ada pengajuan masuk.</p>
                    </div>
                  )}
                  {serviceRequests.map((r, i) => (
                    <div key={i} className="glass p-6 rounded-3xl scale-up" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{r.id}</span>
                            <span className="bg-yellow-100 text-yellow-700 text-[9px] font-bold px-2.5 py-1 rounded-full">{r.status}</span>
                        </div>
                        <h4 className="font-black text-slate-800 uppercase mb-1">{r.name}</h4>
                        <p className="text-xs text-slate-600 font-medium mb-3">{r.type}</p>
                        <p className="text-[10px] text-slate-500 mb-5 leading-relaxed">{r.address}</p>
                        <a href={`https://wa.me/${r.phone?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="block w-full bg-green-500 hover:bg-green-600 transition text-white text-center py-3 rounded-xl text-[10px] font-bold shadow-md">
                          RESPON SEKARANG
                        </a>
                    </div>
                  ))}
              </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500 bg-white border-t border-slate-200 shadow-sm mt-auto z-10 w-full">
          <div className="container mx-auto px-4">
              <p>Jl.Kemerdekaan Barat No. 32 . Rt 06 Rw 01 Gligir, Kesugihan Kidul, Jateng, 53274</p>
          </div>
      </footer>

      {/* Admin Login Modal */}
      {adminModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-[60] p-4 backdrop-blur-md">
            <div className="glass rounded-[2rem] p-6 sm:p-8 max-w-sm w-full scale-up">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-black text-center mb-6 text-slate-800">Admin Area</h3>
                <form onSubmit={handleAdminLogin} className="space-y-4">
                    <input type="text" placeholder="Username" required value={adminLogin.user} onChange={e => setAdminLogin({...adminLogin, user: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400" />
                    <input type="password" placeholder="Password" required value={adminLogin.pass} onChange={e => setAdminLogin({...adminLogin, pass: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-yellow-400" />
                    <button type="submit" className="w-full bg-yellow-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-yellow-600 transition mt-2">Login Admin</button>
                    <button type="button" onClick={() => setAdminModalOpen(false)} className="w-full py-2 mt-2 text-slate-400 text-xs font-bold hover:text-slate-600 transition">Batalkan</button>
                </form>
            </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 right-4 sm:top-auto sm:right-auto sm:bottom-8 sm:left-1/2 sm:-translate-x-1/2 bg-slate-900 text-white px-6 py-4 rounded-2xl sm:rounded-full shadow-2xl z-[100] flex items-center gap-3 border border-slate-700 animate-in slide-in-from-top-5 sm:slide-in-from-bottom-5 fade-in duration-300">
            <CheckCircle2 className="text-green-400 h-5 w-5 flex-shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
