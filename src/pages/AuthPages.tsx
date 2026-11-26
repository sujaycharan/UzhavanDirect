import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, KeyRound, ShieldCheck, Sprout, UserCheck } from 'lucide-react';
import { PublicLayout } from '@/src/components/layout/PublicLayout';
import {
  Button,
  Card,
  DisclaimerNotice,
  Input,
  SelectField,
} from '@/src/components/ui/primitives';
import { useAppData } from '@/src/context/AppDataContext';
import { TAMIL_NADU_DISTRICTS, type TamilNaduDistrict } from '@/src/types';

const DEMO_ACCOUNTS = [
  {
    role: 'Farmer',
    label: 'Ramesh Sundaram (Trichy)',
    email: 'farmer@uzhavandirect.demo',
    password: 'farmer123',
    summary: 'List produce, compare market prices, manage orders & smart farming tools.',
    icon: <Sprout className="h-4 w-4 text-[#166534]" />,
  },
  {
    role: 'Customer',
    label: 'Priya Ramanathan (Trichy)',
    email: 'customer@uzhavandirect.demo',
    password: 'customer123',
    summary: 'Browse direct farm produce, compare rates, checkout & track orders.',
    icon: <UserCheck className="h-4 w-4 text-[#166534]" />,
  },
  {
    role: 'Administrator',
    label: 'Suresh Mani (Operations)',
    email: 'admin@uzhavandirect.demo',
    password: 'admin123',
    summary: 'View marketplace analytics, moderate listings, review reports & reset demo.',
    icon: <ShieldCheck className="h-4 w-4 text-[#166534]" />,
  },
];

export function LoginPage() {
  const { login } = useAppData();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error || 'Login failed');
      return;
    }
    if (result.role === 'farmer') navigate('/farmer');
    else if (result.role === 'admin') navigate('/admin');
    else navigate('/customer');
  };

  const handleAutofill = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Login Form */}
          <Card className="lg:col-span-6 p-6 sm:p-8">
            <h1 className="font-display text-2xl font-bold text-[#1F2937]">
              Sign in to Uzhavan Direct
            </h1>
            <p className="mt-1.5 text-sm text-[#526058]">
              Access your Farmer, Customer, or Administrator workspace.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[#1F2937]">
                  Email address
                </label>
                <Input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@uzhavandirect.demo"
                  className="mt-1.5"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-[#1F2937]">
                  Password
                </label>
                <Input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1.5"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-[#DC2626]">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" size="lg">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-[#526058]">
              New to the prototype?{' '}
              <Link to="/register" className="font-semibold text-[#166534] hover:underline">
                Register a demo account
              </Link>
            </p>

            <DisclaimerNotice
              text="Local prototype authentication stored in browser LocalStorage — intended for demonstration only, not production security."
              className="mt-6"
            />
          </Card>

          {/* One-Click Demo Account Fill Cards */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#1F2937]">
                One-Click Demo Credentials
              </h2>
              <p className="mt-1 text-sm text-[#526058]">
                Click any role card below to fill its email and password into the login form immediately.
              </p>
            </div>

            <div className="space-y-3">
              {DEMO_ACCOUNTS.map((acc) => (
                <Card key={acc.role} className="p-4 hover:border-[#166534]/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {acc.icon}
                        <span className="font-display text-sm font-semibold text-[#1F2937]">
                          {acc.role} · {acc.label}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#526058] leading-relaxed">{acc.summary}</p>
                      <p className="mt-2 font-mono text-xs text-[#374151]">
                        {acc.email} · <span className="text-[#6B786F]">pw:</span> {acc.password}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleAutofill(acc.email, acc.password)}
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Fill
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'farmer' ? 'farmer' : 'customer';

  const { register } = useAppData();
  const navigate = useNavigate();

  const [role, setRole] = useState<'farmer' | 'customer'>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState<TamilNaduDistrict>('Trichy');
  const [address, setAddress] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState('4');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setError('Please complete all required fields.');
      return;
    }

    const res = register({
      name,
      email,
      password,
      role,
      phone,
      district,
      address,
      farmName: role === 'farmer' ? farmName : undefined,
      farmSizeAcres: role === 'farmer' ? Number(farmSizeAcres) || 2 : undefined,
    });

    if (!res.ok) {
      setError(res.error || 'Registration failed');
      return;
    }

    navigate(role === 'farmer' ? '/farmer' : '/customer');
  };

  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card className="p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-[#1F2937]">
            Create a Demo Account
          </h1>
          <p className="mt-1.5 text-sm text-[#526058]">
            Register as a Tamil Nadu Farmer or Customer. User-created accounts are stored separately from seeded sample accounts in LocalStorage.
          </p>

          {/* Role Segmented Toggle */}
          <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg bg-[#EEF4EB] p-1">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`rounded-md py-2 text-sm font-medium transition-colors cursor-pointer ${
                role === 'farmer'
                  ? 'bg-white text-[#166534] font-semibold shadow-xs'
                  : 'text-[#4B594F] hover:text-[#1F2937]'
              }`}
            >
              Join as a Farmer
            </button>
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`rounded-md py-2 text-sm font-medium transition-colors cursor-pointer ${
                role === 'customer'
                  ? 'bg-white text-[#166534] font-semibold shadow-xs'
                  : 'text-[#4B594F] hover:text-[#1F2937]'
              }`}
            >
              Join as a Customer
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Full Name *</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Senthil Kumar"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Phone (Demo) *</label>
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98421 00000"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Email Address *</label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">Password *</label>
                <Input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">District *</label>
                <SelectField
                  value={district}
                  onChange={(e) => setDistrict(e.target.value as TamilNaduDistrict)}
                  className="mt-1.5"
                >
                  {TAMIL_NADU_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1F2937]">
                  {role === 'farmer' ? 'Village / Farm Address *' : 'Delivery Address *'}
                </label>
                <Input
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, Town, PIN"
                  className="mt-1.5"
                />
              </div>
            </div>

            {role === 'farmer' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-[#EEF2EB]">
                <div>
                  <label className="block text-sm font-medium text-[#1F2937]">Farm Name</label>
                  <Input
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g., Green Valley Farms"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1F2937]">
                    Farm Size (Acres)
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={farmSizeAcres}
                    onChange={(e) => setFarmSizeAcres(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-sm font-medium text-[#DC2626]">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg">
              Create {role === 'farmer' ? 'Farmer' : 'Customer'} Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[#526058]">
            Already have a demo account?{' '}
            <Link to="/login" className="font-semibold text-[#166534] hover:underline">
              Sign in here
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}
