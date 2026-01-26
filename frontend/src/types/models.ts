/**
 * Shared type definitions for the OctoCAT Supply Chain Management Application
 * These types align with the API models in api/src/models/
 */

export interface Product {
  productId: number;
  supplierId: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  unit: string;
  imgName: string;
  discount?: number;
}

export interface Supplier {
  supplierId: number;
  name: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Branch {
  branchId: number;
  headquartersId: number;
  name: string;
  description: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Headquarters {
  headquartersId: number;
  name: string;
  description: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
}

export interface Order {
  orderId: number;
  branchId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
}

export interface OrderDetail {
  orderDetailId: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
}

export interface Delivery {
  deliveryId: number;
  orderId: number;
  deliveryDate: string;
  status: string;
  trackingNumber: string;
}

export interface OrderDetailDelivery {
  orderDetailDeliveryId: number;
  orderDetailId: number;
  deliveryId: number;
  quantityDelivered: number;
}
