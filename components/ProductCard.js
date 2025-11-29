import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';

export default function ProductCard({ product, onAddToCart }) {
  const { user, role } = useAuth();
  const router = useRouter();

  const isOut = product.stock === 0;

  const handleCardClick = () => {
    // navigasi ke halaman detail produk
    router.push(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    // supaya klik tombol tidak ikut trigger klik card
    e.stopPropagation();

    if (!user) {
      alert('Silakan login terlebih dahulu untuk menambah ke keranjang.');
      router.push('/login');
      return;
    }

    onAddToCart(product);
  };

  return (
    <div
      className="product-card"
      data-out={isOut ? 'true' : 'false'}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }} // biar kelihatan bisa diklik
    >
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
        />
      )}

      <h3 className="product-title">{product.name}</h3>

      <p className="product-price">
        Rp {Number(product.price).toLocaleString('id-ID')}
      </p>

      <p className="product-stock">Stok: {product.stock}</p>

      <p className="product-desc">{product.description}</p>

      {/* Tombol hanya muncul untuk role 'user', bukan admin */}
      {role === 'user' && (
        <button
          disabled={isOut}
          onClick={handleAddToCart}
          className="btn-primary"
        >
          {isOut ? 'Stok Habis' : 'Tambah ke Keranjang'}
        </button>
      )}
    </div>
  );
}
