import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  BookOpen,
  Shield,
  Building2,
  Store,
  ToggleLeft,
  QrCode,
  BarChart3,
  Tv,
  PhoneCall,
  Bell,
  CheckCircle2,
  Search,
  RotateCcw,
  Sparkles
} from "lucide-react";

const ROLES = [
  { id: "superadmin", label: "SuperAdmin", icon: Shield, subtitle: "Platform Command Center" },
  { id: "admin", label: "Mall Manager", icon: Building2, subtitle: "Complex & Brands Administration" },
  { id: "shop", label: "Store Counter", icon: Store, subtitle: "Live Queue & Token Operations" }
];

const HelpModal = React.memo(({ isOpen, onClose, role }) => {
  // Determine role based on explicit prop, URL pathname, or localStorage
  const detectInitialRole = useMemo(() => {
    if (role) {
      const r = role.toLowerCase().trim();
      if (r.includes("shop")) return "shop";
      if (r === "admin") return "admin";
      if (r === "superadmin" || r === "owner") return "superadmin";
    }

    if (typeof window !== "undefined") {
      const path = window.location.pathname.toLowerCase();
      if (path.includes("/counter")) return "shop";
      if (path.includes("/branddashboard")) return "admin";
    }

    const stored = (localStorage.getItem("role") || "").toLowerCase().trim();
    if (stored.includes("shop")) return "shop";
    if (stored === "admin") return "admin";
  }, [role]);

  const [activeRole, setActiveRole] = useState(detectInitialRole);

  // Sync active role when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveRole(detectInitialRole);
    }
  }, [isOpen, detectInitialRole]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-[#121416]/50 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[24px] sm:rounded-[28px] w-full max-w-xl p-5 sm:p-6 shadow-2xl border border-white/80 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
              <BookOpen size={17} className="text-gray-900" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 m-0 leading-tight">
                RedCarpet Help & Guides
              </h3>
              <p className="text-[11px] text-gray-500 m-0">
                Role-based guide for operations & workflows
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-black hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* Role Selector Tabs */}
        <div className="mt-3 flex gap-1.5 p-1 bg-gray-100/80 rounded-xl flex-shrink-0">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isActive = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRole(r.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#111215] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
                }`}
              >
                <Icon size={14} className={isActive ? "text-red-400" : "text-gray-500"} />
                <span className="truncate">{r.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Body */}
        <div className="mt-4 overflow-y-auto pr-1 flex-1 space-y-3.5 text-xs sm:text-sm text-gray-600 leading-relaxed">
          {/* SUPERADMIN GUIDE */}
          {activeRole === "superadmin" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 flex items-start gap-2.5">
                <Sparkles size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-950 font-medium m-0 leading-snug">
                  <strong>SuperAdmin Command Center:</strong> Manage multiple shopping complexes, global subscriptions, brand stores, and QR marketing.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Building2 size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Register Shopping Complexes</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Click the <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">+</code> button in the left dock to register a new shopping mall, food court, or commercial arcade with custom branding and manager credentials.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ToggleLeft size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Instant Subscription Toggle</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Use the micro-switch on each mall card to immediately activate or suspend real-time queueing services and customer QR access across the complex.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Store size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Manage Brand Stores</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Click <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">Manage Stores</code> on any mall card to view its brand counters, menus, and queue operators.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <QrCode size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">QR Studio</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Access the QR icon in the dock to customize printable QR codes and table standees for customer mobile check-in.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Cross-Mall Footfall Analytics</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Open the Analytics tab to monitor customer scan trends, peak check-in hours, and active queues across all registered venues.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MALL MANAGER (ADMIN) GUIDE */}
          {activeRole === "admin" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2.5">
                <Building2 size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-950 font-medium m-0 leading-snug">
                  <strong>Mall Manager Guide:</strong> You manage all brand stores, food court counters, TV waiting screens, and printable QR standees inside your shopping complex.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Store size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Add & Manage Brand Stores</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Click <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">+ Add Store</code> to register retail shops, cafes, or food outlets with their brand name, counter logo, and contact info.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PhoneCall size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Assign Counter Links to Staff</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Each registered store gets a live queue counter link. Provide this link to your counter staff or cashiers so they can call customer tokens in real time.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <QrCode size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Download Printable QR Standees</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Click the QR icon on any store card to preview and print high-resolution QR standees for customer dining tables, cash counters, or mall entry kiosks.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Tv size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Live TV Waiting Screens</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Open <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">/tv/:shopId</code> or the mall multi-brand display on food court Smart TVs to broadcast live calling token numbers to waiting shoppers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">Monitor Store Performance</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Review queue status across all stores, active waiting times, and total tokens served today to optimize mall customer flow.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STORE QUEUE COUNTER GUIDE */}
          {activeRole === "shop" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                <Store size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-950 font-medium m-0 leading-snug">
                  <strong>Store Counter Operator Guide:</strong> Manage customer queues, call next tokens, send instant SMS updates, and keep the live TV display updated.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <PhoneCall size={14} className="text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">1. Call Next Token</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Click the green <code className="bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-mono text-[11px] font-semibold">Call</code> button next to the customer token. This updates their status to <em>Calling</em> and announces their number on the Live TV screen.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">2. Automated & Manual SMS Alerts</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Keep <strong>Auto SMS</strong> enabled to automatically notify customers 2 slots ahead so they return to the counter on time without crowding. You can also click the SMS button manually on any guest row.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">3. Mark Served or Cancelled</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Once the customer receives their order, click <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">Serve</code> to finish the token. If a guest does not show up after repeated calls, click <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">Cancel</code>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Tv size={14} className="text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">4. Live TV Waiting Screen</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Click the TV icon at the top to open the full-screen display. Run this link on a wall monitor or tablet facing waiting guests to show current serving numbers.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Search size={14} className="text-gray-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">5. Filter Tabs & Search</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Switch between <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">All Guests</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">Waiting in Line</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-[11px] font-semibold text-gray-800">Called & Served</code>, or search by name, phone, or token code.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RotateCcw size={14} className="text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-xs m-0">6. Daily Queue Reset</h4>
                    <p className="text-[12px] text-gray-600 m-0 mt-0.5">
                      Start fresh each morning by clicking the reset icon to clear finished tokens and reset queue numbering for the new day.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 flex-shrink-0">
          <span className="text-[11px] text-gray-400">
            Tip: Switch tabs above to view guides for other roles
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#111215] text-white px-5 py-2 rounded-full text-xs font-semibold cursor-pointer hover:bg-gray-800 transition-colors shadow-sm"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
});

export default HelpModal;
