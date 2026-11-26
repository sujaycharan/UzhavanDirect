import React, { useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  Activity,
  Ban,
  CheckCircle2,
  Flag,
  LayoutDashboard,
  Package,
  RotateCcw,
  ShoppingBag,
  Sprout,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardLayout, type SidebarNavItem } from '@/src/components/layout/DashboardLayout';
import {
  Button,
  Card,
  ConfirmDialog,
  DisclaimerNotice,
  EmptyState,
  OrderStatusLabel,
} from '@/src/components/ui/primitives';
import { useAppData } from '@/src/context/AppDataContext';
import { useLanguage } from '@/src/context/LanguageContext';
import { UNIT_SHORT_MAP } from '@/src/types';
import { formatDate, formatDateTime, formatINR } from '@/src/lib/utils';

const CHART_COLORS = ['#166534', '#22C55E', '#EAB308', '#0F766E', '#64748B', '#CA8A04'];

/* ── Admin Overview & Live Analytics ── */
function AdminOverview() {
  const { users, products, orders, reports, resetDemoData } = useAppData();
  const [resetOpen, setResetOpen] = useState(false);

  const farmers = users.filter((u) => u.role === 'farmer');
  const customers = users.filter((u) => u.role === 'customer');
  const completedOrders = orders.filter((o) => o.status === 'Delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled');
  const activeValue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((s, o) => s + o.totalAmount, 0);

  // Chart 1: Farmer Registrations by District
  const farmersByDistrict = useMemo(() => {
    const counts: Record<string, number> = {};
    farmers.forEach((f) => {
      counts[f.district] = (counts[f.district] || 0) + 1;
    });
    return Object.entries(counts).map(([district, count]) => ({ district, count }));
  }, [farmers]);

  // Chart 2: Product Categories
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Chart 3: Orders by Status
  const ordersByStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [orders]);

  // Chart 4: Marketplace Value by District
  const valueByDistrict = useMemo(() => {
    const totals: Record<string, number> = {};
    orders
      .filter((o) => o.status !== 'Cancelled')
      .forEach((o) => {
        totals[o.district] = (totals[o.district] || 0) + o.totalAmount;
      });
    return Object.entries(totals).map(([district, total]) => ({ district, total }));
  }, [orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1F2937]">
            Platform Analytics & Demonstration Controls
          </h2>
          <p className="text-sm text-[#526058]">
            Every figure below is computed live from current LocalStorage state.
          </p>
        </div>
        <Button variant="outline" onClick={() => setResetOpen(true)}>
          <RotateCcw className="h-4 w-4 text-[#DC2626]" />
          Reset Demo Data
        </Button>
      </div>

      <DisclaimerNotice text="Administrator view over local prototype data. Reset Demo Data restores all seeded farmers, customers, products, orders, and notifications." />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
        {[
          { label: 'Farmers', value: farmers.length },
          { label: 'Customers', value: customers.length },
          { label: 'Listed Products', value: products.length },
          { label: 'Total Orders', value: orders.length },
          { label: 'Completed', value: completedOrders.length },
          { label: 'Cancelled', value: cancelledOrders.length },
          { label: 'Est. GMV', value: formatINR(activeValue) },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-xs text-[#526058]">{kpi.label}</p>
            <p className="mt-1.5 font-mono text-xl font-bold text-[#166534] tabular-nums">
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      {/* 4 Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-[#1F2937] mb-4">
            Farmer Registrations by District
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={farmersByDistrict}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#526058' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#526058' }} />
                <Tooltip />
                <Bar dataKey="count" name="Farmers" fill="#166534" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-[#1F2937] mb-4">
            Product Listings by Category
          </h3>
          <div className="h-60 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name} (${value})`}
                >
                  {categoryData.map((entry, idx) => (
                    <Cell key={entry.name} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-[#1F2937] mb-4">
            Orders by Status
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#526058' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#526058' }} />
                <Tooltip />
                <Bar dataKey="count" name="Orders" fill="#22C55E" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display text-base font-semibold text-[#1F2937] mb-4">
            Marketplace Activity (Transaction Value by District)
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={valueByDistrict}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EEE4" />
                <XAxis dataKey="district" tick={{ fontSize: 11, fill: '#526058' }} />
                <YAxis tick={{ fontSize: 11, fill: '#526058' }} />
                <Tooltip formatter={(val) => [formatINR(Number(val ?? 0)), 'Order Value']} />
                <Bar dataKey="total" name="Value (₹)" fill="#EAB308" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Open Reports Notice */}
      {reports.some((r) => r.status === 'open') && (
        <DisclaimerNotice
          tone="warning"
          text={`${reports.filter((r) => r.status === 'open').length} open listing report(s) are waiting in the Reported Listings queue.`}
        />
      )}

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset All Prototype Demo Data?"
        description="This will erase any newly created listings, orders, and user accounts from LocalStorage and restore the original seeded Tamil Nadu dataset."
        confirmLabel="Reset Demo Data"
        destructive
        onConfirm={resetDemoData}
      />
    </div>
  );
}

/* ── Admin Farmers & Customers Directories ── */
function AdminUsersTable({ role }: { role: 'farmer' | 'customer' }) {
  const { users, products, orders } = useAppData();
  const list = users.filter((u) => u.role === role);

  return (
    <Card className="overflow-x-auto">
      <div className="p-5 border-b border-[#EEF2EB]">
        <h2 className="font-display text-lg font-semibold text-[#1F2937]">
          {role === 'farmer' ? `Registered Farmers (${list.length})` : `Registered Customers (${list.length})`}
        </h2>
        <p className="text-xs text-[#526058]">
          Distinguishes between preloaded demonstration accounts and newly registered user accounts.
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#E2E8DF] bg-[#F8FAF5] text-xs text-[#526058]">
            <th className="px-4 py-3 font-medium">Name & Email</th>
            <th className="px-4 py-3 font-medium">District</th>
            <th className="px-4 py-3 font-medium">Account Type</th>
            <th className="px-4 py-3 font-medium text-right">
              {role === 'farmer' ? 'Listings' : 'Orders Placed'}
            </th>
            <th className="px-4 py-3 font-medium text-right">
              {role === 'farmer' ? 'Sales Value' : 'Total Spend'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF2EB]">
          {list.map((u) => {
            const count =
              role === 'farmer'
                ? products.filter((p) => p.farmerId === u.id).length
                : orders.filter((o) => o.customerId === u.id).length;
            const total =
              role === 'farmer'
                ? orders
                    .filter((o) => o.farmerId === u.id && o.status !== 'Cancelled')
                    .reduce((s, o) => s + o.subtotal, 0)
                : orders
                    .filter((o) => o.customerId === u.id && o.status !== 'Cancelled')
                    .reduce((s, o) => s + o.totalAmount, 0);

            return (
              <tr key={u.id} className="hover:bg-[#FAFDF8]">
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#1F2937]">{u.name}</p>
                  <p className="text-xs text-[#6B786F]">
                    {u.email}
                    {u.farmName ? ` · ${u.farmName}` : ''}
                  </p>
                </td>
                <td className="px-4 py-3 text-xs text-[#374151]">{u.district}</td>
                <td className="px-4 py-3 text-xs font-medium">
                  <span className={u.isDemoAccount ? 'text-[#526058]' : 'text-[#166534] font-semibold'}>
                    {u.isDemoAccount ? 'Demo Profile' : 'Newly Registered'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{count}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-[#166534] tabular-nums">
                  {formatINR(total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/* ── Admin All Listings Moderation ── */
function AdminListingsTable() {
  const { products, adminToggleProductStatus } = useAppData();

  return (
    <Card className="overflow-x-auto">
      <div className="p-5 border-b border-[#EEF2EB]">
        <h2 className="font-display text-lg font-semibold text-[#1F2937]">
          All Product Listings ({products.length})
        </h2>
        <p className="text-xs text-[#526058]">
          Disable or restore demonstration listings across the marketplace.
        </p>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#E2E8DF] bg-[#F8FAF5] text-xs text-[#526058]">
            <th className="px-4 py-3 font-medium">Product</th>
            <th className="px-4 py-3 font-medium">Farmer & District</th>
            <th className="px-4 py-3 font-medium text-right">Price</th>
            <th className="px-4 py-3 font-medium text-right">Stock</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF2EB]">
          {products.map((p) => {
            const isDisabled = p.status === 'disabled_by_admin';
            return (
              <tr key={p.id} className="hover:bg-[#FAFDF8]">
                <td className="px-4 py-3">
                  <p className="font-semibold text-[#1F2937]">{p.name}</p>
                  <p className="text-xs text-[#6B786F]">{p.category}</p>
                </td>
                <td className="px-4 py-3 text-xs text-[#374151]">
                  {p.farmerName} · {p.district}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {formatINR(p.sellingPrice)}/{UNIT_SHORT_MAP[p.unit]}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">
                  {p.availableQuantity}
                </td>
                <td className="px-4 py-3 text-xs font-semibold">
                  <span
                    className={
                      p.status === 'active'
                        ? 'text-[#166534]'
                        : isDisabled
                        ? 'text-[#DC2626]'
                        : 'text-[#6B786F]'
                    }
                  >
                    {p.status === 'active'
                      ? 'Active'
                      : isDisabled
                      ? 'Disabled by Admin'
                      : 'Paused / Out'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant={isDisabled ? 'secondary' : 'outline'}
                    onClick={() => adminToggleProductStatus(p.id)}
                  >
                    {isDisabled ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Re-enable
                      </>
                    ) : (
                      <>
                        <Ban className="h-3.5 w-3.5 text-[#DC2626]" />
                        Disable
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/* ── Admin All Orders ── */
function AdminOrdersTable() {
  const { orders } = useAppData();

  return (
    <Card className="overflow-x-auto">
      <div className="p-5 border-b border-[#EEF2EB]">
        <h2 className="font-display text-lg font-semibold text-[#1F2937]">
          All Marketplace Orders ({orders.length})
        </h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[#E2E8DF] bg-[#F8FAF5] text-xs text-[#526058]">
            <th className="px-4 py-3 font-medium">Order ID</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Farmer</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium text-right">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF2EB]">
          {orders.map((o) => (
            <tr key={o.id} className="hover:bg-[#FAFDF8]">
              <td className="px-4 py-3 font-mono text-xs font-semibold text-[#166534]">#{o.id}</td>
              <td className="px-4 py-3 text-xs text-[#1F2937]">{o.customerName}</td>
              <td className="px-4 py-3 text-xs text-[#374151]">{o.farmerName}</td>
              <td className="px-4 py-3 text-xs capitalize text-[#526058]">{o.orderType}</td>
              <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums">
                {formatINR(o.totalAmount)}
              </td>
              <td className="px-4 py-3">
                <OrderStatusLabel status={o.status} />
              </td>
              <td className="px-4 py-3 text-xs text-[#6B786F]">{formatDate(o.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* ── Admin Reported Listings ── */
function AdminReportsView() {
  const { reports, products, updateReportStatus, adminToggleProductStatus } = useAppData();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-bold text-[#1F2937]">
          Reported Listings Queue ({reports.length})
        </h2>
        <p className="text-sm text-[#526058]">
          Review buyer reports and take moderation actions on flagged produce listings.
        </p>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon={<Flag className="h-6 w-6" />}
          title="No reported listings"
          description="Any reports submitted from product detail pages will appear here."
        />
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => {
            const linkedProduct = products.find((p) => p.id === rep.productId);
            const isDisabled = linkedProduct?.status === 'disabled_by_admin';
            return (
              <Card key={rep.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-[#526058]">
                    Reported by {rep.reportedBy} · {formatDateTime(rep.createdAt)} ·{' '}
                    <span className="capitalize font-semibold text-[#166534]">{rep.status}</span>
                  </p>
                  <h3 className="font-display text-base font-semibold text-[#1F2937]">
                    {rep.productName} ({rep.farmerName})
                  </h3>
                  <p className="text-sm text-[#4B594F]">{rep.reason}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {linkedProduct && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => adminToggleProductStatus(linkedProduct.id)}
                    >
                      {isDisabled ? 'Restore Listing' : 'Disable Listing'}
                    </Button>
                  )}
                  {rep.status !== 'resolved' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => updateReportStatus(rep.id, 'resolved')}
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Admin Platform Activity ── */
function AdminActivityView() {
  const { activityLogs } = useAppData();

  return (
    <Card className="divide-y divide-[#EEF2EB]">
      <div className="p-5">
        <h2 className="font-display text-lg font-semibold text-[#1F2937]">
          Platform Activity Log ({activityLogs.length})
        </h2>
        <p className="text-xs text-[#526058]">
          Chronological audit feed of registrations, listings, orders, and moderation events.
        </p>
      </div>
      {activityLogs.map((log) => (
        <div key={log.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#1F2937]">
              {log.action} · <span className="font-normal text-[#526058]">{log.actorName} ({log.actorRole})</span>
            </p>
            <p className="text-xs text-[#4B594F] mt-0.5">{log.details}</p>
          </div>
          <span className="font-mono text-xs text-[#6B786F] shrink-0">
            {formatDateTime(log.createdAt)}
          </span>
        </div>
      ))}
    </Card>
  );
}

/* ── Main Admin Dashboard Router ── */
export function AdminDashboard() {
  const { currentUser, reports } = useAppData();
  const { t } = useLanguage();

  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'admin') {
    return <Navigate to={currentUser.role === 'farmer' ? '/farmer' : '/customer'} replace />;
  }

  const openReportsCount = reports.filter((r) => r.status === 'open').length;

  const navItems: SidebarNavItem[] = [
    { to: '/admin', label: t('adminOverview'), icon: <LayoutDashboard className="h-4 w-4" />, end: true },
    { to: '/admin/farmers', label: t('farmersDirectory'), icon: <Sprout className="h-4 w-4" /> },
    { to: '/admin/customers', label: t('customersDirectory'), icon: <Users className="h-4 w-4" /> },
    { to: '/admin/listings', label: t('allListings'), icon: <Package className="h-4 w-4" /> },
    { to: '/admin/orders', label: t('allOrders'), icon: <ShoppingBag className="h-4 w-4" /> },
    {
      to: '/admin/reports',
      label: t('reportedListings'),
      icon: <Flag className="h-4 w-4" />,
      badge: openReportsCount,
    },
    { to: '/admin/activity', label: t('platformActivity'), icon: <Activity className="h-4 w-4" /> },
  ];

  return (
    <Routes>
      <Route
        index
        element={
          <DashboardLayout roleTitle="Administrator" pageTitle={t('adminOverview')} navItems={navItems}>
            <AdminOverview />
          </DashboardLayout>
        }
      />
      <Route
        path="farmers"
        element={
          <DashboardLayout roleTitle="Administrator" pageTitle={t('farmersDirectory')} navItems={navItems}>
            <AdminUsersTable role="farmer" />
          </DashboardLayout>
        }
      />
      <Route
        path="customers"
        element={
          <DashboardLayout roleTitle="Administrator" pageTitle={t('customersDirectory')} navItems={navItems}>
            <AdminUsersTable role="customer" />
          </DashboardLayout>
        }
      />
      <Route
        path="listings"
        element={
          <DashboardLayout roleTitle="Administrator" pageTitle={t('allListings')} navItems={navItems}>
            <AdminListingsTable />
          </DashboardLayout>
        }
      />
      <Route
        path="orders"
        element={
          <DashboardLayout roleTitle="Administrator" pageTitle={t('allOrders')} navItems={navItems}>
            <AdminOrdersTable />
          </DashboardLayout>
        }
      />
      <Route
        path="reports"
        element={
          <DashboardLayout roleTitle="Administrator" pageTitle={t('reportedListings')} navItems={navItems}>
            <AdminReportsView />
          </DashboardLayout>
        }
      />
      <Route
        path="activity"
        element={
          <DashboardLayout roleTitle="Administrator" pageTitle={t('platformActivity')} navItems={navItems}>
            <AdminActivityView />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}
