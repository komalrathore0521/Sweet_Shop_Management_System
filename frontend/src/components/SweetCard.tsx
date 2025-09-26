import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { ShoppingCart, CreditCard as Edit, Trash2, Package, DollarSign } from 'lucide-react';

interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
}

interface SweetCardProps {
  sweet: Sweet;
  onUpdate: () => void;
  onEdit?: (sweet: Sweet) => void;
}

export const SweetCard: React.FC<SweetCardProps> = ({ sweet, onUpdate, onEdit }) => {
  const { isAdmin } = useAuth();
  const [purchasing, setPurchasing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await apiService.purchaseSweet(sweet.id);
      onUpdate();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${sweet.name}"?`)) return;

    setDeleting(true);
    try {
      await apiService.deleteSweet(sweet.id);
      onUpdate();
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const defaultImage = `https://images.pexels.com/photos/1028714/pexels-photo-1028714.jpeg?auto=compress&cs=tinysrgb&w=400`;

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
      <div className="relative">
        <img
          src={sweet.image || defaultImage}
          alt={sweet.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {sweet.category}
          </span>
        </div>
        <div className="absolute top-4 right-4">
          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
            <DollarSign className="h-4 w-4 mr-1" />
            {sweet.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{sweet.name}</h3>
            {sweet.description && (
              <p className="text-gray-600 text-sm leading-relaxed">{sweet.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-gray-500" />
            <span className={`text-sm font-medium ${
              sweet.quantity === 0 ? 'text-red-600' : sweet.quantity < 10 ? 'text-orange-600' : 'text-green-600'
            }`}>
              {sweet.quantity === 0 ? 'Out of Stock' : `${sweet.quantity} in stock`}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePurchase}
            disabled={sweet.quantity === 0 || purchasing}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
              sweet.quantity === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {purchasing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            ) : (
              <ShoppingCart className="h-4 w-4 mr-2" />
            )}
            {purchasing ? 'Purchasing...' : sweet.quantity === 0 ? 'Out of Stock' : 'Purchase'}
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => onEdit?.(sweet)}
                className="p-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors duration-200"
                title="Edit Sweet"
              >
                <Edit className="h-4 w-4" />
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors duration-200 disabled:opacity-50"
                title="Delete Sweet"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};