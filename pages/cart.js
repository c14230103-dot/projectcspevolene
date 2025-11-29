import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CartPage() {
  const { cart, changeQty, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((sum, p) => sum + p.price * p.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong.');
      return;
    }

    setLoading(true);
    try {
      // 🔹 Ambil token Supabase untuk autentikasi user di server
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`, // kirim token ke backend
        },
        body: JSON.stringify({ cart }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          `Checkout berhasil!\nTotal: Rp ${data.total.toLocaleString(
            'id-ID'
          )}\nNo. Rekening: ${data.bankAccount}`
        );
        clearCart();
      } else {
        alert(`Checkout gagal: ${data.message}`);
      }
    } catch (e) {
      console.error('Checkout error:', e);
      alert('Checkout gagal. Coba lagi nanti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-page">
      <h1>🛒 Keranjang Belanja</h1>
      {cart.length === 0 ? (
        <p>Keranjang kosong.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>Rp {item.price.toLocaleString('id-ID')}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        changeQty(item.id, Number(e.target.value))
                      }
                      style={{ width: 60 }}
                    />
                  </td>
                  <td>
                    Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                  </td>
                  <td>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn-link danger"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="cart-total">
            Total: Rp {total.toLocaleString('id-ID')}
          </p>
          <button
            className="btn-primary"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? 'Memproses...' : 'Checkout'}
          </button>
        </>
      )}
    </div>
  );
}
