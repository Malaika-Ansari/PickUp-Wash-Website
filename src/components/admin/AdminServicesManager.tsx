import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Package, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Clock, 
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Tag,
  Plus,
  Edit2,
  DollarSign,
  Gift,
  HelpCircle,
  Layers,
  Info,
  Check,
  X,
  Trash2,
  Calendar
} from 'lucide-react';
import { 
  ServiceRecord, 
  MonthlyPackageRecord, 
  ServicePricingRecord, 
  PromotionRecord 
} from '@/types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { catalogService } from '@/services/catalogService';

interface AdminServicesManagerProps {
  services: ServiceRecord[];
  packages: MonthlyPackageRecord[];
  onRefresh: () => Promise<void>;
}

export const AdminServicesManager: React.FC<AdminServicesManagerProps> = ({
  services,
  packages,
  onRefresh,
}) => {
  const [activeSection, setActiveSection] = useState<'services' | 'pricing' | 'packages' | 'promotions'>('services');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  // Pricing & Promotion State
  const [pricingItems, setPricingItems] = useState<ServicePricingRecord[]>([]);
  const [firstPickupPromo, setFirstPickupPromo] = useState<PromotionRecord | null>(null);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // ===========================================================================
  // Modals State
  // ===========================================================================
  // 1. Service Modal
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRecord | null>(null);
  const [serviceForm, setServiceForm] = useState({
    service_name: '',
    slug: '',
    description: '',
    turnaround_time: '24–48 Hours',
    is_active: true,
  });

  // 2. Direct Service Pricing Modal
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pricingTargetService, setPricingTargetService] = useState<ServiceRecord | null>(null);
  const [directPricingForm, setDirectPricingForm] = useState({
    price_per_kg: '',
    base_price: '',
    special_charge: '',
    price_unit: 'per_kg',
    is_pricing_active: false,
    pricing_notes: '',
  });

  // 3. Special Charge / Itemized Pricing Modal
  const [itemizedModalOpen, setItemizedModalOpen] = useState(false);
  const [editingPricingItem, setEditingPricingItem] = useState<ServicePricingRecord | null>(null);
  const [itemizedForm, setItemizedForm] = useState({
    service_id: '',
    title: '',
    pricing_type: 'special_charge' as 'per_kg' | 'per_item' | 'special_charge' | 'fixed',
    rate: '',
    unit: 'order',
    description: '',
    is_active: true,
  });

  // 4. Monthly Package Modal
  const [packageModalOpen, setPackageModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<MonthlyPackageRecord | null>(null);
  const [packageForm, setPackageForm] = useState({
    package_name: '',
    slug: '',
    description: '',
    price: '',
    is_active: true,
  });

  // 5. Promotion Edit Modal
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [promoForm, setPromoForm] = useState({
    title: '',
    description: '',
    terms: '',
    is_active: true,
  });

  // Load Extra Pricing & Promotions on Mount
  const loadExtras = async () => {
    setLoadingExtras(true);
    try {
      const [pricingRes, promoRes] = await Promise.all([
        catalogService.getAllServicePricing(),
        catalogService.getFirstPickupPromotion(),
      ]);
      setPricingItems(pricingRes.pricing || []);
      setFirstPickupPromo(promoRes);
    } catch (err) {
      console.warn('Error loading pricing/promotions:', err);
    } finally {
      setLoadingExtras(false);
    }
  };

  useEffect(() => {
    loadExtras();
  }, []);

  // ===========================================================================
  // Handlers: Laundry Services
  // ===========================================================================
  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceForm({
      service_name: '',
      slug: '',
      description: '',
      turnaround_time: '24–48 Hours',
      is_active: true,
    });
    setServiceModalOpen(true);
  };

  const handleOpenEditService = (srv: ServiceRecord) => {
    setEditingService(srv);
    setServiceForm({
      service_name: srv.service_name,
      slug: srv.slug,
      description: srv.description,
      turnaround_time: srv.turnaround_time || '24–48 Hours',
      is_active: srv.is_active,
    });
    setServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.service_name.trim()) return;

    try {
      if (editingService) {
        await catalogService.updateService(editingService.id, serviceForm);
        setFeedback({ success: true, message: `Service "${serviceForm.service_name}" updated successfully.` });
      } else {
        await catalogService.createService(serviceForm);
        setFeedback({ success: true, message: `New service "${serviceForm.service_name}" created successfully.` });
      }
      setServiceModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to save service.' });
    }
  };

  const handleToggleService = async (service: ServiceRecord) => {
    setTogglingId(service.id);
    setFeedback(null);
    try {
      const success = await catalogService.toggleServiceStatus(service.id, !service.is_active);
      if (success) {
        setFeedback({
          success: true,
          message: `Service "${service.service_name}" status updated to ${!service.is_active ? 'Active' : 'Disabled'}`,
        });
        await onRefresh();
      } else {
        setFeedback({ success: false, message: 'Failed to update service status.' });
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Error updating service.' });
    } finally {
      setTogglingId(null);
    }
  };

  // ===========================================================================
  // Handlers: Direct Pricing
  // ===========================================================================
  const handleOpenPricingModal = (srv: ServiceRecord) => {
    setPricingTargetService(srv);
    setDirectPricingForm({
      price_per_kg: srv.price_per_kg != null ? String(srv.price_per_kg) : '',
      base_price: srv.base_price != null ? String(srv.base_price) : '',
      special_charge: srv.special_charge != null ? String(srv.special_charge) : '',
      price_unit: srv.price_unit || 'per_kg',
      is_pricing_active: srv.is_pricing_active || false,
      pricing_notes: srv.pricing_notes || '',
    });
    setPricingModalOpen(true);
  };

  const handleSaveDirectPricing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pricingTargetService) return;

    const price_per_kg = directPricingForm.price_per_kg.trim() ? parseFloat(directPricingForm.price_per_kg) : null;
    const base_price = directPricingForm.base_price.trim() ? parseFloat(directPricingForm.base_price) : null;
    const special_charge = directPricingForm.special_charge.trim() ? parseFloat(directPricingForm.special_charge) : null;

    try {
      await catalogService.updateServiceDirectPricing(pricingTargetService.id, {
        price_per_kg,
        base_price,
        special_charge,
        price_unit: directPricingForm.price_unit,
        is_pricing_active: directPricingForm.is_pricing_active,
        pricing_notes: directPricingForm.pricing_notes,
      });

      setFeedback({
        success: true,
        message: `Pricing rates updated for "${pricingTargetService.service_name}".`,
      });
      setPricingModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to update pricing.' });
    }
  };

  const handleClearDirectPricing = async () => {
    if (!pricingTargetService) return;
    try {
      await catalogService.updateServiceDirectPricing(pricingTargetService.id, {
        price_per_kg: null,
        base_price: null,
        special_charge: null,
        is_pricing_active: false,
        pricing_notes: 'Pricing marked Not Set pending official business decision in Kasur.',
      });
      setFeedback({
        success: true,
        message: `Pricing rates cleared to "Not Set" for "${pricingTargetService.service_name}".`,
      });
      setPricingModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to clear pricing.' });
    }
  };

  // ===========================================================================
  // Handlers: Special Charges / Itemized Pricing
  // ===========================================================================
  const handleOpenAddItemized = () => {
    setEditingPricingItem(null);
    setItemizedForm({
      service_id: services[0]?.id || '',
      title: '',
      pricing_type: 'special_charge',
      rate: '',
      unit: 'order',
      description: '',
      is_active: true,
    });
    setItemizedModalOpen(true);
  };

  const handleOpenEditItemized = (item: ServicePricingRecord) => {
    setEditingPricingItem(item);
    setItemizedForm({
      service_id: item.service_id,
      title: item.title,
      pricing_type: item.pricing_type,
      rate: item.rate != null ? String(item.rate) : '',
      unit: item.unit,
      description: item.description || '',
      is_active: item.is_active,
    });
    setItemizedModalOpen(true);
  };

  const handleSaveItemized = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemizedForm.title.trim()) return;

    const rate = itemizedForm.rate.trim() ? parseFloat(itemizedForm.rate) : null;

    try {
      if (editingPricingItem) {
        await catalogService.updatePricingItem(editingPricingItem.id, {
          service_id: itemizedForm.service_id,
          title: itemizedForm.title,
          pricing_type: itemizedForm.pricing_type,
          rate,
          unit: itemizedForm.unit,
          description: itemizedForm.description,
          is_active: itemizedForm.is_active,
        });
        setFeedback({ success: true, message: `Pricing entry "${itemizedForm.title}" updated.` });
      } else {
        await catalogService.createPricingItem({
          service_id: itemizedForm.service_id,
          title: itemizedForm.title,
          pricing_type: itemizedForm.pricing_type,
          rate,
          unit: itemizedForm.unit,
          description: itemizedForm.description,
          is_active: itemizedForm.is_active,
        });
        setFeedback({ success: true, message: `New pricing entry "${itemizedForm.title}" created.` });
      }
      setItemizedModalOpen(false);
      await loadExtras();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to save pricing entry.' });
    }
  };

  const handleToggleItemized = async (item: ServicePricingRecord) => {
    try {
      await catalogService.togglePricingStatus(item.id, !item.is_active);
      setFeedback({
        success: true,
        message: `Pricing entry "${item.title}" status changed to ${!item.is_active ? 'Active' : 'Disabled'}.`,
      });
      await loadExtras();
    } catch (err: any) {
      setFeedback({ success: false, message: 'Failed to toggle pricing entry status.' });
    }
  };

  const handleDeleteItemized = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this special pricing entry?')) return;
    try {
      await catalogService.deletePricingItem(id);
      setFeedback({ success: true, message: 'Pricing entry deleted.' });
      await loadExtras();
    } catch (err: any) {
      setFeedback({ success: false, message: 'Failed to delete pricing entry.' });
    }
  };

  // ===========================================================================
  // Handlers: Monthly Packages
  // ===========================================================================
  const handleOpenAddPackage = () => {
    setEditingPackage(null);
    setPackageForm({
      package_name: '',
      slug: '',
      description: '',
      price: '',
      is_active: true,
    });
    setPackageModalOpen(true);
  };

  const handleOpenEditPackage = (pkg: MonthlyPackageRecord) => {
    setEditingPackage(pkg);
    setPackageForm({
      package_name: pkg.package_name,
      slug: pkg.slug,
      description: pkg.description,
      price: pkg.price != null ? String(pkg.price) : '',
      is_active: pkg.is_active,
    });
    setPackageModalOpen(true);
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageForm.package_name.trim()) return;

    const price = packageForm.price.trim() ? parseFloat(packageForm.price) : null;

    try {
      if (editingPackage) {
        await catalogService.updateMonthlyPackage(editingPackage.id, {
          package_name: packageForm.package_name,
          slug: packageForm.slug,
          description: packageForm.description,
          price,
          is_active: packageForm.is_active,
        });
        setFeedback({ success: true, message: `Package "${packageForm.package_name}" updated successfully.` });
      } else {
        await catalogService.createMonthlyPackage({
          package_name: packageForm.package_name,
          slug: packageForm.slug,
          description: packageForm.description,
          price,
          is_active: packageForm.is_active,
        });
        setFeedback({ success: true, message: `New package "${packageForm.package_name}" created.` });
      }
      setPackageModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to save monthly package.' });
    }
  };

  const handleTogglePackage = async (pkg: MonthlyPackageRecord) => {
    setTogglingId(pkg.id);
    setFeedback(null);
    try {
      const success = await catalogService.togglePackageStatus(pkg.id, !pkg.is_active);
      if (success) {
        setFeedback({
          success: true,
          message: `Package "${pkg.package_name}" status updated to ${!pkg.is_active ? 'Active' : 'Disabled'}`,
        });
        await onRefresh();
      } else {
        setFeedback({ success: false, message: 'Failed to update package status.' });
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Error updating package.' });
    } finally {
      setTogglingId(null);
    }
  };

  // ===========================================================================
  // Handlers: First Pickup Free Promotion
  // ===========================================================================
  const handleToggleFirstPickupPromo = async () => {
    if (!firstPickupPromo) return;
    try {
      const nextStatus = !firstPickupPromo.is_active;
      await catalogService.togglePromotionStatus(firstPickupPromo.promo_code, nextStatus);
      setFirstPickupPromo({ ...firstPickupPromo, is_active: nextStatus });
      setFeedback({
        success: true,
        message: `Promotion "Your First Pickup is FREE!" is now ${nextStatus ? 'ACTIVE' : 'DEACTIVATED'}.`,
      });
    } catch (err: any) {
      setFeedback({ success: false, message: 'Failed to toggle promotion status.' });
    }
  };

  const handleOpenEditPromo = () => {
    if (!firstPickupPromo) return;
    setPromoForm({
      title: firstPickupPromo.title,
      description: firstPickupPromo.description,
      terms: firstPickupPromo.terms || '',
      is_active: firstPickupPromo.is_active,
    });
    setPromoModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstPickupPromo) return;

    try {
      const res = await catalogService.updatePromotion(firstPickupPromo.promo_code, promoForm);
      if (res.promotion) {
        setFirstPickupPromo(res.promotion);
        setFeedback({ success: true, message: 'Promotion details and terms updated.' });
      }
      setPromoModalOpen(false);
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to update promotion.' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* =========================================================================
          TOP BANNER & SUB-NAVIGATION TABS
         ========================================================================= */}
      <Card className="p-5 sm:p-6 border-ice-200 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-aqua-600" />
              <h2 className="font-poppins font-bold text-lg sm:text-xl text-darkNavy">
                Services & Pricing Management
              </h2>
            </div>
            <p className="text-xs text-navy-500 mt-1">
              Configure available laundry services, per-kg rates, monthly plans, and promotions for Kasur
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-ice-100 p-1.5 rounded-2xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveSection('services')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'services'
                  ? 'bg-navy-500 text-white shadow-soft'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Services ({services.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('pricing')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'pricing'
                  ? 'bg-navy-500 text-white shadow-soft'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Pricing & Rates
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('packages')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeSection === 'packages'
                  ? 'bg-navy-500 text-white shadow-soft'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              Monthly Packages ({packages.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('promotions')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                activeSection === 'promotions'
                  ? 'bg-navy-500 text-white shadow-soft'
                  : 'text-navy-600 hover:text-navy-900'
              }`}
            >
              <Gift className="w-3.5 h-3.5 text-aqua-400" />
              <span>Promotions</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2.5 animate-in fade-in ${
            feedback.success
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-navy-400 hover:text-navy-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: LAUNDRY SERVICES
         ========================================================================= */}
      {activeSection === 'services' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-poppins font-bold text-base text-darkNavy">
                Laundry Services ({services.length})
              </h3>
              <p className="text-xs text-navy-500">
                Core services displayed to customers on the public Services page and Booking form
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenAddService}
              className="gap-1.5 text-xs font-bold shadow-soft"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add New Service
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((srv) => (
              <Card key={srv.id} className="p-5 border-ice-200 shadow-card flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-poppins font-bold text-base text-darkNavy flex items-center gap-2">
                        <span>{srv.service_name}</span>
                        {srv.is_active ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            Disabled (Hidden from Customers)
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-mono font-semibold text-aqua-700 bg-ice-100 px-2 py-0.5 rounded-md">
                          slug: {srv.slug}
                        </span>
                        <span className="text-[10px] font-medium text-navy-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-navy-400" />
                          <span>{srv.turnaround_time || '24–48 Hours'}</span>
                        </span>
                      </div>
                    </div>

                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleOpenEditService(srv)}
                      className="gap-1 text-xs"
                      leftIcon={<Edit2 className="w-3 h-3 text-aqua-600" />}
                    >
                      Edit
                    </Button>
                  </div>

                  <p className="text-xs text-navy-600/90 leading-relaxed pt-1">
                    {srv.description}
                  </p>

                  {/* Pricing Overview Pill */}
                  <div className="pt-2">
                    <div className="p-2.5 rounded-xl bg-ice-50 border border-ice-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-navy-400 block">Pricing Rate</span>
                        <span className="font-bold text-darkNavy">
                          {srv.price_per_kg != null
                            ? `PKR ${srv.price_per_kg} / kg`
                            : srv.base_price != null
                            ? `PKR ${srv.base_price} base`
                            : 'Not Set (Contact Us for Current Rates)'}
                        </span>
                      </div>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleOpenPricingModal(srv)}
                        className="text-[11px] font-semibold text-aqua-700"
                      >
                        Manage Rate
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-ice-100 flex items-center justify-between">
                  <span className="text-[11px] text-navy-400">
                    Created: {new Date(srv.created_at).toLocaleDateString('en-PK')}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleService(srv)}
                    disabled={togglingId === srv.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      srv.is_active
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {togglingId === srv.id
                      ? 'Updating...'
                      : srv.is_active
                      ? 'Disable Service'
                      : 'Activate Service'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: PRICING MANAGEMENT (Per-Kg, Special Charges, Official Rates)
         ========================================================================= */}
      {activeSection === 'pricing' && (
        <div className="space-y-6">
          {/* Important Policy Callout */}
          <Card className="p-4 sm:p-5 border-amber-200 bg-amber-50/70">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-poppins font-bold text-xs sm:text-sm text-amber-900">
                  Strict Pricing Integrity Policy
                </h4>
                <p className="text-xs text-amber-800/90 leading-relaxed">
                  Do not invent or automatically assign prices. Rates remain empty or marked <strong>"Not Set"</strong> until the business owner in Kasur officially sets them. Public customers are instructed to confirm current per-kg rates with the hub.
                </p>
              </div>
            </div>
          </Card>

          {/* 1. Services Direct Pricing Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-base text-darkNavy">
                  Laundry Service Rates (Per-Kg & Base)
                </h3>
                <p className="text-xs text-navy-500">
                  Manage official per-kilogram charges and pricing status for core laundry offerings
                </p>
              </div>
            </div>

            <Card className="border-ice-200 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-bold">Service Name</th>
                      <th className="py-3 px-4 font-bold">Per-Kg Rate</th>
                      <th className="py-3 px-4 font-bold">Base Rate</th>
                      <th className="py-3 px-4 font-bold">Special Surcharge</th>
                      <th className="py-3 px-4 font-bold">Pricing Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ice-100 bg-white">
                    {services.map((srv) => (
                      <tr key={srv.id} className="hover:bg-ice-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-darkNavy whitespace-nowrap">
                          {srv.service_name}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {srv.price_per_kg != null ? (
                            <span className="font-mono font-bold text-darkNavy bg-ice-100 px-2 py-0.5 rounded border border-ice-200">
                              PKR {srv.price_per_kg} / kg
                            </span>
                          ) : (
                            <span className="text-navy-400 font-mono text-[11px]">Not Set</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {srv.base_price != null ? (
                            <span className="font-mono font-bold text-darkNavy">
                              PKR {srv.base_price}
                            </span>
                          ) : (
                            <span className="text-navy-400 font-mono text-[11px]">Not Set</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {srv.special_charge != null ? (
                            <span className="font-mono font-bold text-aqua-700">
                              +PKR {srv.special_charge}
                            </span>
                          ) : (
                            <span className="text-navy-400 font-mono text-[11px]">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {srv.is_pricing_active ? (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Active on Website
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              Hidden / Contact Us
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleOpenPricingModal(srv)}
                            className="text-xs font-semibold"
                            leftIcon={<DollarSign className="w-3.5 h-3.5 text-aqua-600" />}
                          >
                            Set Rates
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* 2. Special Charges & Surcharges Section */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-poppins font-bold text-base text-darkNavy">
                  Special Service Charges & Itemized Rates ({pricingItems.length})
                </h3>
                <p className="text-xs text-navy-500">
                  Optional surcharges for rush expedited handling, bulky linens, or special requests
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleOpenAddItemized}
                className="gap-1.5 text-xs font-bold"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Add Special Charge
              </Button>
            </div>

            <Card className="border-ice-200 overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-navy-800 text-white border-b border-navy-700 uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 font-bold">Charge Title</th>
                      <th className="py-3 px-4 font-bold">Service</th>
                      <th className="py-3 px-4 font-bold">Type</th>
                      <th className="py-3 px-4 font-bold">Rate</th>
                      <th className="py-3 px-4 font-bold">Status</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ice-100 bg-white">
                    {pricingItems.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-navy-400">
                          No special charges recorded. Use "Add Special Charge" to create one.
                        </td>
                      </tr>
                    ) : (
                      pricingItems.map((item) => {
                        const linkedService = services.find((s) => s.id === item.service_id);
                        return (
                          <tr key={item.id} className="hover:bg-ice-50/70 transition-colors">
                            <td className="py-3 px-4 font-semibold text-darkNavy whitespace-nowrap">
                              {item.title}
                              {item.description && (
                                <span className="block text-[10px] text-navy-500 font-normal">
                                  {item.description}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-navy-700 whitespace-nowrap">
                              {linkedService?.service_name || 'General'}
                            </td>
                            <td className="py-3 px-4 text-navy-600 whitespace-nowrap uppercase font-mono text-[10px]">
                              {item.pricing_type}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono font-bold">
                              {item.rate != null ? `PKR ${item.rate} / ${item.unit}` : 'Not Set'}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  item.is_active
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-300'
                                }`}
                              >
                                {item.is_active ? 'Active' : 'Disabled'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleOpenEditItemized(item)}
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleToggleItemized(item)}
                                className={`text-xs ${item.is_active ? 'text-amber-700' : 'text-emerald-700'}`}
                              >
                                {item.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                size="xs"
                                variant="secondary"
                                onClick={() => handleDeleteItemized(item.id)}
                                className="text-xs text-rose-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 3: MONTHLY PACKAGES MANAGEMENT
         ========================================================================= */}
      {activeSection === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-poppins font-bold text-base text-darkNavy">
                Monthly Turnkey Packages ({packages.length})
              </h3>
              <p className="text-xs text-navy-500">
                Turnkey household recurring plans displayed on the public Pricing page
              </p>
            </div>
            <Button
              size="sm"
              variant="primary"
              onClick={handleOpenAddPackage}
              className="gap-1.5 text-xs font-bold shadow-soft"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Monthly Package
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="p-5 border-ice-200 shadow-card flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-poppins font-bold text-sm sm:text-base text-darkNavy">
                        {pkg.package_name}
                      </h4>
                      <span className="text-[10px] font-mono font-semibold text-aqua-700 bg-ice-100 px-2 py-0.5 rounded-md">
                        slug: {pkg.slug}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        pkg.is_active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {pkg.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <p className="text-xs text-navy-600/90 leading-relaxed">
                    {pkg.description}
                  </p>

                  <div className="p-3 rounded-xl bg-ice-50 border border-ice-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="text-navy-500 block text-[10px] font-bold uppercase">Monthly Price</span>
                      <span className="font-bold text-darkNavy text-xs">
                        {pkg.price != null ? `PKR ${pkg.price.toLocaleString()} / mo` : 'Not Set (Confirm with Kasur Hub)'}
                      </span>
                    </div>
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleOpenEditPackage(pkg)}
                      className="text-xs"
                      leftIcon={<Edit2 className="w-3 h-3 text-aqua-600" />}
                    >
                      Edit
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t border-ice-100 flex items-center justify-between">
                  <span className="text-[11px] text-navy-400">
                    Created: {new Date(pkg.created_at).toLocaleDateString('en-PK')}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleTogglePackage(pkg)}
                    disabled={togglingId === pkg.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      pkg.is_active
                        ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {togglingId === pkg.id
                      ? 'Updating...'
                      : pkg.is_active
                      ? 'Disable Plan'
                      : 'Activate Plan'}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SECTION 4: PROMOTIONS ("YOUR FIRST PICKUP IS FREE!")
         ========================================================================= */}
      {activeSection === 'promotions' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-poppins font-bold text-base text-darkNavy">
              Promotional Offers & Customer Discounts
            </h3>
            <p className="text-xs text-navy-500">
              Control sitewide promotions displayed on the homepage, booking form, and pricing page
            </p>
          </div>

          {/* First Pickup Free Banner Card */}
          <Card className="p-6 sm:p-8 border-ice-200 shadow-card bg-gradient-to-br from-white via-ice-50/40 to-ice-100/50">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-aqua-100 text-aqua-800 flex items-center justify-center font-bold">
                    <Gift className="w-5 h-5 text-aqua-600" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-aqua-700">
                      Primary Sitewide Welcome Offer
                    </span>
                    <h4 className="font-poppins font-bold text-xl sm:text-2xl text-darkNavy">
                      "Your First Pickup is FREE!"
                    </h4>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-navy-700 leading-relaxed font-inter">
                  {firstPickupPromo?.description ||
                    'Complimentary doorstep collection for all first-time customers across Kasur City.'}
                </p>

                <div className="p-3 rounded-xl bg-white/80 border border-ice-200 text-xs space-y-1">
                  <span className="text-[10px] uppercase font-bold text-navy-400 block">Terms & Rules:</span>
                  <p className="text-[11px] text-navy-600">
                    {firstPickupPromo?.terms ||
                      'Valid on the very first booking for verified Kasur residential addresses. Payment is only collected upon safe delivery.'}
                  </p>
                </div>
              </div>

              {/* Status & Control Panel */}
              <div className="flex flex-col items-start lg:items-end gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-navy-600 font-semibold">Promotion Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      firstPickupPromo?.is_active
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    {firstPickupPromo?.is_active ? 'ACTIVE & LIVE' : 'DEACTIVATED'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={firstPickupPromo?.is_active ? 'secondary' : 'accent'}
                    onClick={handleToggleFirstPickupPromo}
                    className="font-bold text-xs"
                  >
                    {firstPickupPromo?.is_active ? 'Deactivate Promotion' : 'Activate Promotion'}
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleOpenEditPromo}
                    className="text-xs"
                    leftIcon={<Edit2 className="w-3.5 h-3.5 text-aqua-600" />}
                  >
                    Edit Terms
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: ADD / EDIT LAUNDRY SERVICE
         ========================================================================= */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-ice-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <h3 className="font-poppins font-bold text-lg text-darkNavy">
                {editingService ? 'Edit Laundry Service' : 'Add New Laundry Service'}
              </h3>
              <button
                type="button"
                onClick={() => setServiceModalOpen(false)}
                className="text-navy-400 hover:text-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wash & Iron, Dry Cleaning, Express Service"
                  value={serviceForm.service_name}
                  onChange={(e) => setServiceForm({ ...serviceForm, service_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. wash-and-iron (auto-generated if empty)"
                  value={serviceForm.slug}
                  onChange={(e) => setServiceForm({ ...serviceForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe fabric treatment, washing steps, and garments covered..."
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Turnaround / Service Timing
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24–48 Hours, Urgent 12–24 Hours"
                  value={serviceForm.turnaround_time}
                  onChange={(e) => setServiceForm({ ...serviceForm, turnaround_time: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="serviceActiveCheck"
                  checked={serviceForm.is_active}
                  onChange={(e) => setServiceForm({ ...serviceForm, is_active: e.target.checked })}
                  className="rounded border-navy-300 text-aqua-600 focus:ring-aqua-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="serviceActiveCheck" className="text-xs font-semibold text-darkNavy cursor-pointer">
                  Service is active and available for customer bookings in Kasur
                </label>
              </div>

              <div className="pt-4 border-t border-ice-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setServiceModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-navy-500 text-white"
                >
                  Save Service
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: EDIT DIRECT SERVICE PRICING
         ========================================================================= */}
      {pricingModalOpen && pricingTargetService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-ice-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-aqua-700">Official Rate Setting</span>
                <h3 className="font-poppins font-bold text-lg text-darkNavy">
                  Pricing for: {pricingTargetService.service_name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="text-navy-400 hover:text-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDirectPricing} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkNavy mb-1">
                    Rate Per Kilogram (PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave blank for Not Set"
                    value={directPricingForm.price_per_kg}
                    onChange={(e) => setDirectPricingForm({ ...directPricingForm, price_per_kg: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-mono"
                  />
                  <span className="text-[10px] text-navy-400">Blank = "Not Set"</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkNavy mb-1">
                    Base / Item Rate (PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional base rate"
                    value={directPricingForm.base_price}
                    onChange={(e) => setDirectPricingForm({ ...directPricingForm, base_price: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Special Surcharge (PKR)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150 for rush priority"
                  value={directPricingForm.special_charge}
                  onChange={(e) => setDirectPricingForm({ ...directPricingForm, special_charge: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Pricing Notes / Customer Explanation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Includes fabric softening and hanger packing"
                  value={directPricingForm.pricing_notes}
                  onChange={(e) => setDirectPricingForm({ ...directPricingForm, pricing_notes: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pricingActiveCheck"
                  checked={directPricingForm.is_pricing_active}
                  onChange={(e) => setDirectPricingForm({ ...directPricingForm, is_pricing_active: e.target.checked })}
                  className="rounded border-navy-300 text-aqua-600 focus:ring-aqua-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="pricingActiveCheck" className="text-xs font-semibold text-darkNavy cursor-pointer">
                  Publish rates publicly on website (if unchecked, shows "Contact Us for Rates")
                </label>
              </div>

              <div className="pt-4 border-t border-ice-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleClearDirectPricing}
                  className="text-xs font-bold text-rose-700 hover:underline"
                >
                  Clear to "Not Set"
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setPricingModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="font-bold bg-navy-500 text-white"
                  >
                    Save Official Rates
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: ADD / EDIT SPECIAL CHARGE
         ========================================================================= */}
      {itemizedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-ice-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <h3 className="font-poppins font-bold text-lg text-darkNavy">
                {editingPricingItem ? 'Edit Special Charge' : 'Add Special Charge'}
              </h3>
              <button
                type="button"
                onClick={() => setItemizedModalOpen(false)}
                className="text-navy-400 hover:text-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItemized} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Charge Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Express Priority Rush, Heavy Winter Blanket Surcharge"
                  value={itemizedForm.title}
                  onChange={(e) => setItemizedForm({ ...itemizedForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Associated Laundry Service
                </label>
                <select
                  value={itemizedForm.service_id}
                  onChange={(e) => setItemizedForm({ ...itemizedForm, service_id: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 bg-white"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.service_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkNavy mb-1">
                    Rate (PKR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave blank for Not Set"
                    value={itemizedForm.rate}
                    onChange={(e) => setItemizedForm({ ...itemizedForm, rate: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-darkNavy mb-1">
                    Unit
                  </label>
                  <select
                    value={itemizedForm.unit}
                    onChange={(e) => setItemizedForm({ ...itemizedForm, unit: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 bg-white"
                  >
                    <option value="order">Per Order</option>
                    <option value="kg">Per Kilogram</option>
                    <option value="item">Per Item</option>
                    <option value="suit">Per Suit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional details or conditions"
                  value={itemizedForm.description}
                  onChange={(e) => setItemizedForm({ ...itemizedForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="itemizedActiveCheck"
                  checked={itemizedForm.is_active}
                  onChange={(e) => setItemizedForm({ ...itemizedForm, is_active: e.target.checked })}
                  className="rounded border-navy-300 text-aqua-600 focus:ring-aqua-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="itemizedActiveCheck" className="text-xs font-semibold text-darkNavy cursor-pointer">
                  Charge entry is active
                </label>
              </div>

              <div className="pt-4 border-t border-ice-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setItemizedModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-navy-500 text-white"
                >
                  Save Charge
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: ADD / EDIT MONTHLY PACKAGE
         ========================================================================= */}
      {packageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-ice-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <h3 className="font-poppins font-bold text-lg text-darkNavy">
                {editingPackage ? 'Edit Monthly Package' : 'Create Monthly Package'}
              </h3>
              <button
                type="button"
                onClick={() => setPackageModalOpen(false)}
                className="text-navy-400 hover:text-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePackage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Package Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Family Essential Plan, Bachelor Saver"
                  value={packageForm.package_name}
                  onChange={(e) => setPackageForm({ ...packageForm, package_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g. family-essential (auto-generated if empty)"
                  value={packageForm.slug}
                  onChange={(e) => setPackageForm({ ...packageForm, slug: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe pickup frequency and household suitability..."
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Monthly Price in PKR (Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty for 'Not Set' until decided"
                  value={packageForm.price}
                  onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-mono"
                />
                <span className="text-[10px] text-navy-400">
                  Do not invent prices. Leave blank if not yet confirmed with Kasur Hub.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="packageActiveCheck"
                  checked={packageForm.is_active}
                  onChange={(e) => setPackageForm({ ...packageForm, is_active: e.target.checked })}
                  className="rounded border-navy-300 text-aqua-600 focus:ring-aqua-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="packageActiveCheck" className="text-xs font-semibold text-darkNavy cursor-pointer">
                  Package is active and published on the Pricing page
                </label>
              </div>

              <div className="pt-4 border-t border-ice-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPackageModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-navy-500 text-white"
                >
                  Save Package
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: EDIT PROMOTION TERMS
         ========================================================================= */}
      {promoModalOpen && firstPickupPromo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-ice-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-ice-100">
              <h3 className="font-poppins font-bold text-lg text-darkNavy">
                Edit Promotion: "Your First Pickup is FREE!"
              </h3>
              <button
                type="button"
                onClick={() => setPromoModalOpen(false)}
                className="text-navy-400 hover:text-navy-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Promotion Title
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.title}
                  onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={2}
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkNavy mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  required
                  rows={3}
                  value={promoForm.terms}
                  onChange={(e) => setPromoForm({ ...promoForm, terms: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-navy-200 focus:outline-none focus:ring-2 focus:ring-aqua-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="promoActiveCheck"
                  checked={promoForm.is_active}
                  onChange={(e) => setPromoForm({ ...promoForm, is_active: e.target.checked })}
                  className="rounded border-navy-300 text-aqua-600 focus:ring-aqua-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="promoActiveCheck" className="text-xs font-semibold text-darkNavy cursor-pointer">
                  Promotion is active across customer pages
                </label>
              </div>

              <div className="pt-4 border-t border-ice-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setPromoModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="font-bold bg-navy-500 text-white"
                >
                  Save Promotion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
