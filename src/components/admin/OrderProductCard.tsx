import React from 'react';

interface ProductInfo {
  id: string;
  name?: string | null;
  price?: number | string | null;
  imageUrl?: string | null;
  sku?: string | null;
  description?: string | null;
}

interface OrderProductCardProps {
  product?: ProductInfo | null;
  quantity: number;
  total: number | string | null;
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

const OrderProductCard: React.FC<OrderProductCardProps> = ({ product, quantity, total }) => {
  const unitPrice =
    typeof product?.price === 'number'
      ? product?.price
      : typeof product?.price === 'string'
      ? parseFloat(product.price)
      : null;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Cart Product</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-2">
            {product?.imageUrl ? (
              <div className="w-full aspect-[4/3] max-h-64 overflow-hidden rounded-lg border border-gray-100 bg-white">
                <img
                  src={product.imageUrl}
                  alt={product?.name || 'Product image'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] max-h-64 flex items-center justify-center bg-gray-50 text-gray-500 rounded-lg border border-dashed border-gray-300">
                No image
              </div>
            )}
          </div>
          <div className="md:col-span-3 space-y-4">
            <div>
              <p className="text-sm uppercase font-medium text-gray-500">Product Name</p>
              <p className="text-xl font-semibold text-gray-900">{product?.name || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">SKU</p>
                <p className="text-gray-900">{product?.sku || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Quantity</p>
                <p className="text-gray-900">{quantity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Unit Price</p>
                <p className="text-gray-900">
                  ${unitPrice !== null && !Number.isNaN(unitPrice) ? formatCurrency(unitPrice) : '0.00'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p className="text-gray-700 line-clamp-4">
                {product?.description || 'No description available for this product.'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Cart Total</span>
          <span className="text-lg font-semibold text-gray-900">${formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderProductCard;

