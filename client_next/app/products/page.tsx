"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Model";
import API from "@/services/api";
import { Plus } from "lucide-react";

export interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
}

const categories = [
  "Mobile",
  "Electronics",
  "Fashion",
  "Computers",
  "Accessories",
];

export default function Products() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", price: "", category: "" });
  const [editId, setEditId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const limit = 5;
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search input
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1); // reset page
      setSearchTerm(value);
    }, 500);
  };

  // Fetch products
  const getProducts = async (currentPage = page, term = searchTerm) => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(
        `/products?page=${currentPage}&limit=${limit}&search=${term}`,
      );
      setProducts(res.data.data || []);
      setTotalPages(res.data.pagination?.pages || 1);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setProducts([]); // no data
        setTotalPages(1);
      } else {
        setError(err?.response?.data?.message || "Failed to load products");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch on page or searchTerm change
  useEffect(() => {
    getProducts(page, searchTerm);
  }, [page, searchTerm]);

  // Save Product
  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      if (editId) await API.put(`/products/${editId}`, form);
      else await API.post("/products", form);

      setShowForm(false);
      setForm({ name: "", price: "", category: "" });
      setEditId(null);
      getProducts(1, searchTerm);
      setPage(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  // Edit
  const handleEdit = (p: Product) => {
    setForm({ name: p.name, price: String(p.price), category: p.category });
    setEditId(p._id);
    setShowForm(true);
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setLoading(true);
      await API.delete(`/products/${deleteId}`);
      setShowDelete(false);
      getProducts(page, searchTerm);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-bg text-text p-6">
      <div className="max-w-3xl mx-auto bg-card border border-border p-6 shadow rounded-lg">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded flex items-center gap-2 "
            >
              <Plus size={16} />
              Add
            </button>
            <button
              onClick={logout}
              className="bg-secondary text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or category..."
          className="border border-border p-2 rounded w-full mb-4"
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
        />

        {error && <p className="text-danger mb-2 text-center">{error}</p>}

        {/* Table */}
        <table className="w-full border border-border">
          <thead className="bg-bg">
            <tr>
              <th className="p-2 border border-border">Name</th>
              <th className="p-2 border border-border">Category</th>
              <th className="p-2 border border-border">Price</th>
              <th className="p-2 border border-border">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  Loading...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center p-4">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id}>
                  <td className="p-2 border border-border">{p.name}</td>
                  <td className="p-2 border border-border">{p.category}</td>
                  <td className="p-2 border border-border">{p.price}</td>
                  <td className="p-2 border border-border text-center">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-warning px-3 py-1 mr-2 rounded text-white cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(p._id);
                        setShowDelete(true);
                      }}
                      className="bg-danger text-white px-3 py-1 rounded cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            Prev
          </button>
          <span className="px-3 py-1">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Edit Product" : "Add Product"}
      >
        <input
          className="border border-border bg-bg text-text p-2 w-full mb-2 rounded"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="border border-border bg-bg text-text p-2 w-full mb-2 rounded"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        <select
          className="border border-border bg-bg text-text p-2 w-full mb-3 rounded"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          className="bg-primary hover:bg-primary-hover disabled:bg-primary/50 disabled:cursor-not-allowed text-white w-full p-2 rounded cursor-pointer"
          disabled={!form.name || !form.price || !form.category}
        >
          Save
        </button>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        title="Confirm Delete"
      >
        <p className="mb-4">Are you sure?</p>
        <button
          onClick={handleDelete}
          className="bg-danger text-white w-full p-2 rounded cursor-pointer"
        >
          Delete
        </button>
      </Modal>
    </div>
  );
}
