import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/coupons', label: 'Coupons' }
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-[180px_1fr] gap-8">
      <aside className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-visible">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${isActive ? 'bg-ink text-paper' : 'hover:bg-line'}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
