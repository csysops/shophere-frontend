import React from 'react';

export type OrderHistoryStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface OrderHistoryItem {
  id: string;
  createdAt: string;
  total: number | string | null;
  quantity: number;
  status: OrderHistoryStatus;
  product?: {
    id: string;
    name?: string | null;
    price?: number | string | null;
    imageUrl?: string | null;
    sku?: string | null;
  } | null;
}

interface OrderHistoryCardProps {
  order: OrderHistoryItem;
  onClick?: (orderId: string) => void;
  actionArea?: React.ReactNode;
}

const formatCurrency = (value: number | string | null | undefined) => {
  if (typeof value === 'number') {
    return value.toFixed(2);
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      return parsed.toFixed(2);
    }
  }
  return '0.00';
};

const statusClass: Record<OrderHistoryStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const OrderHistoryCard: React.FC<OrderHistoryCardProps> = ({ order, onClick, actionArea }) => {
  const unitPrice =
    typeof order.product?.price === 'number'
      ? order.product?.price
      : typeof order.product?.price === 'string'
      ? parseFloat(order.product.price)
      : null;

  return (
    <div
      className={`w-full rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(order.id)}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : -1}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            {order.product?.imageUrl ? (
              <img
                src={order.product.imageUrl}
                alt={order.product?.name || 'Product image'}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded object-cover border border-gray-100"
              />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded bg-gray-100 text-gray-500 grid place-content-center border border-dashed border-gray-300">
                No image
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500">Order #{order.id.substring(0, 8)}</div>
              <div className="text-base sm:text-lg font-semibold text-gray-900">
                {order.product?.name || 'Product'}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass[order.status]}`}>
            {order.status}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Quantity</div>
            <div className="font-medium text-gray-900">{order.quantity}</div>
          </div>
          <div>
            <div className="text-gray-500">Unit Price</div>
            <div className="font-medium text-gray-900">
              ${unitPrice !== null && !Number.isNaN(unitPrice) ? formatCurrency(unitPrice) : '0.00'}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Total</div>
            <div className="font-semibold text-gray-900">${formatCurrency(order.total)}</div>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-end justify-end">{actionArea}</div>
        </div>
      </div>
    </div>
  );
};

export default OrderHistoryCard;


