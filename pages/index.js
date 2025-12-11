// pages/index.js
import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();

      if (!res.ok) {
        console.error('API /api/products error:', data);
        setProducts([]);
        return;
      }

      if (!Array.isArray(data)) {
        console.error('Data produk bukan array:', data);
        setProducts([]);
        return;
      }

      setProducts(data);
    } catch (err) {
      console.error('Gagal memuat produk:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  fetchProducts();
}, []);


  return (
    <div>
      {/* HERO ala Evolene */}
      <section className="hero">
        <div>
          <div className="hero-main-title">
            SUPLEMEN FITNESS<br />
            <span className="hero-highlight">UNTUK HASIL YANG NYATA</span>
          </div>
          <p className="hero-subtitle">
            Evolene Official Replica adalah platform E-Commerce suplemen
            dengan katalog lengkap, pengelolaan stok real-time, dan simulasi
            transaksi yang dirancang menyerupai toko resmi Evolene.
          </p>

        </div>

        <div className="hero-card">
          <div>
            <div className="hero-card-title">QUALITY YOU CAN TRACK</div>
            <div className="hero-card-content">
              Semua produk yang tampil di sini terkoneksi langsung dengan
              database: stok berkurang otomatis saat checkout, harga dan
              deskripsi dikelola dari dashboard admin.
            </div>
          </div>
          <div className="hero-pill">
            Simulasi toko resmi Evolene • CSP Project
          </div>
        </div>
      </section>

      {/* SECTION PRODUCT ala Evolene */}
      <section>
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{
              fontSize: '0.8rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            PRODUCT
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.2rem',
              fontWeight: 700,
            }}
          >
            Pilih Suplemen Terbaik Untuk Perjalanan Fitness-mu
          </h2>
        </div>

        {loading ? (
          <p>Memuat produk...</p>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <p>Belum ada produk yang terdaftar. Silakan tambahkan dari dashboard admin.</p>
        ) : (
          <div className="grid-products">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
