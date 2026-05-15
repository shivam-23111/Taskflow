import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { IoEyeOffOutline, IoEyeOutline, IoLockClosedOutline, IoMailOutline } from 'react-icons/io5';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-dark-50">Welcome back</h2>
        <p className="mt-1 text-dark-400">Sign in to your TaskFlow workspace</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-300">
            Email
          </label>
          <div className="relative">
            <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-dark-700 bg-dark-900 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-dark-300">
            Password
          </label>
          <div className="relative">
            <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" size={18} />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-lg border border-dark-700 bg-dark-900 py-2.5 pl-10 pr-10 text-dark-100 placeholder-dark-600 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 transition-colors hover:text-dark-300"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IoEyeOffOutline size={18} /> : <IoEyeOutline size={18} />}
            </button>
          </div>
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-500 py-2.5 font-semibold text-dark-950 transition-colors duration-200 hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-t-2 border-dark-950" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-dark-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-medium text-primary-400 transition-colors hover:text-primary-300">
          Sign up
        </Link>
      </p>
    </>
  );
};

export default LoginPage;
