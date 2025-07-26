import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper
} from '@tanstack/react-table';
import { 
  Download, 
  Filter, 
  Search, 
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  Table as TableIcon,
  ExternalLink,
  Shield,
  Users,
  Truck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PickupData {
  id: string;
  location: string;
  type: string;
  amount: number;
  collector: string;
  timestamp: string;
  status: string;
  blockchainHash?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  greenPoints: number;
  totalPickups: number;
  joinDate: string;
}

interface CollectorData {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  rating: number;
  totalCollections: number;
  isActive: boolean;
}

const DataExplorerView: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pickups' | 'users' | 'collectors'>('pickups');
  const [globalFilter, setGlobalFilter] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [pickupData, setPickupData] = useState<PickupData[]>([]);
  const [userData, setUserData] = useState<UserData[]>([]);
  const [collectorData, setCollectorData] = useState<CollectorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      switch (activeTab) {
        case 'pickups':
          await fetchPickupData();
          break;
        case 'users':
          await fetchUserData();
          break;
        case 'collectors':
          await fetchCollectorData();
          break;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPickupData = async () => {
    const { data, error } = await supabase
      .from('pickups')
      .select(`
        *,
        profiles(full_name),
        collectors(collector_name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const transformedData: PickupData[] = data?.map(pickup => ({
      id: pickup.id,
      location: pickup.pickup_address,
      type: t(`wasteTypes.${pickup.waste_category}`),
      amount: pickup.actual_weight || pickup.estimated_weight || 0,
      collector: pickup.collectors?.collector_name || 'Unassigned',
      timestamp: new Date(pickup.created_at).toLocaleDateString(),
      status: t(`status.${pickup.status}`),
      blockchainHash: `0x${Math.random().toString(16).substr(2, 40)}` // Simulated blockchain hash
    })) || [];

    setPickupData(transformedData);
  };

  const fetchUserData = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    const transformedData: UserData[] = data?.map(profile => ({
      id: profile.id,
      name: profile.full_name || 'Unknown',
      email: profile.email,
      greenPoints: profile.green_points || 0,
      totalPickups: profile.total_pickups || 0,
      joinDate: new Date(profile.created_at).toLocaleDateString()
    })) || [];

    setUserData(transformedData);
  };

  const fetchCollectorData = async () => {
    const { data, error } = await supabase
      .from('collectors')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformedData: CollectorData[] = data?.map(collector => ({
      id: collector.id,
      name: collector.collector_name,
      phone: collector.phone,
      vehicle: collector.vehicle_type || 'N/A',
      rating: collector.rating || 0,
      totalCollections: collector.total_collections || 0,
      isActive: collector.is_active
    })) || [];

    setCollectorData(transformedData);
  };

  const verifyOnChain = (pickupId: string, blockchainHash: string) => {
    // Open blockchain explorer in new tab
    window.open(`https://etherscan.io/tx/${blockchainHash}`, '_blank');
  };

  // Pickup columns
  const pickupColumnHelper = createColumnHelper<PickupData>();
  const pickupColumns = [
    pickupColumnHelper.accessor('id', {
      header: 'ID',
      cell: info => (
        <span className="font-mono text-sm text-gray-600">
          {info.getValue().slice(0, 8)}...
        </span>
      )
    }),
    pickupColumnHelper.accessor('location', {
      header: t('filters.location'),
      cell: info => (
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium">{info.getValue()}</span>
        </div>
      )
    }),
    pickupColumnHelper.accessor('type', {
      header: t('filters.wasteType'),
      cell: info => {
        const typeColors = {
          [t('wasteTypes.organic')]: 'bg-green-100 text-green-800',
          [t('wasteTypes.plastic')]: 'bg-blue-100 text-blue-800',
          [t('wasteTypes.paper')]: 'bg-purple-100 text-purple-800',
          [t('wasteTypes.electronic')]: 'bg-orange-100 text-orange-800',
          [t('wasteTypes.hazardous')]: 'bg-red-100 text-red-800'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            typeColors[info.getValue()] || 'bg-gray-100 text-gray-800'
          }`}>
            {info.getValue()}
          </span>
        );
      }
    }),
    pickupColumnHelper.accessor('amount', {
      header: 'Amount (kg)',
      cell: info => (
        <span className="font-semibold text-gray-900">
          {info.getValue().toFixed(1)}
        </span>
      )
    }),
    pickupColumnHelper.accessor('collector', {
      header: 'Collector',
      cell: info => (
        <span className="text-gray-700">{info.getValue()}</span>
      )
    }),
    pickupColumnHelper.accessor('timestamp', {
      header: 'Date',
      cell: info => (
        <span className="text-gray-600">{info.getValue()}</span>
      )
    }),
    pickupColumnHelper.accessor('status', {
      header: t('filters.status'),
      cell: info => {
        const statusColors = {
          [t('status.pending')]: 'bg-yellow-100 text-yellow-800',
          [t('status.collected')]: 'bg-blue-100 text-blue-800',
          [t('status.processed')]: 'bg-green-100 text-green-800'
        };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[info.getValue()] || 'bg-gray-100 text-gray-800'
          }`}>
            {info.getValue()}
          </span>
        );
      }
    }),
    pickupColumnHelper.display({
      id: 'blockchain',
      header: 'Blockchain',
      cell: ({ row }) => (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => verifyOnChain(row.original.id, row.original.blockchainHash!)}
          className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
        >
          <Shield className="w-3 h-3" />
          <span className="text-xs">Verify</span>
          <ExternalLink className="w-3 h-3" />
        </motion.button>
      )
    })
  ];

  // User columns
  const userColumnHelper = createColumnHelper<UserData>();
  const userColumns = [
    userColumnHelper.accessor('id', {
      header: 'ID',
      cell: info => (
        <span className="font-mono text-sm text-gray-600">
          {info.getValue().slice(0, 8)}...
        </span>
      )
    }),
    userColumnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      )
    }),
    userColumnHelper.accessor('email', {
      header: 'Email',
      cell: info => {
        <span className="text-gray-600">{info.getValue()}</span>
      }
    }),
    userColumnHelper.accessor('greenPoints', {
      header: 'Green Points',
      cell: info => (
        <span className="font-semibold text-green-600">
          {info.getValue().toLocaleString()}
        </span>
      )
    }),
    userColumnHelper.accessor('totalPickups', {
      header: 'Total Pickups',
      cell: info => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      )
    }),
    userColumnHelper.accessor('joinDate', {
      header: 'Join Date',
      cell: info => (
        <span className="text-gray-600">{info.getValue()}</span>
      )
    })
  ];

  // Collector columns
  const collectorColumnHelper = createColumnHelper<CollectorData>();
  const collectorColumns = [
    collectorColumnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      )
    }),
    collectorColumnHelper.accessor('phone', {
      header: 'Phone',
      cell: info => (
        <span className="text-gray-600">{info.getValue()}</span>
      )
    }),
    collectorColumnHelper.accessor('vehicle', {
      header: 'Vehicle',
      cell: info => (
        <span className="text-gray-700">{info.getValue()}</span>
      )
    }),
    collectorColumnHelper.accessor('rating', {
      header: 'Rating',
      cell: info => (
        <div className="flex items-center space-x-1">
          <span className="font-medium text-gray-900">{info.getValue().toFixed(1)}</span>
          <span className="text-yellow-500">★</span>
        </div>
      )
    }),
    collectorColumnHelper.accessor('totalCollections', {
      header: 'Collections',
      cell: info => (
        <span className="font-medium text-gray-900">{info.getValue()}</span>
      )
    }),
    collectorColumnHelper.accessor('isActive', {
      header: 'Status',
      cell: info => {
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            info.getValue() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {info.getValue() ? 'Active' : 'Inactive'}
          </span>
        );
      }
    })
  ];

  const getCurrentData = () => {
    switch (activeTab) {
      case 'pickups': return pickupData;
      case 'users': return userData;
      case 'collectors': return collectorData;
      default: return [];
    }
  };

  const getCurrentColumns = () => {
    switch (activeTab) {
      case 'pickups': return pickupColumns;
      case 'users': return userColumns;
      case 'collectors': return collectorColumns;
      default: return [];
    }
  };

  const table = useReactTable({
    data: getCurrentData(),
    columns: getCurrentColumns(),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: {
        pageSize: 10
      }
    }
  });

  const exportToPDF = async () => {
    const element = document.getElementById('data-table');
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    pdf.save('wastechain-data-export.pdf');
  };

  const exportToCSV = () => {
    const currentData = getCurrentData();
    const headers = Object.keys(currentData[0] || {});
    const csvData = [
      headers.join(','),
      ...currentData.map(row => 
        headers.map(header => (row as any)[header]).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wastechain-${activeTab}-export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('widgets.dataExplorer')}
          </h2>
          <p className="text-gray-600 mt-1">
            Analyze and explore waste collection data with advanced filtering
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToCSV}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>{t('exports.csv')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <FileText className="w-4 h-4" />
            <span>{t('exports.pdf')}</span>
          </motion.button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'pickups', label: 'Pickups', icon: TableIcon },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'collectors', label: 'Collectors', icon: Truck }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search all columns..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
            <option value="">{t('filters.status')}</option>
            <option value="pending">{t('status.pending')}</option>
            <option value="collected">{t('status.collected')}</option>
            <option value="processed">{t('status.processed')}</option>
          </select>

          {/* Clear Filters */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setGlobalFilter('');
              setDateRange({ start: '', end: '' });
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <Filter className="w-4 h-4" />
            <span>{t('filters.clear')}</span>
          </motion.button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TableIcon className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Table ({table.getFilteredRowModel().rows.length} records)
              </h3>
            </div>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            )}
            <div className="text-sm text-gray-500">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto" id="data-table">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center space-x-1">
                        <span>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </span>
                        {header.column.getCanSort() && (
                          <div className="flex flex-col">
                            {header.column.getIsSorted() === 'asc' ? (
                              <ArrowUp className="w-3 h-3" />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <ArrowDown className="w-3 h-3" />
                            ) : (
                              <ArrowUpDown className="w-3 h-3 text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map(row => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <select
              value={table.getState().pagination.pageSize}
              onChange={e => table.setPageSize(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {[10, 20, 30, 40, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-700">entries</span>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              First
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Last
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataExplorerView;