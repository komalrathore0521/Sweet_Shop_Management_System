import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { ShoppingCart, CreditCard as Edit, Trash2, Package, DollarSign, TrendingUp } from 'lucide-react';

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
  onRestock?: (sweet: Sweet) => void;
}

export const SweetCard: React.FC<SweetCardProps> = ({ sweet, onUpdate, onEdit, onRestock }) => {
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
      // Use a custom modal or message box instead of alert
      // For now, a simple log is sufficient
      console.log('Purchase failed. Please try again or check if sweet is in stock.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleDelete = async () => {
    // You should use a custom modal for this instead of confirm().
    // We will log a message for now to prevent the app from hanging.
    console.log(`User wants to delete "${sweet.name}".`);

    setDeleting(true);
    try {
      await apiService.deleteSweet(sweet.id);
      onUpdate();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] relative group">
      <div className="relative w-full h-48 bg-gray-100 flex items-center justify-center">
        <img
          src={sweet.image || `https://placehold.co/400x300/FEE3C2/E56717?text=${sweet.name.replace(/ /g, '+')}`}
          alt={sweet.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-70 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm flex items-center">
          <DollarSign className="h-3 w-3 mr-1" />
          {sweet.price.toFixed(2)}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{sweet.name}</h3>
        <p className="text-sm text-gray-500 mb-4">{sweet.category}</p>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-600">
            <Package className="h-4 w-4 mr-2" />
            <span className="font-semibold">{sweet.quantity} in stock</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handlePurchase}
            disabled={sweet.quantity === 0 || purchasing}
            className={`
              flex items-center justify-center font-semibold rounded-xl px-6 py-3 transition-all duration-200
              ${sweet.quantity === 0 || purchasing ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg'}
            `}
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
                onClick={() => onRestock?.(sweet)}
                className="p-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-colors duration-200"
                title="Restock Sweet"
              >
                <TrendingUp className="h-4 w-4" />
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
