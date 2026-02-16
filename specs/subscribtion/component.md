```
import React, { useState } from 'react';
import { 
  Check, 
  Sword, 
  Zap, 
  Crown, 
  Scroll, 
  Coins, 
  Gem,
  ShieldCheck
} from 'lucide-react';

// --- Utility for class names (simulating cn() from shadcn) ---
const cn = (...classes) => classes.filter(Boolean).join(' ');

// --- Data Configuration ---
const TIERS = [
  {
    id: 'standard',
    name: 'STANDARD',
    icon: Sword,
    theme: 'blue',
    basePrice: 10,
    accentIcon: null,
    features: [
      "Get 5 featured advertisements for one month",
      "Get a blue verification badge for one month.",
      "Get 5 featured advertisements for one month",
      "Get a blue verification badge for one month.",
      "Get a 1.5% discount on withdrawals and deposits for one month.",
      "Get a blue verification badge for one month."
    ]
  },
  {
    id: 'pro',
    name: 'PRO',
    icon: Zap,
    theme: 'green',
    basePrice: 20,
    accentIcon: Coins,
    features: [
      "Get 10 featured advertisements for one month",
      "Get a blue verification badge for one month.",
      "Get 10 featured advertisements for one month",
      "Get a blue verification badge for one month.",
      "Get a 2.5% discount on withdrawals and deposits for one month.",
      "Get a blue verification badge for one month."
    ]
  },
  {
    id: 'legendary',
    name: 'LEGENDARY', // Corrected spelling from LEGANDRY
    icon: Crown,
    theme: 'purple',
    basePrice: 30,
    accentIcon: Gem,
    features: [
      "Get 20 featured advertisements for one month",
      "Get a gold verification badge for one month.",
      "Get 20 featured advertisements for one month",
      "Get a gold verification badge for one month.",
      "Get a 5% discount on withdrawals and deposits for one month.",
      "Get a gold verification badge for one month."
    ]
  }
];

const BILLING_CYCLES = [
  { label: 'Month', multiplier: 1, labelSuffix: '/ Month' },
  { label: '6 Month', multiplier: 6, labelSuffix: '/ 6 Months' },
  { label: 'Year', multiplier: 12, labelSuffix: '/ Year' }
];

export default function App() {
  const [selectedCycle, setSelectedCycle] = useState(BILLING_CYCLES[0]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans p-4 md:p-8 flex flex-col items-center">
      
      {/* Header Section */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Upgrade Your Account
        </h1>

        {/* Custom Segmented Control / Tabs */}
        <div className="bg-slate-900/50 p-1 rounded-full border border-slate-800 flex items-center">
          {BILLING_CYCLES.map((cycle) => (
            <button
              key={cycle.label}
              onClick={() => setSelectedCycle(cycle)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300",
                selectedCycle.label === cycle.label
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              )}
            >
              {cycle.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        {TIERS.map((tier) => (
          <PricingCard 
            key={tier.id} 
            tier={tier} 
            cycle={selectedCycle} 
          />
        ))}
      </div>
    </div>
  );
}

// --- Sub-components ---

function PricingCard({ tier, cycle }) {
  const { theme, name, icon: MainIcon, features, accentIcon: AccentIcon } = tier;
  
  // Calculate price based on multiplier (simplified logic)
  const price = tier.basePrice * cycle.multiplier;

  // Theme configuration objects
  const themeStyles = {
    blue: {
      header: "from-blue-500 to-blue-400",
      glow: "shadow-blue-500/20",
      border: "border-blue-500/30",
      text: "text-blue-500",
      badge: "bg-blue-500",
      pattern: "radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)"
    },
    green: {
      header: "from-emerald-400 to-teal-500",
      glow: "shadow-emerald-500/20",
      border: "border-emerald-500/30",
      text: "text-emerald-500",
      badge: "bg-emerald-500",
      pattern: "repeating-radial-gradient(circle at 0 0, transparent 0, transparent 20px, rgba(255,255,255,0.1) 21px, transparent 22px)"
    },
    purple: {
      header: "from-violet-500 to-purple-600",
      glow: "shadow-purple-500/20",
      border: "border-purple-500/30",
      text: "text-purple-500",
      badge: "bg-purple-500",
      pattern: "repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 10px)"
    }
  };

  const currentTheme = themeStyles[theme];

  return (
    <div className={cn(
      "relative group flex flex-col rounded-2xl bg-slate-900 border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl",
      currentTheme.border,
      currentTheme.glow
    )}>
      
      {/* Header / Banner Area */}
      <div className={cn(
        "h-40 relative p-6 flex flex-col justify-center items-center overflow-hidden bg-gradient-to-br",
        currentTheme.header
      )}>
        
        {/* CSS Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ 
            backgroundImage: currentTheme.pattern,
            backgroundSize: theme === 'blue' ? '20px 20px' : '100% 100%' 
          }} 
        />
        
        {/* Floating Decorative Icons (Coins/Gems) */}
        {AccentIcon && (
          <div className="absolute top-4 left-4 animate-bounce duration-[3000ms]">
             <AccentIcon className="w-8 h-8 text-yellow-300 drop-shadow-lg opacity-90" />
          </div>
        )}
        {AccentIcon && (
          <div className="absolute bottom-4 right-10 animate-bounce duration-[4000ms] delay-700">
             <AccentIcon className="w-6 h-6 text-yellow-300 drop-shadow-lg opacity-70" />
          </div>
        )}

        {/* Main Title & Icon */}
        <div className="relative z-10 flex items-center gap-3">
          <h2 className="text-4xl font-black text-white tracking-wide drop-shadow-md">
            {name}
          </h2>
          <MainIcon className={cn(
            "w-8 h-8 text-white drop-shadow-md",
            theme === 'blue' ? 'text-orange-300' : 'text-yellow-300'
          )} />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 flex flex-col gap-6">
        
        {/* Feature List */}
        <ul className="space-y-4 flex-1">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3 text-slate-300 text-sm font-medium leading-relaxed">
              <Scroll className="w-5 h-5 text-amber-200 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Price Action */}
        <div className="mt-auto pt-4">
          <button className={cn(
            "w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-colors",
            "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
            "group-hover:border-slate-600 group-hover:bg-slate-750"
          )}>
            {price} $ <span className="text-slate-400 font-normal text-base">{cycle.labelSuffix}</span>
          </button>
        </div>
      </div>

      {/* Subtle Glow Effect on Hover */}
      <div className={cn(
        "absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-transparent via-transparent to-white/5"
      )} />
    </div>
  );
}
```