import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Layout({ children }) {
  const { user, role, signOut } = useAuth();
  const { cart } = useCart();

  const totalQty = cart.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="app-root">
      <header className="navbar">
        <div className="navbar-left">
          <Link href="/"><span className="logo">Evolene Official Replica</span></Link>
        </div>
        <div className="navbar-right">
          <Link href="/">Produk</Link>
          {role === 'user' && <Link href="/cart">🛒 Keranjang ({totalQty})</Link>}
          {role === 'admin' && <Link href="/admin">Admin</Link>}
          {!user && (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup">Daftar</Link>
            </>
          )}
          {user && <button onClick={signOut} className="btn-link">Logout</button>}
        </div>
      </header>

      <main className="main-container">{children}</main>
    </div>
  );
}
