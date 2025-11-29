// pages/api/checkout.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL dan ANON KEY harus di-set di .env.local');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { cart } = req.body;

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: 'Keranjang kosong' });
  }

  // Ambil token dari header Authorization: Bearer <token>
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  // Buat client Supabase khusus server dengan header Authorization
  const supabaseServer = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    },
  });

  // Ambil user yang sedang login (berdasarkan token)
  const {
    data: { user },
    error: userError,
  } = await supabaseServer.auth.getUser();

  if (userError) {
    console.error('Error getUser:', userError);
    return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
  }

  if (!user) {
    return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
  }

  const userId = user.id;

  // Ambil data produk dari database berdasarkan id di cart
  const ids = cart.map((item) => item.id);
  const { data: products, error: productsError } = await supabaseServer
    .from('products')
    .select('*')
    .in('id', ids);

  if (productsError) {
    console.error('Error ambil produk:', productsError);
    return res.status(500).json({ message: productsError.message });
  }

  // Validasi stok
  for (const item of cart) {
    const productInDb = products.find((p) => p.id === item.id);
    if (!productInDb) {
      return res
        .status(400)
        .json({ message: `Produk ${item.name} tidak ditemukan` });
    }
    if (item.quantity > productInDb.stock) {
      return res.status(400).json({
        message: `Stok ${productInDb.name} tidak mencukupi (tersisa ${productInDb.stock})`,
      });
    }
  }

  // Hitung total
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Update stok di database
  for (const item of cart) {
    const productInDb = products.find((p) => p.id === item.id);
    const newStock = productInDb.stock - item.quantity;

    const { error: updateError } = await supabaseServer
      .from('products')
      .update({ stock: newStock })
      .eq('id', productInDb.id);

    if (updateError) {
      console.error('Error update stok:', updateError);
      return res.status(500).json({ message: updateError.message });
    }
  }

  // Simulasi penyimpanan order (supaya bisa ditunjukkan di laporan CSP)
  const randomBank = generateRandomBankAccount();

  const { error: orderErr } = await supabaseServer.from('orders').insert({
    user_id: userId,
    total_amount: total,
    bank_account: randomBank,
  });

  if (orderErr) {
    console.error('Error insert order:', orderErr);
    return res.status(500).json({ message: orderErr.message });
  }

  return res.status(200).json({
    success: true,
    total,
    bankAccount: randomBank,
  });
}

function generateRandomBankAccount() {
  const bankNames = ['BCA', 'BNI', 'BRI', 'Mandiri', 'CIMB'];
  const bank = bankNames[Math.floor(Math.random() * bankNames.length)];
  const number =
    Math.floor(Math.random() * 9000000000) + 1000000000; // 10 digit
  return `${bank} - ${number}`;
}
