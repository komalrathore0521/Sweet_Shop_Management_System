import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { SweetCard } from './SweetCard';
// 🛠️ IMPORTED 'X' HERE
import { Plus, CreditCard as Edit, Package, ChartBar as BarChart3, Settings, X } from 'lucide-react';

interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
}

export const AdminPanel: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const [showRestockModal, setShowRestockModal] = useState<{ sweet: Sweet; quantity: number } | null>(null);

  const fetchSweets = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSweets();
      setSweets(data || []);
    } catch (error) {
      console.error('Failed to fetch sweets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setShowAddForm(true);
  };

  const handleRestock = (sweet: Sweet) => {
    // 🛠️ Restock now opens the modal with the initial sweet data
    setShowRestockModal({ sweet, quantity: 10 });
  };

  const lowStockSweets = sweets.filter(sweet => sweet.quantity < 10);
  const outOfStockSweets = sweets.filter(sweet => sweet.quantity === 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage your sweet inventory and operations</p>
        </div>

        <button
          onClick={() => {
            setEditingSweet(null);
            setShowAddForm(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Sweet
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Sweets</p>
              <p className="text-3xl font-bold">{sweets.length}</p>
            </div>
            <BarChart3 className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-400 to-red-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Out of Stock</p>
              <p className="text-3xl font-bold">{outOfStockSweets.length}</p>
            </div>
            <Package className="h-10 w-10 text-red-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Low Stock</p>
              <p className="text-3xl font-bold">{lowStockSweets.length}</p>
            </div>
            <Package className="h-10 w-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Value</p>
              <p className="text-2xl font-bold">
                ${sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0).toFixed(2)}
              </p>
            </div>
            <Settings className="h-10 w-10 text-green-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>

        {lowStockSweets.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-orange-600 mb-3">Low Stock Alerts</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockSweets.map(sweet => (
                <div key={sweet.id} className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-gray-800">{sweet.name}</h5>
                      <p className="text-sm text-orange-600">{sweet.quantity} remaining</p>
                    </div>
                    <button
                      onClick={() => handleRestock(sweet)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sweets Management */}
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6">Manage Sweets</h3>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sweets.map((sweet) => (
              <SweetCard
                key={sweet.id}
                sweet={sweet}
                onUpdate={fetchSweets}
                onEdit={handleEdit}
                onRestock={handleRestock}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Sweet Modal */}
      {showAddForm && (
        <SweetFormModal
          sweet={editingSweet}
          onClose={() => {
            setShowAddForm(false);
            setEditingSweet(null);
          }}
          onSuccess={() => {
            setShowAddForm(false);
            setEditingSweet(null);
            fetchSweets();
          }}
        />
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <RestockModal
          sweet={showRestockModal.sweet}
          quantity={showRestockModal.quantity}
          onQuantityChange={(quantity) => setShowRestockModal(prev => prev ? { ...prev, quantity } : null)}
          onClose={() => setShowRestockModal(null)}
          onSuccess={() => {
            setShowRestockModal(null);
            fetchSweets();
          }}
        />
      )}
    </div>
  );
};

// Sweet Form Modal Component
interface SweetFormModalProps {
  sweet: Sweet | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SweetFormModal: React.FC<SweetFormModalProps> = ({ sweet, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: sweet?.name || '',
    category: sweet?.category || '',
    price: sweet?.price.toString() || '',
    quantity: sweet?.quantity.toString() || '',
    description: sweet?.description || '',
    image: sweet?.image || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const sweetData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description,
        image: formData.image,
      };

      if (sweet) {
        await apiService.updateSweet(sweet.id, sweetData);
      } else {
        await apiService.createSweet(sweetData);
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to save sweet:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 🛠️ MODAL HEADER WITH CLOSE BUTTON (Now using imported X icon) */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {sweet ? 'Edit Sweet' : 'Add New Sweet'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
              title="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          {/* END MODAL HEADER */}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {loading ? 'Saving...' : sweet ? 'Update Sweet' : 'Add Sweet'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Restock Modal Component
interface RestockModalProps {
  sweet: Sweet;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const RestockModal: React.FC<RestockModalProps> = ({
  sweet,
  quantity,
  onQuantityChange,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);

  const handleRestock = async () => {
    setLoading(true);
    try {
      await apiService.restockSweet(sweet.id, quantity);
      onSuccess();
    } catch (error) {
      console.error('Restock failed:', error);
      alert('Restock failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Restock Sweet</h3>

          <div className="mb-6">
            <p className="text-gray-600 mb-2">Sweet: <span className="font-semibold">{sweet.name}</span></p>
            <p className="text-gray-600 mb-4">Current Stock: <span className="font-semibold">{sweet.quantity}</span></p>

            <label className="block text-sm font-medium text-gray-700 mb-2">Add Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />

            <p className="text-sm text-gray-500 mt-2">
              New stock will be: <span className="font-semibold">{sweet.quantity + quantity}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleRestock}
              disabled={loading || quantity <= 0}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
            >
              {loading ? 'Restocking...' : `Restock +${quantity}`}
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};