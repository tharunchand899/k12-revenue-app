import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, School, ShieldCheck, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('pricing@school.org');
  const [password, setPassword] = useState('Pricing123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotModal, setForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      // Extract the string message safely
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 z-10">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-sky-600 rounded-xl text-white shadow-lg mb-3">
            <School className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">K-12 Revenue Intelligence</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Enterprise School Group Revenue & Pricing Platform</p>
        </div>

        {/* Demo Persona Chips */}
        <div className="mb-6 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <span className="font-semibold text-slate-600 block mb-2 text-center uppercase tracking-wider text-[10px]">
            ⚡ Click Quick Demo Logins:
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleDemoFill('admin@school.org', 'Admin123!')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-sky-500 text-left font-medium transition"
            >
              👑 Admin
            </button>
            <button
              onClick={() => handleDemoFill('executive@school.org', 'Executive123!')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-sky-500 text-left font-medium transition"
            >
              🏛️ Executive
            </button>
            <button
              onClick={() => handleDemoFill('finance@school.org', 'Finance123!')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-sky-500 text-left font-medium transition"
            >
              💰 Finance Controller
            </button>
            <button
              onClick={() => handleDemoFill('pricing@school.org', 'Pricing123!')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-sky-500 text-left font-medium transition"
            >
              🏷️ Pricing Manager
            </button>
            <button
              onClick={() => handleDemoFill('sales@school.org', 'Sales123!')}
              className="col-span-2 px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:border-sky-500 text-center font-medium transition"
            >
              💼 Sales User (Admissions)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="name@school.org"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setForgotModal(true)}
              className="text-sky-600 hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-sm shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Need a new team account?{' '}
          <Link to="/register" className="text-sky-600 font-bold hover:underline">
            Register User Account
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-sky-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Password Reset Request</h3>
            <p className="text-xs text-slate-600">
              For enterprise security, please contact your School Group Administrator to reset your MFA or JWT auth credentials.
            </p>
            <button
              onClick={() => setForgotModal(false)}
              className="w-full py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
