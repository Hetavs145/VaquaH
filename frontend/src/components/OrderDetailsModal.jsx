import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { Package, Truck, CreditCard } from 'lucide-react';
import { productService, servicesService } from '@/services/firestoreService';
import StarRating from '@/components/StarRating';

const OrderDetailsModal = ({ order, isOpen, onClose, reviews, onRate }) => {
    // Local state to store items with fetched images if missing
    const [enrichedItems, setEnrichedItems] = useState([]);

    useEffect(() => {
        const fetchImagesForItems = async () => {
            if (!order || !order.items) return;

            console.log("OrderDetailsModal: Fetching images for items...", order.items);

            const itemsWithImages = await Promise.all(order.items.map(async (item) => {
                // If image already exists, use it
                if (item.image) {
                    return item;
                }

                // Otherwise, fetch it
                try {
                    const id = item.id || item.productId; // Try both standard ID fields

                    let fetchedItem = null;

                    if (item.type === 'service') {
                        fetchedItem = await servicesService.getServiceById(id);
                    } else {
                        // Default to product
                        fetchedItem = await productService.getProductById(id);
                    }

                    if (fetchedItem) {
                        // Check common image fields
                        const imageUrl = fetchedItem.image || fetchedItem.img || (fetchedItem.images && fetchedItem.images[0]);
                        if (imageUrl) {
                            return { ...item, image: imageUrl };
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch image for item:", item.name, err);
                }

                return item;
            }));

            setEnrichedItems(itemsWithImages);
        };

        if (isOpen && order) {
            setEnrichedItems(order.items || []); // Show initial data immediately
            fetchImagesForItems();
        }
    }, [order, isOpen]);

    if (!order) return null;

    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            paid: 'bg-blue-100 text-blue-800',
            confirmed: 'bg-indigo-100 text-indigo-800',
            shipping: 'bg-purple-100 text-purple-800',
            out_for_delivery: 'bg-yellow-100 text-yellow-800',
            success: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
            created: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                        <span>Order #{order.id ? order.id.slice(-8).toUpperCase() : 'N/A'}</span>
                        <span className={`text-sm px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                            {order.status?.replace(/_/g, ' ').toUpperCase()}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Placed on {formatDate(order.createdAt)}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                    {/* Order Items */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Package className="w-5 h-5 text-gray-600" /> Items
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            {enrichedItems.map((item, index) => (
                                <div key={index} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded shadow-sm border">
                                    {/* Image Link */}
                                    <Link to={`/${item.type === 'service' ? 'services' : 'products'}/${item.id || item.productId}`} className="shrink-0 group">
                                        <div className="w-20 h-20 bg-white rounded border border-gray-100 overflow-hidden relative flex items-center justify-center p-1">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center p-1 bg-gray-50">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="flex-1 text-center sm:text-left">
                                        <Link to={`/${item.type === 'service' ? 'services' : 'products'}/${item.id || item.productId}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors block mb-1">
                                            {item.name}
                                        </Link>
                                        <div className="text-sm text-gray-500">Type: {item.type || 'Product'}</div>
                                        <div className="text-sm font-semibold mt-1">₹{item.price} x {item.qty}</div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="font-bold text-lg text-gray-800">
                                            ₹{(item.price * item.qty).toFixed(2)}
                                        </div>

                                        {onRate && ['delivered', 'completed', 'success'].includes((order.status || '').toLowerCase()) && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Rate Product</span>
                                                <StarRating
                                                    itemId={item.id || item.productId}
                                                    type={item.type || 'product'}
                                                    status={order.status}
                                                    itemDetails={item}
                                                    reviews={reviews}
                                                    onRate={onRate}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary & Shipping */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Truck className="w-5 h-5 text-gray-600" /> Shipping Details
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Method:</span>
                                    <span className="font-medium text-gray-900 uppercase">{order.shippingMethod}</span>
                                </div>
                                {order.shippingId && (
                                    <div className="flex justify-between">
                                        <span>AWB / Tracking:</span>
                                        <span className="font-medium text-green-600">{order.shippingId}</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t mt-2">
                                    {/* We can display address here if we had stored it in the order object directly or fetch user. 
                                Assuming it might not be in the minimal order object shown in logs, but if it is: */}
                                    {/* <p>{order.address?.line1}</p> ... */}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-600" /> Payment Summary
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal (approx)</span>
                                    <span>₹{order.items?.reduce((acc, i) => acc + (i.price * i.qty), 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping Cost</span>
                                    <span>₹{order.shippingCost || 0}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200 mt-2">
                                    <span>Total Amount</span>
                                    <span>₹{order.totalPrice}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-500">
                                    Payment Method: <span className="font-medium text-gray-800">{order.paymentMethod}</span>
                                    <br />
                                    Status: {order.isPaid ? 'Paid' : 'Pending Payment'}
                                    {order.advanceAmount > 0 && ` (Advance: ₹${order.advanceAmount})`}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OrderDetailsModal;
