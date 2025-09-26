import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { SweetCard } from './SweetCard';
import { Search, Candy, Package, DollarSign, Plus, X, TrendingUp, Filter, CreditCard as EditIcon } from 'lucide-react';

// --- Interface ---
interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  description?: string;
  image?: string;
}

// -------------------------------------------------------------------------
// AddSweetForm Component (Modal/Form for adding sweets)
// -------------------------------------------------------------------------

interface AddSweetFormProps {
    onClose: () => void;
    onSweetAdded: () => void;
}

const AddSweetForm: React.FC<AddSweetFormProps> = ({ onClose, onSweetAdded }) => {
    const [formData, setFormData] = useState({
        category: '',
        name: '',
        price: '',
        quantity: '',
        description: '', // Added optional fields for completeness
        image: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const newSweet = {
            category: formData.category,
            name: formData.name,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity, 10),
            description: formData.description || undefined,
            image: formData.image || undefined,
        };

        try {
            await apiService.createSweet(newSweet);
            onSweetAdded(); // Refresh the list of sweets
            onClose();      // Close the form
        } catch (err) {
            console.error('Failed to create sweet:', err);
            setError('Failed to add sweet. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Add New Sweet</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && <p className="text-red-600 bg-red-50 p-3 rounded-xl mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... (Form fields remain the same) ... */}
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* Category Field */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Price Field */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Quantity Field */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Description Field (Optional) */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* Image URL Field (Optional) */}
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                        <input
                            type="text"
                            name="image"
                            id="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Adding Sweet...' : 'Add Sweet'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// -------------------------------------------------------------------------
// RestockSweetForm Component (Modal for restocking)
// -------------------------------------------------------------------------

interface RestockSweetFormProps {
    sweet: Sweet;
    onClose: () => void;
    onSweetRestocked: () => void;
}

const RestockSweetForm: React.FC<RestockSweetFormProps> = ({ sweet, onClose, onSweetRestocked }) => {
    const [quantity, setQuantity] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const restockAmount = parseInt(quantity, 10);

        if (restockAmount <= 0 || isNaN(restockAmount)) {
            setError('Please enter a valid quantity greater than 0.');
            return;
        }

        setLoading(true);
        try {
            // Assuming apiService.restockSweet takes (id, quantity)
            await apiService.restockSweet(sweet.id, restockAmount);
            onSweetRestocked();
            onClose();
        } catch (err) {
            console.error('Failed to restock sweet:', err);
            setError('Failed to restock sweet. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-xl font-bold text-gray-800">Restock {sweet.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && <p className="text-red-600 bg-red-50 p-3 rounded-xl mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="restock-quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add</label>
                        <input
                            type="number"
                            name="restock-quantity"
                            id="restock-quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            min="1"
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-green-500 focus:border-green-500"
                            placeholder="e.g., 50"
                        />
                         <p className="text-xs text-gray-500 mt-2">Current stock: {sweet.quantity}</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? 'Restocking...' : 'Add Stock'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// -------------------------------------------------------------------------
// EditSweetForm Component (Modal/Form for editing sweets)
// -------------------------------------------------------------------------

interface EditSweetFormProps {
    sweet: Sweet;
    onClose: () => void;
    onSweetEdited: () => void;
}

const EditSweetForm: React.FC<EditSweetFormProps> = ({ sweet, onClose, onSweetEdited }) => {
    const [formData, setFormData] = useState({
        category: sweet.category,
        name: sweet.name,
        price: sweet.price.toString(),
        quantity: sweet.quantity.toString(),
        description: sweet.description || '',
        image: sweet.image || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const updatedSweet = {
            category: formData.category,
            name: formData.name,
            price: parseFloat(formData.price),
            quantity: parseInt(formData.quantity, 10),
            description: formData.description || undefined,
            image: formData.image || undefined,
        };

        try {
            // Assuming apiService.updateSweet takes (id, sweetData)
            await apiService.updateSweet(sweet.id, updatedSweet);
            onSweetEdited(); // Refresh the list
            onClose();      // Close the form
        } catch (err) {
            console.error('Failed to update sweet:', err);
            setError('Failed to update sweet. Check console for details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Edit {sweet.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {error && <p className="text-red-600 bg-red-50 p-3 rounded-xl mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* Category Field */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            name="category"
                            id="category"
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Price Field */}
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                            <input
                                type="number"
                                name="price"
                                id="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                step="0.01"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Quantity Field */}
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                value={formData.quantity}
                                onChange={handleChange}
                                required
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Description Field (Optional) */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            id="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>

                    {/* Image URL Field (Optional) */}
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                        <input
                            type="text"
                            name="image"
                            id="image"
                            value={formData.image}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>


                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md flex items-center justify-center disabled:opacity-50 mt-6"
                    >
                        {loading ? 'Updating Sweet...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// -------------------------------------------------------------------------
// Dashboard Component
// -------------------------------------------------------------------------

export const Dashboard: React.FC = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [sweetToEdit, setSweetToEdit] = useState<Sweet | null>(null);

  // 🆕 New state for Restock Modal
  const [isRestockFormOpen, setIsRestockFormOpen] = useState(false);
  const [sweetToRestock, setSweetToRestock] = useState<Sweet | null>(null);

  // 🗑️ Updated handleRestock: Opens the modal instead of hardcoding the API call
  const handleRestock = (sweet: Sweet) => {
    setSweetToRestock(sweet);
    setIsRestockFormOpen(true);
  };

  // handleEdit: Opens the modal and sets the sweet data
  const handleEdit = (sweet: Sweet) => {
    setSweetToEdit(sweet);
    setIsEditFormOpen(true);
  };


  const fetchSweets = async () => {
    try {
      const data = await apiService.getSweets();
      setSweets(data || []);
    } catch (error) {
      console.error('Failed to fetch sweets:', error);
      setSweets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchTerm) filters.name = searchTerm;
      if (selectedCategory) filters.category = selectedCategory;
      if (priceRange.min) filters.minPrice = parseFloat(priceRange.min);
      if (priceRange.max) filters.maxPrice = parseFloat(priceRange.max);

      const data = Object.keys(filters).length > 0
        ? await apiService.searchSweets(filters)
        : await apiService.getSweets();

      setSweets(data || []);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    fetchSweets();
  };

  const categories = [...new Set(sweets.map(sweet => sweet.category))];
  const totalSweets = sweets.length;
  const inStock = sweets.filter(sweet => sweet.quantity > 0).length;
  const totalValue = sweets.reduce((sum, sweet) => sum + (sweet.price * sweet.quantity), 0);

  return (
    <div className="space-y-8">
        {isAddFormOpen && (
            <AddSweetForm
                onClose={() => setIsAddFormOpen(false)}
                onSweetAdded={fetchSweets}
            />
        )}

        {/* 🛠️ Edit Sweet Modal */}
        {isEditFormOpen && sweetToEdit && (
            <EditSweetForm
              sweet={sweetToEdit}
              onClose={() => setIsEditFormOpen(false)}
              onSweetEdited={fetchSweets} // Refresh on success
            />
        )}

        {/* 🛠️ Restock Sweet Modal */}
        {isRestockFormOpen && sweetToRestock && (
            <RestockSweetForm
              sweet={sweetToRestock}
              onClose={() => setIsRestockFormOpen(false)}
              onSweetRestocked={fetchSweets} // Refresh on success
            />
        )}

      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Sweet Shop Dashboard</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover our delicious collection of sweets and treats. Search, filter, and purchase your favorites!
        </p>
      </div>

      {/* --- Stats Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Total Sweets</p>
              <p className="text-3xl font-bold">{totalSweets}</p>
            </div>
            <Candy className="h-12 w-12 text-orange-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-green-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">In Stock</p>
              <p className="text-3xl font-bold">{inStock}</p>
            </div>
            <Package className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-6 rounded-2xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Value</p>
              <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
            </div>
            <DollarSign className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* --- Search and Filters --- */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
                <Search className="h-6 w-6 text-gray-400" />
                <h2 className="text-xl font-bold text-gray-800">Search & Filter</h2>
            </div>

            {/* Add Sweet Button */}
            <button
                onClick={() => setIsAddFormOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Sweet
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search by Name</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter sweet name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              placeholder="100.00"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-6">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </button>

          <button
            onClick={clearFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* --- Sweets Grid --- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Available Sweets</h2>
          <p className="text-gray-600">{sweets.length} sweets found</p>
        </div>

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
        ) : sweets.length === 0 ? (
          <div className="text-center py-12">
            <Candy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No sweets found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
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
    </div>
  );
};