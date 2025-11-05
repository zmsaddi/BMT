import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [filterOptions, setFilterOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedFinish, setSelectedFinish] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedShelf, setSelectedShelf] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedInventoryId, setSelectedInventoryId] = useState('');
  const [selectedThickness, setSelectedThickness] = useState('');
  const [minLength, setMinLength] = useState('');
  const [maxLength, setMaxLength] = useState('');
  const [minWidth, setMinWidth] = useState('');
  const [maxWidth, setMaxWidth] = useState('');
  const [selectedQty, setSelectedQty] = useState('');
  const [selectedNotes, setSelectedNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Fetch inventory data with optional refresh
  const fetchInventory = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = forceRefresh ? '/api/inventory?refresh=true' : '/api/inventory';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch inventory');

      const data = await response.json();
      setInventory(data.items);
      setFilteredInventory(data.items);
      setFilterOptions(data.filterOptions);
      setLastUpdated(new Date(data.lastUpdated));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate dynamic filter options based on current selections
  const getDynamicFilterOptions = () => {
    let filteredData = [...inventory];

    // Apply each filter progressively to get available options
    if (selectedMaterial) {
      filteredData = filteredData.filter(item => item.material === selectedMaterial);
    }
    if (selectedInventoryId) {
      filteredData = filteredData.filter(item => item.inventoryId === selectedInventoryId);
    }
    if (selectedThickness) {
      filteredData = filteredData.filter(item => item.thickness === parseFloat(selectedThickness));
    }
    // Length range filter
    if (minLength) {
      filteredData = filteredData.filter(item => item.length >= parseFloat(minLength));
    }
    if (maxLength) {
      filteredData = filteredData.filter(item => item.length <= parseFloat(maxLength));
    }
    // Width range filter
    if (minWidth) {
      filteredData = filteredData.filter(item => item.width >= parseFloat(minWidth));
    }
    if (maxWidth) {
      filteredData = filteredData.filter(item => item.width <= parseFloat(maxWidth));
    }
    if (selectedQty) {
      filteredData = filteredData.filter(item => item.qty === parseInt(selectedQty));
    }
    if (selectedFinish) {
      filteredData = filteredData.filter(item => item.finish === selectedFinish);
    }
    if (selectedGrade) {
      filteredData = filteredData.filter(item => item.grade === selectedGrade);
    }
    if (selectedShelf) {
      filteredData = filteredData.filter(item => item.shelf === selectedShelf);
    }
    if (selectedColor) {
      filteredData = filteredData.filter(item => item.color === selectedColor);
    }

    // Calculate options from filtered data
    const lengths = filteredData.map(item => item.length).filter(Boolean);
    const widths = filteredData.map(item => item.width).filter(Boolean);

    return {
      materials: [...new Set(filteredData.map(item => item.material))].sort(),
      inventoryIds: [...new Set(filteredData.map(item => item.inventoryId).filter(Boolean))].sort(),
      thicknesses: [...new Set(filteredData.map(item => item.thickness).filter(Boolean))].sort((a, b) => a - b),
      maxLength: lengths.length > 0 ? Math.max(...lengths) : 0,
      maxWidth: widths.length > 0 ? Math.max(...widths) : 0,
      quantities: [...new Set(filteredData.map(item => item.qty).filter(q => q !== null && q !== undefined))].sort((a, b) => a - b),
      finishes: [...new Set(filteredData.map(item => item.finish).filter(Boolean))].sort(),
      grades: [...new Set(filteredData.map(item => item.grade).filter(Boolean))].sort(),
      shelves: [...new Set(filteredData.map(item => item.shelf).filter(Boolean))].sort(),
      colors: [...new Set(filteredData.map(item => item.color).filter(Boolean))].sort(),
    };
  };

  const dynamicOptions = getDynamicFilterOptions();

  // Initial load - use cached data if available (2 hour cache)
  useEffect(() => {
    fetchInventory(false); // Use cache on page load, only refresh when user clicks button
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...inventory];

    // Material filter
    if (selectedMaterial) {
      filtered = filtered.filter(item => item.material === selectedMaterial);
    }

    // Inventory ID filter
    if (selectedInventoryId) {
      filtered = filtered.filter(item => item.inventoryId === selectedInventoryId);
    }

    // Thickness filter
    if (selectedThickness) {
      filtered = filtered.filter(item => item.thickness === parseFloat(selectedThickness));
    }

    // Length range filter
    if (minLength) {
      filtered = filtered.filter(item => item.length >= parseFloat(minLength));
    }
    if (maxLength) {
      filtered = filtered.filter(item => item.length <= parseFloat(maxLength));
    }

    // Width range filter
    if (minWidth) {
      filtered = filtered.filter(item => item.width >= parseFloat(minWidth));
    }
    if (maxWidth) {
      filtered = filtered.filter(item => item.width <= parseFloat(maxWidth));
    }

    // Finish filter
    if (selectedFinish) {
      filtered = filtered.filter(item => item.finish === selectedFinish);
    }

    // Grade filter
    if (selectedGrade) {
      filtered = filtered.filter(item => item.grade === selectedGrade);
    }

    // Shelf filter
    if (selectedShelf) {
      filtered = filtered.filter(item => item.shelf === selectedShelf);
    }

    // Color filter
    if (selectedColor) {
      filtered = filtered.filter(item => item.color === selectedColor);
    }

    // Quantity filter
    if (selectedQty) {
      filtered = filtered.filter(item => item.qty === parseInt(selectedQty));
    }

    // Notes filter
    if (selectedNotes === 'with') {
      filtered = filtered.filter(item => item.notes && item.notes.trim() !== '');
    } else if (selectedNotes === 'without') {
      filtered = filtered.filter(item => !item.notes || item.notes.trim() === '');
    }

    // Search query (searches across all fields)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.inventoryId.toLowerCase().includes(query) ||
        item.material.toLowerCase().includes(query) ||
        item.finish.toLowerCase().includes(query) ||
        item.grade.toLowerCase().includes(query) ||
        item.shelf.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query) ||
        item.color?.toLowerCase().includes(query)
      );
    }

    setFilteredInventory(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [inventory, selectedMaterial, selectedInventoryId, selectedThickness, minLength, maxLength, minWidth, maxWidth, selectedFinish, selectedGrade, selectedShelf, selectedColor, selectedQty, selectedNotes, searchQuery]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedMaterial('');
    setSelectedInventoryId('');
    setSelectedThickness('');
    setMinLength('');
    setMaxLength('');
    setMinWidth('');
    setMaxWidth('');
    setSelectedQty('');
    setSelectedFinish('');
    setSelectedGrade('');
    setSelectedShelf('');
    setSelectedColor('');
    setSelectedNotes('');
    setSearchQuery('');
  };

  // Auth functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    const formData = new FormData(e.target);
    const loginUsername = formData.get('username');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn(true);
        setUsername(loginUsername);
        setShowLoginModal(false);
        localStorage.setItem('bmt_auth', loginUsername);
      } else {
        setLoginError(data.error || 'Login failed');
      }
    } catch (error) {
      setLoginError('Network error. Please try again.');
      console.error('Login error:', error);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('bmt_auth');
  };

  // Check for existing session on load
  useEffect(() => {
    const savedAuth = localStorage.getItem('bmt_auth');
    if (savedAuth) {
      setIsLoggedIn(true);
      setUsername(savedAuth);
    }
  }, []);

  // Edit functions
  const openEditModal = (item) => {
    setEditingItem(item);
    setEditFormData({
      thickness: item.thickness,
      length: item.length,
      width: item.width,
      qty: item.qty,
      finish: item.finish,
      grade: item.grade,
      shelf: item.shelf,
      notes: item.notes,
      hexColor: '', // Default to "No Change"
      inventoryIdLink: item.inventoryIdLink || '', // Link for Inventory ID
    });
    setSaveError('');
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    setSaveLoading(true);
    setSaveError('');

    try {
      const response = await fetch('/api/update-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inventoryId: editingItem.inventoryId,
          material: editingItem.material,
          updates: editFormData,
          username: username,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Refresh inventory data
        await fetchInventory(true);
        setShowEditModal(false);
        setEditingItem(null);
      } else {
        setSaveError(data.error || 'Failed to save changes');
      }
    } catch (error) {
      setSaveError('Network error. Please try again.');
      console.error('Save error:', error);
    } finally {
      setSaveLoading(false);
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredInventory.slice(startIndex, endIndex);

  return (
    <>
      <Head>
        <title>BMT Inventory Viewer</title>
        <meta name="description" content="Real-time inventory viewing system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header with Filters */}
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold">📦 BMT Inventory Viewer</h1>
                <p className="text-blue-100 mt-2">Real-time materials inventory system</p>
              </div>
              <div className="flex gap-3 items-center">
                {isLoggedIn && (
                  <span className="text-blue-100 text-sm">
                    Logged in as: <strong>{username}</strong>
                  </span>
                )}
                <button
                  onClick={() => fetchInventory(true)}
                  disabled={loading}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                >
                  🔄 {loading ? 'Loading...' : 'Manual Refresh'}
                </button>
                {isLoggedIn ? (
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    🔓 Logout
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    🔐 Login
                  </button>
                )}
              </div>
            </div>

            {/* Filters in Header */}
            <div className="bg-blue-700 bg-opacity-50 rounded-lg p-4 mt-4">
              {/* Row 1: Main filters */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
                {/* Inventory ID */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Inventory ID</label>
                  <select
                    value={selectedInventoryId}
                    onChange={(e) => setSelectedInventoryId(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All IDs</option>
                    {dynamicOptions.inventoryIds?.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>

                {/* Material */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Material</label>
                  <select
                    value={selectedMaterial}
                    onChange={(e) => setSelectedMaterial(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All Materials</option>
                    {dynamicOptions.materials?.map(material => (
                      <option key={material} value={material}>{material}</option>
                    ))}
                  </select>
                </div>

                {/* Thickness */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Thickness (mm)</label>
                  <select
                    value={selectedThickness}
                    onChange={(e) => setSelectedThickness(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All</option>
                    {dynamicOptions.thicknesses?.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Length Range */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Length (cm)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={minLength}
                      onChange={(e) => setMinLength(e.target.value)}
                      placeholder="From"
                      className="w-1/2 text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      type="number"
                      value={maxLength}
                      onChange={(e) => setMaxLength(e.target.value)}
                      placeholder={dynamicOptions.maxLength || "To"}
                      className="w-1/2 text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>

                {/* Width Range */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Width (cm)</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={minWidth}
                      onChange={(e) => setMinWidth(e.target.value)}
                      placeholder="From"
                      className="w-1/2 text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                    />
                    <input
                      type="number"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(e.target.value)}
                      placeholder={dynamicOptions.maxWidth || "To"}
                      className="w-1/2 text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Additional filters */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                {/* Qty */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Qty</label>
                  <select
                    value={selectedQty}
                    onChange={(e) => setSelectedQty(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All</option>
                    {dynamicOptions.quantities?.map(qty => (
                      <option key={qty} value={qty}>{qty}</option>
                    ))}
                  </select>
                </div>

                {/* Finish */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Finish</label>
                  <select
                    value={selectedFinish}
                    onChange={(e) => setSelectedFinish(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All Finishes</option>
                    {dynamicOptions.finishes?.map(finish => (
                      <option key={finish} value={finish}>{finish}</option>
                    ))}
                  </select>
                </div>

                {/* Grade */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Grade</label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All Grades</option>
                    {dynamicOptions.grades?.map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                {/* Shelf */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Shelf</label>
                  <select
                    value={selectedShelf}
                    onChange={(e) => setSelectedShelf(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All Shelves</option>
                    {dynamicOptions.shelves?.map(shelf => (
                      <option key={shelf} value={shelf}>{shelf}</option>
                    ))}
                  </select>
                </div>

                {/* Fill Color */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Fill Color</label>
                  <select
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All Colors</option>
                    {dynamicOptions.colors?.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs text-blue-100 mb-1 block">Notes</label>
                  <select
                    value={selectedNotes}
                    onChange={(e) => setSelectedNotes(e.target.value)}
                    className="w-full text-gray-900 border border-blue-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">All</option>
                    <option value="with">With Notes</option>
                    <option value="without">Without Notes</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Search and Reset */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search all fields..."
                  className="flex-1 text-gray-900 border border-blue-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={resetFilters}
                  className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-lg text-sm transition whitespace-nowrap"
                >
                  ↺ Reset All
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Status Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-gray-600">Total Items: </span>
                <span className="font-bold text-lg">{filteredInventory.length}</span>
                <span className="text-gray-400 ml-2">/ {inventory.length}</span>
              </div>
              <div className="flex items-center gap-4">
                {lastUpdated && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase">Last Data Fetch</div>
                    <div className="text-sm font-medium text-gray-700">
                      {lastUpdated.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                )}
                <button
                  onClick={() => fetchInventory(true)}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50 whitespace-nowrap"
                >
                  🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              ⚠️ Error: {error}
            </div>
          )}

          {/* Inventory Table */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading inventory...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thickness (mm)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (cm)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width (cm)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finish</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fill Color</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        {isLoggedIn && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item, index) => (
                        <tr key={`${item.material}-${item.inventoryId}-${index}`} className="hover:bg-gray-50" style={{backgroundColor: item.hexColor ? `${item.hexColor}20` : 'transparent'}}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {item.inventoryIdLink ? (
                              <a
                                href={item.inventoryIdLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                              >
                                {item.inventoryId} 🔗
                              </a>
                            ) : (
                              <span className="text-gray-900">{item.inventoryId}</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.material}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.thickness}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.length}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.width}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`font-bold ${item.qty === 0 ? 'text-red-600' : item.qty < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {item.qty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.finish}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.grade}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.shelf}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {item.color}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{item.notes}</td>
                          {isLoggedIn && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => openEditModal(item)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition"
                              >
                                ✏️ Edit
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ← Previous
                  </button>

                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p>© 2025 BMT Inventory System</p>
            <p className="text-gray-400 text-sm mt-2">Real-time sync with Google Sheets • Updates every 5 minutes</p>
          </div>
        </footer>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">🔐 Admin Login</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter username"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter password"
                  />
                </div>
                {loginError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {loginError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      setLoginError('');
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                ✏️ Edit Item: {editingItem.inventoryId}
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Read-only fields */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Inventory ID (locked)
                  </label>
                  <input
                    type="text"
                    value={editingItem.inventoryId}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Material (locked)
                  </label>
                  <input
                    type="text"
                    value={editingItem.material}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                {/* Editable fields */}
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Thickness (mm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.thickness}
                    onChange={(e) => setEditFormData({...editFormData, thickness: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Length (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.length}
                    onChange={(e) => setEditFormData({...editFormData, length: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Width (cm)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editFormData.width}
                    onChange={(e) => setEditFormData({...editFormData, width: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={editFormData.qty}
                    onChange={(e) => setEditFormData({...editFormData, qty: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Finish
                  </label>
                  <input
                    type="text"
                    value={editFormData.finish}
                    onChange={(e) => setEditFormData({...editFormData, finish: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Grade
                  </label>
                  <input
                    type="text"
                    value={editFormData.grade}
                    onChange={(e) => setEditFormData({...editFormData, grade: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Shelf
                  </label>
                  <input
                    type="text"
                    value={editFormData.shelf}
                    onChange={(e) => setEditFormData({...editFormData, shelf: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Fill Color (A to I)
                  </label>
                  <select
                    value={editFormData.hexColor}
                    onChange={(e) => setEditFormData({...editFormData, hexColor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Change</option>
                    <option value="REMOVE">⚪ No Fill (Remove Color)</option>
                    <option value="#FF0000">🔴 Red</option>
                    <option value="#0000FF">🔵 Blue</option>
                    <option value="#00FF00">🟢 Green</option>
                    <option value="#FFFF00">🟡 Yellow</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    🔗 Inventory ID Link
                  </label>
                  <input
                    type="url"
                    value={editFormData.inventoryIdLink}
                    onChange={(e) => setEditFormData({...editFormData, inventoryIdLink: e.target.value})}
                    placeholder="https://example.com (optional)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={editFormData.notes}
                    onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {saveError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {saveError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                    setSaveError('');
                  }}
                  disabled={saveLoading}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saveLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
