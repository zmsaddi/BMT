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
  const [searchQuery, setSearchQuery] = useState('');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Fetch inventory data
  const fetchInventory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/inventory');
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

  // Initial load
  useEffect(() => {
    fetchInventory();

    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchInventory, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...inventory];

    // Material filter
    if (selectedMaterial) {
      filtered = filtered.filter(item => item.material === selectedMaterial);
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

    // Quantity range filter
    if (minQty) {
      filtered = filtered.filter(item => item.qty >= parseInt(minQty));
    }
    if (maxQty) {
      filtered = filtered.filter(item => item.qty <= parseInt(maxQty));
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
        item.notes.toLowerCase().includes(query)
      );
    }

    setFilteredInventory(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [inventory, selectedMaterial, selectedFinish, selectedGrade, selectedShelf, minQty, maxQty, searchQuery]);

  // Reset all filters
  const resetFilters = () => {
    setSelectedMaterial('');
    setSelectedFinish('');
    setSelectedGrade('');
    setSelectedShelf('');
    setSearchQuery('');
    setMinQty('');
    setMaxQty('');
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
        {/* Header */}
        <header className="bg-blue-600 text-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold">📦 BMT Inventory Viewer</h1>
            <p className="text-blue-100 mt-2">Real-time materials inventory system</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Status Bar */}
          <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
            <div>
              <span className="text-gray-600">Total Items: </span>
              <span className="font-bold text-lg">{filteredInventory.length}</span>
              <span className="text-gray-400 ml-2">/ {inventory.length}</span>
            </div>
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </div>
            )}
            <button
              onClick={fetchInventory}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              🔄 {loading ? 'Loading...' : 'Refresh Now'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              ⚠️ Error: {error}
            </div>
          )}

          {/* Filters Panel */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">🔍 Filters</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Material Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Type
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Materials</option>
                  {filterOptions.materials?.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>

              {/* Finish */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Finish
                </label>
                <select
                  value={selectedFinish}
                  onChange={(e) => setSelectedFinish(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Finishes</option>
                  {filterOptions.finishes?.map(finish => (
                    <option key={finish} value={finish}>{finish}</option>
                  ))}
                </select>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Grades</option>
                  {filterOptions.grades?.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Shelf */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shelf
                </label>
                <select
                  value={selectedShelf}
                  onChange={(e) => setSelectedShelf(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Shelves</option>
                  {filterOptions.shelves?.map(shelf => (
                    <option key={shelf} value={shelf}>{shelf}</option>
                  ))}
                </select>
              </div>

              {/* Quantity Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Quantity
                </label>
                <input
                  type="number"
                  value={minQty}
                  onChange={(e) => setMinQty(e.target.value)}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Quantity
                </label>
                <input
                  type="number"
                  value={maxQty}
                  onChange={(e) => setMaxQty(e.target.value)}
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Search Box */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by ID, material, finish, grade, shelf, or notes..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Reset Button */}
            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
              >
                ↺ Reset All Filters
              </button>
            </div>
          </div>

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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Material</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thickness (mm)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Length (cm)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Width (cm)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finish</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shelf</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentItems.map((item, index) => (
                        <tr key={`${item.material}-${item.inventoryId}-${index}`} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {item.material}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.inventoryId}</td>
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
                          <td className="px-6 py-4 text-sm text-gray-500">{item.notes}</td>
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
      </div>
    </>
  );
}
