
import React, { useState, useEffect } from 'react';
import { UserRole, Shop, PrintJob, UserProfile } from '../types';
import { Icons } from '../constants';
import { QRCodeSVG } from 'qrcode.react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  user: UserProfile;
  shop: Shop;
  setShop: (shop: Shop) => void;
  jobHistory: PrintJob[];
  activeSubPage: string | null;
  setActiveSubPage: (page: string | null) => void;
  onRoleSwitch: () => void;
  onChangeShop: () => void;
  onLogout: () => void;
}

const pricingLabels: Record<string, string> = {
  bw_ss: 'B/W Single-sided',
  bw_ds: 'B/W Double-sided',
  color_ss: 'Color Single-sided',
  color_ds: 'Color Double-sided'
};

const MenuOverlay: React.FC<Props> = ({
  isOpen, onClose, role, user, shop, setShop, jobHistory, activeSubPage, setActiveSubPage, onRoleSwitch, onChangeShop, onLogout
}) => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('pickit_theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pickit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pickit_theme', 'light');
    }
  }, [isDarkMode]);

  const menuItems = role === UserRole.STUDENT ? [
    { id: 'shop', label: 'Connected Shop', icon: <Icons.Shop />, desc: shop.name || 'Not Linked' },
    { id: 'requests', label: 'Payment History', icon: <i className="fa-solid fa-wallet"></i>, desc: 'Past transactions' },
    { id: 'notifs', label: 'Notifications', icon: <i className="fa-solid fa-bell"></i>, desc: 'Alert settings' },
    { id: 'help', label: 'Help & Support', icon: <i className="fa-solid fa-circle-info"></i>, desc: 'How to use PickIT' },
    { id: 'refund', label: 'Refund Policy', icon: <i className="fa-solid fa-rotate-left"></i>, desc: 'Rules for failed prints' },
    { id: 'location', label: 'Location Usage', icon: <i className="fa-solid fa-location-dot"></i>, desc: 'GPS & Privacy' },
    { id: 'privacy', label: 'Privacy Policy', icon: <i className="fa-solid fa-shield-halved"></i>, desc: 'Your data rights' },
    { id: 'appearance', label: 'Appearance', icon: <i className="fa-solid fa-moon"></i>, desc: 'Dark/Light Mode' },
  ] : [
    { id: 'config', label: 'Edit Shop Setup', icon: <Icons.Settings />, desc: 'Modify rates' },
    { id: 'id', label: 'Shop Identity', icon: <i className="fa-solid fa-qrcode"></i>, desc: 'QR & ID' },
    { id: 'stats', label: 'Today\'s Summary', icon: <i className="fa-solid fa-chart-simple"></i>, desc: 'Revenue & Volume' },
    { id: 'help', label: 'Support', icon: <i className="fa-solid fa-circle-question"></i>, desc: 'Owner FAQ' },
    { id: 'refund', label: 'Refund Policy', icon: <i className="fa-solid fa-rotate-left"></i>, desc: 'Handling disputes' },
    { id: 'privacy', label: 'Privacy Policy', icon: <i className="fa-solid fa-shield-halved"></i>, desc: 'Data handling' },
    { id: 'security', label: 'Data & Security', icon: <i className="fa-solid fa-lock"></i>, desc: 'Protection standards' },
    { id: 'appearance', label: 'Appearance', icon: <i className="fa-solid fa-moon"></i>, desc: 'Dark/Light Mode' },
  ];

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '??';

  const renderSubPage = () => {
    switch (activeSubPage) {
      case 'help':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Help & Support</h3>
            <div className="space-y-6">
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-[2rem] border border-indigo-100 dark:border-indigo-800">
                <h4 className="font-bold text-indigo-800 dark:text-indigo-300 mb-3 text-lg">How PickIT Works</h4>
                <ol className="text-sm space-y-3 text-slate-700 dark:text-slate-300 font-medium list-decimal list-inside">
                  <li>Scan the Shop QR Code to connect.</li>
                  <li>Upload your document securely.</li>
                  <li>Select print options (B/W, Color, etc.).</li>
                  <li>Wait for the exact ready time.</li>
                  <li>Pay via UPI directly to the shop.</li>
                  <li>Collect your papers when notified!</li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4 text-lg">Frequently Asked Questions</h4>
                <div className="space-y-3">
                  {[
                    { q: "Do I scan every time?", a: "No! Once connected, the shop stays in your app until you disconnect or logout." },
                    { q: "What if payment fails?", a: "If money is deducted but the status doesn't update, show the UPI ref ID to the shop owner." },
                    { q: "Can I cancel?", a: "You can cancel before the shop accepts the job. Once 'Printing' starts, it cannot be cancelled." },
                    { q: "Is my file saved?", a: "No. Your file is transferred for printing and then automatically deleted for privacy." }
                  ].map((faq, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">{faq.q}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'refund':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Refund Policy</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                At PickIT, we aim for fair and transparent transactions. Since payments are made directly via UPI to the Shop Owner, refunds are handled as follows:
              </p>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Failed Payments</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">If amount is deducted but not reflected, it will be auto-refunded by your bank in 3-5 days.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1"></i>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">Shop Cancellation</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">If the shop cannot fulfill your request (e.g. out of paper), they must refund you immediately via cash or UPI.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <i className="fa-solid fa-circle-xmark text-rose-500 mt-1"></i>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Cancellation After Print</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Once the status is "Printing", resources are used, and no refund is possible.</p>
                  </div>
                </li>
              </ul>

              <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl mt-4">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">Disclaimer</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PickIT is a facilitator platform and does not hold user funds at any point.</p>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Privacy Policy</h3>
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Data Collection</h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Collected</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Name, email (for login), and print shop preferences.</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">NOT Collected</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">We do <strong>not</strong> store your documents permanently, bank details, or live GPS location.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Usage & Rights</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                  Your data is used solely to authenticate you and process your print requests. We do not sell or share data with third parties.
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  *Hackathon Disclaimer: This application is a pilot project. Data handling is minimal and designed for demonstration purposes. Provide feedback via Help section.
                </p>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Data & Security</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center shrink-0"><i className="fa-solid fa-shield-halved"></i></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Secure Authentication</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">We use OTP-less or Token-based entry to ensure only you access your account.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center shrink-0"><i className="fa-solid fa-database"></i></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Zero-Trace Printing</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Documents transfer directly to the shop. Once the session ends, local copies are purged.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0"><i className="fa-solid fa-user-lock"></i></div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Session Control</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Logging out instantly clears all local tokens and active session data.</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Location Usage</h3>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-700 text-center">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-indigo-600 text-3xl mx-auto mb-6">
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">How we use Location</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                PickIT does <strong>not</strong> track your live movements. We only use location services to:
              </p>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <i className="fa-solid fa-check text-indigo-500"></i> Show relative distance to print shops
                </li>
                <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                  <i className="fa-solid fa-check text-indigo-500"></i> Open Google/Apple Maps for directions
                </li>
              </ul>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Your privacy comes first</p>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Appearance</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center">
                    <i className={`fa-solid ${isDarkMode ? 'fa-moon' : 'fa-sun'}`}></i>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Easier on the eyes</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
              </div>
            </div>
          </div>
        );

      case 'shop':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Connected Shop</h3>
            <div className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 text-center shadow-sm">
              <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl flex items-center justify-center text-indigo-600 text-3xl mx-auto mb-6"><Icons.Shop /></div>
              <p className="font-bold text-xl text-slate-900 dark:text-white">{shop.name || 'Find a Shop'}</p>
              <p className="text-sm text-slate-400 mt-2">{shop.location || 'Scan QR at the counter'}</p>

              {shop.isConfigured && (
                <div className="mt-8 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-800 text-xs font-bold uppercase tracking-widest mb-10">
                  <i className="fa-solid fa-circle-check"></i> Verified Destination
                </div>
              )}

              <button
                onClick={onChangeShop}
                className="w-full mt-4 py-4 bg-indigo-600 text-white font-bold rounded-2xl text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none"
              >
                <i className="fa-solid fa-qrcode"></i> {shop.isConfigured ? 'Change Shop' : 'Connect via QR'}
              </button>
            </div>
          </div>
        );
      case 'requests':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-900 dark:text-white">Payment History</h3>
            <div className="space-y-4">
              {jobHistory.length > 0 ? jobHistory.map(job => (
                <div key={job.id} className="p-5 bg-white dark:bg-slate-800 rounded-[1.5rem] border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center text-xl shrink-0">
                      <i className="fa-solid fa-check-to-slot"></i>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{job.fileName}</p>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">
                        {new Date(job.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className="text-lg font-bold text-slate-900 dark:text-white">₹{job.cost.toFixed(2)}</p>
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold rounded uppercase tracking-wider mt-1">
                      Paid
                    </span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-200 dark:text-slate-600 mx-auto mb-6">
                    <i className="fa-solid fa-receipt text-3xl"></i>
                  </div>
                  <p className="text-[15px] text-slate-400 font-medium">No payment history yet.</p>
                  <p className="text-xs text-slate-300 dark:text-slate-500 mt-1">Transactions appear here after pickup.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'id':
        return (
          <div className="animate-in slide-in-from-right-4 duration-300 text-center">
            <h3 className="text-xl font-bold mb-6 text-left text-slate-900 dark:text-white">Shop Identity</h3>
            <div className="bg-white dark:bg-slate-800 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 shadow-sm inline-block w-full">
              <div className="w-44 h-44 bg-slate-50 dark:bg-slate-700 rounded-3xl mx-auto flex items-center justify-center mb-8 border-4 border-dashed border-indigo-100 dark:border-indigo-800 relative overflow-hidden">
                <QRCodeSVG value={shop.id} size={150} level="H" className="opacity-90 mx-auto" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Your Shop ID</p>
              <p className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400">{shop.id}</p>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button className="py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-100 dark:shadow-none">Download</button>
                <button className="py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-[11px] font-bold uppercase tracking-wider">Print</button>
              </div>
            </div>
          </div>
        );
      default:
        // Main Dashboard View in Menu
        return (
          <div className="animate-in slide-in-from-left-4 duration-300 pb-10">
            {/* Profile Section */}
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex items-center gap-4 mb-10">
              <div className="w-16 h-16 rounded-full border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden bg-white dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                {user.photoUrl ? (
                  <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold">{getInitials(user.name)}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  {role === UserRole.STUDENT ? 'Verified Student' : 'Shop Manager'}
                </p>
              </div>
            </div>

            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-4">Account</h3>
            <div className="space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSubPage(item.id)}
                  className="w-full flex items-center gap-4 p-5 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
                >
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-[15px] font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <Icons.ChevronRight />
                </button>
              ))}
            </div>

            <div className="mt-12 p-8 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl"><i className="fa-solid fa-repeat"></i></div>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">Switch Account</p>
              <button
                onClick={onRoleSwitch}
                className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl text-sm active:scale-95 transition-transform shadow-xl"
              >
                Switch to {role === UserRole.STUDENT ? 'Shop Owner' : 'Student View'}
              </button>
            </div>

            <button
              onClick={onLogout}
              className="w-full mt-6 py-4 text-rose-500 font-bold rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-900/10"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Log Out
            </button>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative h-full w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl animate-in slide-in-from-right duration-500 ease-out border-l border-slate-100 dark:border-slate-800">
        <div className="h-full overflow-y-auto px-7 py-12">
          <div className="flex items-center justify-between mb-12">
            {activeSubPage ? (
              <button onClick={() => setActiveSubPage(null)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
                <i className="fa-solid fa-arrow-left text-lg"></i>
              </button>
            ) : (
              <Icons.Logo className="h-6 w-auto dark:invert" />
            )}
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors">
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>
          {renderSubPage()}
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
