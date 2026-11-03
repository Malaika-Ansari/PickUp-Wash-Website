import React, { useState, useEffect } from 'react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { ORDER_STATUS_LABELS } from '@/utils/constants';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { 
  ShoppingBag, 
  Truck, 
  Clock, 
  CheckCircle, 
  Search, 
  Filter, 
  RefreshCw,
  Phone,
  MapPin,
  Calendar
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (trackingNumber: string, newStatus: OrderStatus) => {
    setUpdatingId(trackingNumber);
    try {
      await orderService.updateOrderStatus(trackingNumber, newStatus);
      await fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Metrics
  const totalOrdersCount = orders.length;
  const pendingPickupCount = orders.filter((o) => o.status === 'pending_pickup').length;
  const inProgressCount = orders.filter((o) => ['picked_up', 'processing', 'ironing'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-3xl text-navy-900">
            Operations & Order Management
          </h1>
          <p className="text-xs sm:text-sm text-navy-600">
            Kasur City Doorstep Pickups, Washing & Deliveries
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchOrders}
          isLoading={isLoading}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Orders
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-ice-200">
          <span className="text-xs font-semibold text-navy-400 uppercase">Total Orders</span>
          <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-500 mt-1">
            {totalOrdersCount}
          </div>
          <span className="text-[11px] text-navy-500 font-medium">All registered bookings</span>
        </Card>

        <Card className="p-5 border-amber-200 bg-amber-50/40">
          <span className="text-xs font-semibold text-amber-700 uppercase">Pending Pickup</span>
          <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-amber-700 mt-1">
            {pendingPickupCount}
          </div>
          <span className="text-[11px] text-amber-600">Waiting for rider collection</span>
        </Card>

        <Card className="p-5 border-aqua-300 bg-aqua-50/40">
          <span className="text-xs font-semibold text-navy-700 uppercase">Active In Laundry</span>
          <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-navy-700 mt-1">
            {inProgressCount}
          </div>
          <span className="text-[11px] text-navy-600">In washing or steam ironing</span>
        </Card>

        <Card className="p-5 border-emerald-200 bg-emerald-50/40">
          <span className="text-xs font-semibold text-emerald-800 uppercase">Est. Revenue</span>
          <div className="font-poppins font-extrabold text-2xl sm:text-3xl text-emerald-800 mt-1">
            PKR {totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-700">Delivered & active orders</span>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <Card className="p-4 border-ice-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-navy-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by tracking code, customer name, area, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-ice-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-ice-50/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-navy-400 shrink-0" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-ice-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-400 bg-white"
          >
            <option value="all">All Statuses</option>
            {Object.keys(ORDER_STATUS_LABELS).map((k) => (
              <option key={k} value={k}>
                {ORDER_STATUS_LABELS[k].label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card className="p-0 border-ice-200 overflow-hidden shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-navy-500 text-white font-poppins text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tracking Code</th>
                <th className="py-3.5 px-4">Customer & Location</th>
                <th className="py-3.5 px-4">Pickup Schedule</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ice-200 text-navy-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-navy-400">
                    No orders matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-ice-50/60 transition-colors">
                    {/* Tracking Code */}
                    <td className="py-4 px-4 font-mono font-bold text-navy-700 whitespace-nowrap">
                      {ord.trackingNumber}
                    </td>

                    {/* Customer & Location */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-navy-900">{ord.customerName}</div>
                      <div className="text-xs text-navy-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-aqua-600" />
                        {ord.customerPhone}
                      </div>
                      <div className="text-xs text-navy-600 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-aqua-600" />
                        <span className="truncate max-w-[200px]">{ord.area} - {ord.pickupAddress}</span>
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="py-4 px-4 whitespace-nowrap text-xs">
                      <div className="font-medium text-navy-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-navy-400" />
                        {ord.pickupDate}
                      </div>
                      <div className="text-navy-500 text-[11px] mt-0.5">
                        {ord.pickupTimeSlot}
                      </div>
                    </td>

                    {/* Current Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        ORDER_STATUS_LABELS[ord.status]?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {ORDER_STATUS_LABELS[ord.status]?.label || ord.status}
                      </span>
                    </td>

                    {/* Update Status Dropdown */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <select
                        disabled={updatingId === ord.trackingNumber}
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.trackingNumber, e.target.value as OrderStatus)}
                        className="px-2.5 py-1.5 rounded-lg border border-ice-300 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-navy-400"
                      >
                        {Object.keys(ORDER_STATUS_LABELS).map((st) => (
                          <option key={st} value={st}>
                            {ORDER_STATUS_LABELS[st].label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

