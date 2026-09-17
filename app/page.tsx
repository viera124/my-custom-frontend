"use client";

import { FormEvent, useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
};

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [products, setProducts] = useState<Product[]>([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =========================
  // GET PRODUCTS
  // =========================
  async function getProducts() {
    try {
      setLoading(true);
      setError("");

      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL belum ditemukan.");
      }

      const response = await fetch(`${API_URL}/api/products`);

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal mengambil data produk"
        );
      }

      setProducts(result.data ?? []);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  // =========================
  // RESET FORM
  // =========================
  function resetForm() {
    setName("");
    setPrice("");
    setStock("");
    setEditingId(null);
  }

  // =========================
  // TAMBAH / EDIT
  // =========================
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    if (price === "" || Number(price) < 0) {
      setError("Harga produk tidak valid.");
      return;
    }

    if (stock === "" || Number(stock) < 0) {
      setError("Stok produk tidak valid.");
      return;
    }

    try {
      setSaving(true);

      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL belum ditemukan.");
      }

      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/api/products/${editingId}`
        : `${API_URL}/api/products`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          stock: Number(stock),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menyimpan produk"
        );
      }

      setMessage(
        isEditing
          ? "Produk berhasil diubah."
          : "Produk berhasil ditambahkan."
      );

      resetForm();

      await getProducts();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // EDIT
  // =========================
  function handleEdit(product: Product) {
    setEditingId(product.id);
    setName(product.name);
    setPrice(String(product.price));
    setStock(String(product.stock));

    setError("");
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // DELETE
  // =========================
  async function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus produk ini?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");
      setMessage("");

      if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL belum ditemukan.");
      }

      const response = await fetch(
        `${API_URL}/api/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Gagal menghapus produk"
        );
      }

      setMessage("Produk berhasil dihapus.");

      if (editingId === id) {
        resetForm();
      }

      await getProducts();
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Produk
          </h1>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-5 rounded-lg border border-green-300 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* FORM */}
        <section className="mb-8 rounded-xl bg-white p-6 shadow-md">
          <h2 className="mb-5 text-xl font-bold text-gray-900">
            {editingId !== null
              ? "Edit Produk"
              : "Tambah Produk"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-3"
          >

            {/* NAMA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nama Produk
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Laptop"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            {/* HARGA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Harga
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Contoh: 5000000"
                min="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            {/* STOK */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Stok
              </label>

              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="Contoh: 10"
                min="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            {/* BUTTON */}
            <div className="flex gap-3 md:col-span-3">

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Menyimpan..."
                  : editingId !== null
                  ? "Simpan Perubahan"
                  : "Tambah Produk"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-gray-500 px-6 py-3 font-semibold text-white hover:bg-gray-600"
                >
                  Batal
                </button>
              )}

            </div>
          </form>
        </section>

        {/* DATA PRODUK */}
        <section className="rounded-xl bg-white p-6 shadow-md">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Daftar Produk
            </h2>

            <button
              onClick={getProducts}
              className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-gray-500">
              Loading...
            </div>
          ) : products.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              Belum ada produk.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] border-collapse">

                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      ID
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Nama
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Harga
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Stok
                    </th>

                    <th className="px-4 py-4 text-sm font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-4 text-gray-700">
                        {product.id}
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-900">
                        {product.name}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        Rp{" "}
                        {Number(product.price).toLocaleString(
                          "id-ID"
                        )}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {product.stock}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">

                          <button
                            onClick={() => handleEdit(product)}
                            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(product.id)
                            }
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                          >
                            Hapus
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}