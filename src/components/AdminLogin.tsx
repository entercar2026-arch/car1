import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { motion } from 'motion/react';
import { ShieldCheck, User, Lock, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToCustomer: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToCustomer,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  // Countdown timer for security lockout
  useEffect(() => {
    if (lockoutTimeLeft <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutTimeLeft > 0) {
      setErrorMsg(`Too many failed attempts. Try again in ${lockoutTimeLeft}s.`);
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    // Simulate database lookup and secure validation
    setTimeout(() => {
      // Clean inputs to avoid accidental spaces
      const sanitizedUsername = username.trim();
      const sanitizedPassword = password.trim();

      if (sanitizedUsername === 'chan' && sanitizedPassword === '181035') {
        setFailedAttempts(0);
        onLoginSuccess();
      } else {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 5) {
          setLockoutTimeLeft(60);
          setErrorMsg('Security lockout triggered: 5 failed attempts. Please wait 60 seconds.');
        } else {
          setErrorMsg(`Invalid administrative credentials. Access Denied. (${5 - nextAttempts} attempts remaining)`);
        }
      }
      setIsLoading(false);
    }, 600);
  };

  return (
    <div id="admin-login-layout" className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
      {/* Decorative Brand Background Element */}
      <div className="absolute top-10 left-10 hidden md:block">
        <button
          id="btn-back-from-login-corner"
          onClick={onBackToCustomer}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 text-stone-600 bg-white hover:bg-stone-50 hover:-translate-y-0.5 transition-all cursor-pointer font-sans text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </button>
      </div>

      <motion.div
        id="login-card-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-100"
      >
        {/* Brand Banner Plate */}
        <div className="bg-[#4C0027] p-8 text-center flex flex-col items-center justify-center border-b border-[#5E0030]/50">
          <BrandLogo size="lg" variant="dark" />
          <h2 className="text-stone-100/80 font-mono tracking-[0.15em] text-xs font-bold uppercase mt-2">
            Secure Portal Verification
          </h2>
        </div>

        {/* Credentials Form */}
        <div className="p-8">
          <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                Administrator Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="input-login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">
                Access Code / Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-stone-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="input-login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-850 text-sm focus:bg-white focus:outline-none focus:border-[#4C0027] focus:ring-1 focus:ring-[#4C0027] transition-all"
                />
                <button
                  type="button"
                  id="btn-toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-[#4C0027] transition-all cursor-pointer"
                  tabIndex={-1}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>


            {/* Warn message */}
            {errorMsg && (
              <motion.div
                id="login-error-alert"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Summit CTA Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading || lockoutTimeLeft > 0}
              className="w-full py-3.5 bg-[#4C0027] hover:bg-[#5E0030] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {lockoutTimeLeft > 0 ? (
                <span>Locked out ({lockoutTimeLeft}s)</span>
              ) : isLoading ? (
                <span>Verifying Security...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Identity</span>
                </>
              )}
            </button>
          </form>

          {/* Prompt warning of security credentials */}
          <div className="mt-8 pt-6 border-t border-stone-100 flex items-start gap-2.5 text-[11px] text-stone-400">
            <ShieldCheck className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-sans">
              Access to this administration terminal is audited. Unauthorized attempts of brute-forcing or reverse-engineering undergo security protocols.
            </p>
          </div>

          <div className="mt-5 text-center block md:hidden">
            <button
              id="btn-back-from-login-mobile"
              onClick={onBackToCustomer}
              className="text-xs font-semibold text-stone-500 hover:text-[#4C0027]"
            >
              Back to Catalog view
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
