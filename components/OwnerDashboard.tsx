
import React, { useState } from 'react';
import { PrintJob, JobStatus, Shop } from '../types';
import { Icons } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface Props {
  activeJob: PrintJob | null;
  updateJobStatus: (id: string, status: JobStatus) => void;
  shop: Shop;
  setShop: (shop: Shop) => void;
  jobHistory: PrintJob[];
}

const OwnerDashboard: React.FC<Props> = ({ activeJob, updateJobStatus, shop, setShop, jobHistory }) => {
  const [setupStep, setSetupStep] = useState(shop.isConfigured ? 0 : 1);
  const [formData, setFormData] = useState<Shop>(shop);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);

  const nextStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSetupStep(s => s + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const prevStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSetupStep(s => s - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const finishSetup = () => {
    setShop({ ...formData, isConfigured: true });
    setSetupStep(0);
  };

  const verifyLocationWithAI = async () => {
    if (!formData.name || !formData.location) return;
    setIsVerifyingLocation(true);

    try {
      let userCoords: { latitude: number; longitude: number } | undefined;

      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
        );
        userCoords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (err) {
        console.warn("Could not get geolocation, proceeding with name/location only.");
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Find the official Google Maps information for a print shop called "${formData.name}" located at "${formData.location}". Return the official address and the Google Maps URI.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-latest",
        contents: prompt,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: userCoords
            }
          }
        }
      });

      const mapsChunk = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.find(c => c.maps?.uri);
      const mapsUrl = mapsChunk?.maps?.uri;
      const officialAddress = mapsChunk?.maps?.title || formData.location;

      setFormData(prev => ({
        ...prev,
        location: officialAddress,
        mapsUrl: mapsUrl || prev.mapsUrl
      }));

    } catch (error) {
      console.error("Location verification failed:", error);
    } finally {
      setIsVerifyingLocation(false);
    }
  };

  if (setupStep > 0) {
    return (
      <div className={`animate-in fade-in slide-in-from-bottom-6 duration-500 py-6 h-full flex flex-col ${isTransitioning ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <p className="text-[12px] font-bold text-indigo-600 uppercase tracking-widest mb-1">Step {setupStep} of 4</p>
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              {setupStep === 1 && 'Basic Setup'}
              {setupStep === 2 && 'Pricing Strategy'}
              {setupStep === 3 && 'Shop Identity'}
              {setupStep === 4 && 'Ready to Print'}
            </h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`w-8 h-2 rounded-full transition-all duration-500 ${setupStep >= i ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-10">
          {setupStep === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                <div className="flex gap-3">
                  <i className="fa-solid fa-circle-info text-indigo-600 mt-1"></i>
                  <p className="text-[15px] text-indigo-900 leading-snug font-medium">
                    Tag your shop's official location so students can navigate to you using Google or Apple Maps.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="shop-name" className="text-[15px] font-medium text-slate-700 ml-1">Shop display name</label>
                <input
                  id="shop-name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-[52px] px-4 bg-white border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 font-medium placeholder:text-slate-500"
                  placeholder="e.g. Central Library Print Lab"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="shop-location" className="text-[15px] font-medium text-slate-700 ml-1">Physical location / Address</label>
                <div className="relative">
                  <input
                    id="shop-location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full h-[52px] px-4 bg-white border-2 border-slate-300 rounded-xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all text-slate-900 font-medium placeholder:text-slate-500"
                    placeholder="e.g. Main Block, Ground Floor"
                  />
                  <button
                    onClick={verifyLocationWithAI}
                    disabled={!formData.name || !formData.location || isVerifyingLocation}
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-3 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
                  >
                    {isVerifyingLocation ? (
                      <i className="fa-solid fa-spinner animate-spin"></i>
                    ) : (
                      <i className="fa-solid fa-location-crosshairs"></i>
                    )}
                    {formData.mapsUrl ? 'Verified' : 'Verify'}
                  </button>
                </div>
                {formData.mapsUrl && (
                  <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5 mt-1 ml-1">
                    <i className="fa-solid fa-circle-check"></i>
                    Location linked to Google Maps
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <label className="text-[15px] font-medium text-slate-700 ml-1">Number of active printers</label>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border-2 border-slate-200">
                  <button
                    onClick={() => setFormData({ ...formData, printerCount: Math.max(1, formData.printerCount - 1) })}
                    className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:border-indigo-600 active:scale-95 transition-all shadow-sm"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span className="flex-1 text-center font-bold text-xl text-slate-900">
                    {formData.printerCount}
                  </span>
                  <button
                    onClick={() => setFormData({ ...formData, printerCount: formData.printerCount + 1 })}
                    className="w-12 h-12 rounded-xl bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:text-indigo-600 hover:border-indigo-600 active:scale-95 transition-all shadow-sm"
                  >
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          )}


          {setupStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Black & White</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Single Side (₹)</label>
                    <input
                      type="number"
                      value={formData.pricing.bw_ss}
                      onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, bw_ss: parseFloat(e.target.value) } })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Double Side (₹)</label>
                    <input
                      type="number"
                      value={formData.pricing.bw_ds}
                      onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, bw_ds: parseFloat(e.target.value) } })}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono font-bold outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Color</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Single Side (₹)</label>
                    <input
                      type="number"
                      value={formData.pricing.color_ss}
                      onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, color_ss: parseFloat(e.target.value) } })}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 font-mono font-bold outline-none focus:border-indigo-600 text-indigo-900"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Double Side (₹)</label>
                    <input
                      type="number"
                      value={formData.pricing.color_ds}
                      onChange={e => setFormData({ ...formData, pricing: { ...formData.pricing, color_ds: parseFloat(e.target.value) } })}
                      className="w-full bg-white border border-indigo-200 rounded-lg px-3 py-2 font-mono font-bold outline-none focus:border-indigo-600 text-indigo-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {setupStep === 3 && (
            <div className="space-y-5 animate-in slide-in-from-right duration-300 text-center pt-4">
              <div className="w-32 h-32 bg-slate-900 text-white rounded-[2rem] mx-auto flex items-center justify-center text-4xl shadow-xl">
                <i className="fa-solid fa-store"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{formData.name || 'Your Shop'}</h3>
                <p className="text-sm text-slate-500 font-medium">{formData.location || 'Location not set'}</p>
              </div>
              <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold inline-block">
                <i className="fa-solid fa-qrcode mr-2"></i>
                QR Code Ready for Campus
              </div>
            </div>
          )}

          {setupStep === 4 && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Shop Name</span>
                  <span className="text-sm font-bold text-slate-900">{formData.name}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase">Location</span>
                  <span className="text-sm font-bold text-slate-900 text-right max-w-[60%]">{formData.location}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Pricing Logic</span>
                  <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">Configured</span>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 font-medium px-4">
                By continuing, you confirm that you are the authorized owner of this establishment.
              </p>
            </div>
          )}
        </div>

        <div className="pt-6">
          <button
            onClick={setupStep === 4 ? finishSetup : nextStep}
            disabled={
              (setupStep === 1 && (!formData.name || !formData.location)) ||
              isTransitioning
            }
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {setupStep === 4 ? 'Launch Dashboard' : 'Continue'}
            {setupStep !== 4 && <i className="fa-solid fa-arrow-right"></i>}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between mt-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Board</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className={`w-2.5 h-2.5 rounded-full ${shop.isPaused ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
            <p className="text-[12px] text-slate-600 font-bold uppercase tracking-wider">{shop.isPaused ? 'Requests Paused' : 'Accepting Jobs'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShop({ ...shop, isPaused: !shop.isPaused })}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-sm border-2 ${shop.isPaused ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}
          >
            <i className={`fa-solid ${shop.isPaused ? 'fa-play' : 'fa-pause'}`}></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-5 pb-24">
        {activeJob && activeJob.status !== JobStatus.PENDING_PAYMENT ? (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>

            <div className="flex justify-between items-start mb-6 pl-4">
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                  {activeJob.status.replace('_', ' ')}
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{activeJob.fileName}</h3>
                <div className="flex gap-2 mt-2 text-xs text-slate-500">
                  <span className="font-bold">{activeJob.customerName}</span> • <span>{activeJob.customerPhone}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">₹{activeJob.cost.toFixed(2)}</p>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Paid via UPI</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pl-4 mb-8">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pages</p>
                <p className="text-sm font-bold text-slate-900">{activeJob.pageCount}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Config</p>
                <p className="text-sm font-bold text-slate-900">
                  {activeJob.isColor ? 'Color' : 'B/W'} • {activeJob.isDoubleSided ? 'Duplex' : 'Single'}
                </p>
              </div>
            </div>

            <div className="pl-4">
              {activeJob.status === JobStatus.IN_QUEUE && (
                <button
                  onClick={handleStartPrinting}
                  className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-print"></i> Start Printing
                </button>
              )}

              {activeJob.status === JobStatus.PRINTING && (
                <button
                  onClick={handleMarkReady}
                  className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <i className="fa-solid fa-check-double"></i> Mark Ready
                </button>
              )}

              {activeJob.status === JobStatus.READY && (
                <div className="w-full py-4 bg-slate-100 text-slate-400 font-bold rounded-2xl flex items-center justify-center gap-2 border-2 border-dashed border-slate-200">
                  <i className="fa-solid fa-spinner fa-spin"></i> Waiting for Collection...
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
              <i className="fa-solid fa-print text-3xl"></i>
            </div>
            <p className="text-slate-400 font-bold">No active jobs</p>
            <p className="text-xs text-slate-300 mt-1">New requests will appear here instantaneously</p>
          </div>
        )}

        <div className="pt-8">
          <div className="flex items-center justify-between mb-5">
            <p className="text-[13px] font-bold text-slate-500 uppercase tracking-widest ml-1">Closed Requests</p>
            <span className="text-[12px] font-bold text-slate-400">Today</span>
          </div>
          <div className="space-y-3">
            {jobHistory.length > 0 ? (
              jobHistory.map(job => (
                <div key={job.id} className="bg-white p-4.5 rounded-2xl flex items-center justify-between border border-slate-200 hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <i className="fa-solid fa-check-double"></i>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-700 truncate">{job.fileName}</p>
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">
                        ₹{job.cost.toFixed(2)} • Completed at {new Date(job.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-[10px] flex-shrink-0">
                    <i className="fa-solid fa-check"></i>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                <p className="text-xs text-slate-400 font-medium italic">No requests completed yet today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default OwnerDashboard;

