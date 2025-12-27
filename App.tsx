
import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, JobStatus, PrintJob, Shop, UserProfile } from './types';
import StudentDashboard from './components/StudentDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import MenuOverlay from './components/MenuOverlay';
import Onboarding from './components/Onboarding';
import { Icons } from './constants';
import { Peer, DataConnection } from 'peerjs';

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  const [isStudentConnected, setIsStudentConnected] = useState(false);

  // Shared State
  const [activeJob, setActiveJob] = useState<PrintJob | null>(() => {
    const saved = localStorage.getItem('pickit_active_job');
    return saved ? JSON.parse(saved) : null;
  });

  const [jobHistory, setJobHistory] = useState<PrintJob[]>(() => {
    const saved = localStorage.getItem('pickit_job_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [shop, setShop] = useState<Shop>(() => {
    const saved = localStorage.getItem('pickit_shop_data');
    return saved ? JSON.parse(saved) : {
      id: 'SHOP-' + Math.floor(1000 + Math.random() * 9000),
      name: '',
      location: '',
      printerCount: 1,
      ppm: 20,
      isPaused: false,
      isConfigured: false,
      pricing: { bw_ss: 2, bw_ds: 3, color_ss: 10, color_ds: 15 }
    };
  });

  // P2P Refs
  const peerRef = React.useRef<Peer | null>(null);
  const connRef = React.useRef<DataConnection | null>(null);

  // Initial Sync Logic (P2P)
  useEffect(() => {
    // Cleanup previous peer/conn on role/shop change
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
    if (connRef.current) { connRef.current.close(); connRef.current = null; }

    const peerId = 'pickit-shop-' + shop.id;

    if (role === UserRole.OWNER) {
      // OWNER: Host the peer
      const peer = new Peer(peerId);
      peerRef.current = peer;

      peer.on('open', (id) => {
        console.log('Owner Peer ID:', id);
      });

      peer.on('connection', (conn) => {
        console.log('Student connected:', conn.peer);
        connRef.current = conn;

        conn.on('data', (data: any) => {
          console.log('Received data:', data);
          if (data.type === 'JOB_UPDATE') {
            setActiveJob(data.payload);
          }
        });
      });

    } else if (role === UserRole.STUDENT && isStudentConnected) {
      // STUDENT: Connect to the shop peer
      const peer = new Peer(); // Auto-ID for student
      peerRef.current = peer;

      peer.on('open', () => {
        const conn = peer.connect(peerId);
        connRef.current = conn;

        conn.on('open', () => {
          console.log('Connected to Shop:', peerId);
          // If we have an active job, sync it immediately
          if (activeJob) {
            conn.send({ type: 'JOB_UPDATE', payload: activeJob });
          }
        });
      });
    }

    return () => {
      // Cleanup on unmount or deps change handled at start of effect
    };
  }, [role, shop.id, isStudentConnected]); // Re-run if role, shop ID, or connection status changes

  // Wrapper to broadcast updates
  const handleStudentJobUpdate = (job: PrintJob | null) => {
    setActiveJob(job);
    if (role === UserRole.STUDENT && connRef.current && connRef.current.open) {
      connRef.current.send({ type: 'JOB_UPDATE', payload: job });
    }
  };

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('pickit_active_job', JSON.stringify(activeJob));
  }, [activeJob]);

  useEffect(() => {
    localStorage.setItem('pickit_job_history', JSON.stringify(jobHistory));
  }, [jobHistory]);

  useEffect(() => {
    localStorage.setItem('pickit_shop_data', JSON.stringify(shop));
  }, [shop]);

  // Persist role and user on launch
  useEffect(() => {
    const savedRole = localStorage.getItem('pickit_role') as UserRole;
    const savedUser = localStorage.getItem('pickit_user');
    const savedShopStatus = localStorage.getItem('pickit_connected');

    if (savedRole) setRole(savedRole);
    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedShopStatus === 'true') setIsStudentConnected(true);

    // Browser notification permissions
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const updateJobStatus = useCallback((jobId: string, newStatus: JobStatus) => {
    setActiveJob(prev => {
      if (prev && prev.id === jobId) {
        // Notification Logic ONLY for READY status
        if (newStatus === JobStatus.READY) {
          playReadySound();
          showBrowserNotification(prev.fileName);
        }

        const updated = { ...prev, status: newStatus };
        if (newStatus === JobStatus.COLLECTED) {
          setJobHistory(h => [updated, ...h]);
          return null;
        }
        return updated;
      }
      return prev;
    });
  }, []);

  const playReadySound = () => {
    try {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine') => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.15, start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
        osc.start(start);
        osc.stop(start + duration);
      };
      const now = ctx.currentTime;
      // Apple-style "Note" notification chime: Soft and calm
      playTone(1046.50, now, 0.4, 'sine'); // C6
      playTone(1318.51, now + 0.1, 0.6, 'sine'); // E6
    } catch (e) { console.warn("Audio Context blocked or unsupported"); }
  };

  const showBrowserNotification = (fileName: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Order Ready", {
        body: `Your document "${fileName}" is ready for pickup!`,
        icon: 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/svgs/solid/print.svg',
        silent: true // We handle our own subtle chime
      });
    }
  };

  const handleConnectShop = (scannedId: string) => {
    setShop(prev => ({
      ...prev,
      id: scannedId,
      name: prev.name || 'Campus Fast-Print Hub',
      location: prev.location || 'Central Library, Ground Floor',
      isConfigured: true
    }));
    setIsStudentConnected(true);
    localStorage.setItem('pickit_connected', 'true');
  };

  const handleDisconnectShop = () => {
    setIsStudentConnected(false);
    localStorage.removeItem('pickit_connected');
    setActiveSubPage(null);
  };

  const handleLogout = () => {
    setRole(null);
    setUser(null);
    setIsStudentConnected(false);
    localStorage.removeItem('pickit_role');
    localStorage.removeItem('pickit_user');
    localStorage.removeItem('pickit_connected');
    setIsMenuOpen(false);
    setActiveSubPage(null);
  };

  const handleRoleToggle = () => {
    const newRole = role === UserRole.STUDENT ? UserRole.OWNER : UserRole.STUDENT;
    setRole(newRole);
    localStorage.setItem('pickit_role', newRole);
    setIsMenuOpen(false);
    setActiveSubPage(null);
  };

  const handleFinishOnboarding = (selectedRole: UserRole, profile: UserProfile) => {
    setRole(selectedRole);
    setUser(profile);
    localStorage.setItem('pickit_role', selectedRole);
    localStorage.setItem('pickit_user', JSON.stringify(profile));
  };

  if (!role || !user) {
    return <Onboarding onFinish={handleFinishOnboarding} />;
  }

  return (
    <div className="min-h-screen relative flex flex-col max-w-md mx-auto bg-[#F8FAFC] overflow-hidden shadow-2xl border-x border-slate-200">

      {/* Header with official Branding */}
      <header className="px-6 py-4 flex items-center justify-between glass sticky top-0 z-30 border-b border-slate-100">
        <Icons.Logo className="h-8 w-auto" />

        <button
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <Icons.Menu />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-24">
        {role === UserRole.STUDENT ? (
          <StudentDashboard
            activeJob={activeJob}
            setActiveJob={handleStudentJobUpdate}
            shop={shop}
            isStudentConnected={isStudentConnected}
            onConnectShop={handleConnectShop}
            user={user}
          />
        ) : (
          <OwnerDashboard
            activeJob={activeJob}
            updateJobStatus={updateJobStatus}
            shop={shop}
            setShop={setShop}
            jobHistory={jobHistory}
          />
        )}
      </main>

      {/* Persistent Menu Overlay */}
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        role={role}
        user={user}
        shop={shop}
        setShop={setShop}
        jobHistory={jobHistory}
        activeSubPage={activeSubPage}
        setActiveSubPage={setActiveSubPage}
        onRoleSwitch={handleRoleToggle}
        onChangeShop={handleDisconnectShop}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default App;
