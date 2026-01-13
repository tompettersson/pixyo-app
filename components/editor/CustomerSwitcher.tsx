'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useEditorStore } from '@/store/useEditorStore';
import type { Customer, Design } from '@/types/customer';

interface CustomerSwitcherProps {
  onCustomerChange?: (customer: Customer) => void;
  onSaveBeforeSwitch?: () => Promise<void>;
}

export function CustomerSwitcher({ onCustomerChange, onSaveBeforeSwitch }: CustomerSwitcherProps) {
  const {
    customer: { customers, activeCustomerId, isLoadingCustomers },
    setCustomers,
    setActiveCustomer,
    setIsLoadingCustomers,
    setDesigns,
    setActiveDesign,
    setIsLoadingDesigns,
    loadDesignIntoEditor,
    addDesign,
  } = useEditorStore();

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Track if initial load has happened
  const hasLoadedRef = useRef(false);
  const previousCustomerIdRef = useRef<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load customers on mount - only once
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadCustomers = async () => {
      setIsLoadingCustomers(true);
      try {
        const response = await fetch('/api/profiles');
        if (!response.ok) throw new Error('Failed to load profiles');
        const data = await response.json();

        if (data.profiles && data.profiles.length > 0) {
          const mappedCustomers: Customer[] = data.profiles.map((profile: any) => ({
            id: profile.id,
            slug: profile.slug,
            name: profile.name,
            logo: profile.logo,
            logoVariants: profile.logoVariants,
            colors: profile.colors,
            fonts: profile.fonts,
            layout: profile.layout,
            systemPrompt: profile.systemPrompt,
          }));

          setCustomers(mappedCustomers);

          if (mappedCustomers.length > 0) {
            setActiveCustomer(mappedCustomers[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load customers:', error);
      } finally {
        setIsLoadingCustomers(false);
      }
    };

    loadCustomers();
  }, []);

  // Create a new design for the customer
  const createNewDesign = useCallback(async (customerId: string): Promise<Design | null> => {
    try {
      const defaultCanvasState = {
        width: 1200,
        height: 1200,
        aspectRatio: '1:1',
        backgroundColor: '#1a1a1a',
      };
      const defaultLayers: any[] = [];

      const response = await fetch('/api/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: customerId,
          name: 'Neues Design',
          canvasState: defaultCanvasState,
          layers: defaultLayers,
        }),
      });

      if (!response.ok) throw new Error('Failed to create design');
      const data = await response.json();
      return data.design;
    } catch (error) {
      console.error('Failed to create new design:', error);
      return null;
    }
  }, []);

  // Load designs when active customer changes
  useEffect(() => {
    if (!activeCustomerId || activeCustomerId === previousCustomerIdRef.current) {
      return;
    }

    previousCustomerIdRef.current = activeCustomerId;

    const loadDesignsAndAutoLoad = async () => {
      setIsLoadingDesigns(true);
      try {
        const response = await fetch(`/api/designs?profileId=${activeCustomerId}`);
        if (!response.ok) throw new Error('Failed to load designs');
        const data = await response.json();

        let designs: Design[] = data.designs || [];

        designs = designs.sort((a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        if (designs.length === 0) {
          const newDesign = await createNewDesign(activeCustomerId);
          if (newDesign) {
            designs = [newDesign];
          }
        }

        setDesigns(designs);

        if (designs.length > 0) {
          loadDesignIntoEditor(designs[0]);
        }
      } catch (error) {
        console.error('Failed to load designs:', error);
        setDesigns([]);
        setActiveDesign(null);
      } finally {
        setIsLoadingDesigns(false);
      }
    };

    loadDesignsAndAutoLoad();

    const activeCustomer = customers.find(c => c.id === activeCustomerId);
    if (activeCustomer && onCustomerChange) {
      onCustomerChange(activeCustomer);
    }
  }, [activeCustomerId, createNewDesign, loadDesignIntoEditor]);

  const handleCustomerClick = useCallback(async (customerId: string) => {
    if (customerId !== activeCustomerId) {
      if (onSaveBeforeSwitch) {
        await onSaveBeforeSwitch();
      }
      setActiveCustomer(customerId);
    }
    setIsOpen(false);
  }, [activeCustomerId, onSaveBeforeSwitch, setActiveCustomer]);

  const activeCustomer = customers.find(c => c.id === activeCustomerId);

  // Compact dropdown version
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => {
          if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPosition({
              top: rect.bottom + 4,
              left: rect.left,
            });
          }
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-all
          text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
        title="Kunde wechseln"
      >
        {/* Building Icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>

        {/* Loading spinner */}
        {isLoadingCustomers && (
          <div className="w-3 h-3 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
        )}
      </button>

      {/* Dropdown Menu - Fixed positioning to escape overflow */}
      {isOpen && customers.length > 0 && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          {/* Menu */}
          <div
            className="fixed bg-zinc-800 rounded-lg border border-zinc-700 shadow-xl overflow-hidden min-w-44 z-[70]"
            style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
          >
            {customers.map((customer) => {
              const isActive = customer.id === activeCustomerId;

              return (
                <button
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer.id)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2
                    ${isActive
                      ? 'bg-zinc-700 text-white'
                      : 'text-zinc-300 hover:bg-zinc-700/50'
                    }`}
                >
                  {isActive && (
                    <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                  <span className={!isActive ? 'ml-5' : ''}>{customer.name}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
