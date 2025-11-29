// pages/product/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function ProductDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { addToCart } = useCart();
  const { user, role } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Gagal memuat produk');
      }
      setProduct(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambah ke keranjang.');
      router.push('/login');
      return;
    }
    addToCart(product);
  };

  if (loading) {
    return <p>Memuat detail produk...</p>;
  }

  if (!product) {
    return <p>Produk tidak ditemukan.</p>;
  }

  const isOut = product.stock === 0;

  return (
    <div className="product-detail-page">
      <button className="btn-link" onClick={() => router.back()}>
        ← Kembali
      </button>

      <div className="product-detail-layout">
        <div className="product-detail-image-wrapper">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="product-detail-image"
            />
          ) : (
            <div className="product-detail-image placeholder">
              Tidak ada gambar
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <h1 className="product-detail-title">{product.name}</h1>

          <p className="product-detail-price">
            Rp {Number(product.price).toLocaleString('id-ID')}
          </p>

          <p className="product-detail-stock">
            Stok:{' '}
            <span className={isOut ? 'out' : 'in'}>
              {isOut ? 'Habis' : product.stock}
            </span>
          </p>

          <p className="product-detail-desc">{product.description}</p>

          {role === 'user' && (
            <button
              className="btn-primary"
              disabled={isOut}
              onClick={handleAddToCart}
              style={{ marginTop: '12px' }}
            >
              {isOut ? 'Stok Habis' : 'Tambah ke Keranjang'}
            </button>
          )}
          {role === 'admin' && (
            <p
              style={{
                marginTop: '12px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
              }}
            >
              Anda login sebagai <strong>Admin</strong>. Tambah ke keranjang
              hanya tersedia untuk User biasa.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
