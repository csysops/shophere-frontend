import { create } from 'zustand';



export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressInput {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressState {
  addresses: Address[];
  currentAddress: Address | null;
  defaultAddress: Address | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAddresses: () => Promise<void>;
  fetchAddressById: (id: string) => Promise<void>;
  createAddress: (addressData: CreateAddressInput) => Promise<Address>;
  updateAddress: (id: string, addressData: Partial<CreateAddressInput>) => Promise<Address>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentAddress: () => void;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  currentAddress: null,
  defaultAddress: null,
  loading: false,
  error: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null });
    try {
      // TODO: Implement API call when backend endpoint is available
      // const { data } = await addressAPI.getAll();
      
      // For now, load from localStorage as a placeholder
      const savedAddresses = localStorage.getItem('addresses');
      const addresses = savedAddresses ? JSON.parse(savedAddresses) : [];
      const defaultAddress = addresses.find((addr: Address) => addr.isDefault) || null;
      
      set({
        addresses,
        defaultAddress,
        loading: false,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch addresses';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  fetchAddressById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Implement API call when backend endpoint is available
      // const { data } = await addressAPI.getById(id);
      
      const savedAddresses = localStorage.getItem('addresses');
      const addresses: Address[] = savedAddresses ? JSON.parse(savedAddresses) : [];
      const address = addresses.find((addr) => addr.id === id);
      
      if (!address) {
        throw new Error('Address not found');
      }
      
      set({
        currentAddress: address,
        loading: false,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch address';
      set({ error: errorMessage, loading: false, currentAddress: null });
      throw err;
    }
  },

  createAddress: async (addressData: CreateAddressInput) => {
    set({ loading: true, error: null });
    try {
      // TODO: Implement API call when backend endpoint is available
      // const { data } = await addressAPI.create(addressData);
      
      // Placeholder implementation using localStorage
      const savedAddresses = localStorage.getItem('addresses');
      const addresses: Address[] = savedAddresses ? JSON.parse(savedAddresses) : [];
      
      const newAddress: Address = {
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: 'current-user-id', // Should come from auth store
        ...addressData,
        isDefault: addressData.isDefault || addresses.length === 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // If this is set as default, remove default from others
      if (newAddress.isDefault) {
        addresses.forEach((addr) => {
          addr.isDefault = false;
        });
      }
      
      addresses.push(newAddress);
      localStorage.setItem('addresses', JSON.stringify(addresses));
      
      set((state) => ({
        addresses,
        defaultAddress: newAddress.isDefault ? newAddress : state.defaultAddress,
        loading: false,
      }));
      
      return newAddress;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create address';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  updateAddress: async (id: string, addressData: Partial<CreateAddressInput>) => {
    set({ loading: true, error: null });
    try {
      // TODO: Implement API call when backend endpoint is available
      // const { data } = await addressAPI.update(id, addressData);
      
      const savedAddresses = localStorage.getItem('addresses');
      const addresses: Address[] = savedAddresses ? JSON.parse(savedAddresses) : [];
      const addressIndex = addresses.findIndex((addr) => addr.id === id);
      
      if (addressIndex === -1) {
        throw new Error('Address not found');
      }
      
      const updatedAddress = {
        ...addresses[addressIndex],
        ...addressData,
        updatedAt: new Date().toISOString(),
      };
      
      // If this is set as default, remove default from others
      if (updatedAddress.isDefault) {
        addresses.forEach((addr) => {
          if (addr.id !== id) {
            addr.isDefault = false;
          }
        });
      }
      
      addresses[addressIndex] = updatedAddress;
      localStorage.setItem('addresses', JSON.stringify(addresses));
      
      set((state) => ({
        addresses,
        currentAddress: state.currentAddress?.id === id ? updatedAddress : state.currentAddress,
        defaultAddress: updatedAddress.isDefault ? updatedAddress : state.defaultAddress,
        loading: false,
      }));
      
      return updatedAddress;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update address';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  deleteAddress: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Implement API call when backend endpoint is available
      // await addressAPI.delete(id);
      
      const savedAddresses = localStorage.getItem('addresses');
      let addresses: Address[] = savedAddresses ? JSON.parse(savedAddresses) : [];
      const addressToDelete = addresses.find((addr) => addr.id === id);
      
      if (!addressToDelete) {
        throw new Error('Address not found');
      }
      
      addresses = addresses.filter((addr) => addr.id !== id);
      
      // If deleted address was default, set first address as default
      if (addressToDelete.isDefault && addresses.length > 0) {
        addresses[0].isDefault = true;
      }
      
      localStorage.setItem('addresses', JSON.stringify(addresses));
      
      set((state) => ({
        addresses,
        currentAddress: state.currentAddress?.id === id ? null : state.currentAddress,
        defaultAddress: addressToDelete.isDefault && addresses.length > 0 
          ? addresses[0] 
          : state.defaultAddress?.id !== id 
            ? state.defaultAddress 
            : null,
        loading: false,
      }));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete address';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  setDefaultAddress: async (id: string) => {
    set({ loading: true, error: null });
    try {
      // TODO: Implement API call when backend endpoint is available
      // await addressAPI.setDefault(id);
      
      const savedAddresses = localStorage.getItem('addresses');
      const addresses: Address[] = savedAddresses ? JSON.parse(savedAddresses) : [];
      
      const defaultAddr = addresses.find((addr) => addr.id === id);
      if (!defaultAddr) {
        throw new Error('Address not found');
      }
      
      // Update all addresses
      addresses.forEach((addr) => {
        addr.isDefault = addr.id === id;
        if (addr.id === id) {
          addr.updatedAt = new Date().toISOString();
        }
      });
      
      localStorage.setItem('addresses', JSON.stringify(addresses));
      
      set({
        addresses,
        defaultAddress: defaultAddr,
        loading: false,
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to set default address';
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearCurrentAddress: () => {
    set({ currentAddress: null });
  },
}));

