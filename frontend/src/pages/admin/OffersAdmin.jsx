import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Plus } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

const OffersAdmin = () => {
	const { user } = useAuth();
	const [adminStatus, setAdminStatus] = useState(null);
	const [offers, setOffers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState('');
	const [discountPct, setDiscountPct] = useState('');
	const [productId, setProductId] = useState('');
	const [products, setProducts] = useState([]);

	useEffect(() => {
		const run = async () => {
			if (!user) return;
			try {
				const status = await adminService.checkAdminStatus(user.uid);
				setAdminStatus(status);
				if (status.isAdmin) {
					setLoading(true);
					const [prods, existingOffers] = await Promise.all([
						adminService.getAllProducts(),
						adminService.getOffers?.() || []
					]);
					setProducts(prods);
					setOffers(existingOffers || []);
				}
			} catch (e) {
				console.error(e);
				toast({ title: 'Error', description: 'Unable to load offers', variant: 'destructive' });
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [user]);

	const onCreate = async () => {
		try {
			if (!title || !discountPct) {
				toast({ title: 'Missing data', description: 'Title and discount are required', variant: 'destructive' });
				return;
			}
			const pct = Number(discountPct);
			if (Number.isNaN(pct) || pct <= 0 || pct > 90) {
				toast({ title: 'Invalid discount', description: 'Enter a value between 1 and 90', variant: 'destructive' });
				return;
			}
			const payload = { title, discountPct: pct, productId: productId || null, active: true };
			const created = await adminService.createOffer?.(payload);
			if (created) {
				setOffers(prev => [created, ...prev]);
				setTitle('');
				setDiscountPct('');
				setProductId('');
				toast({ title: 'Offer created' });
			} else {
				toast({ title: 'Saved', description: 'Offer saved (custom impl)' });
			}
		} catch (e) {
			console.error(e);
			toast({ title: 'Error', description: 'Failed to create offer', variant: 'destructive' });
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<div className="container-custom py-6 flex-1">
				<div className="flex items-center gap-3 mb-6">
					<TrendingUp className="w-7 h-7 text-orange-600" />
					<h1 className="text-2xl sm:text-3xl font-bold">Offers & Discounts</h1>
					<Badge className="bg-green-100 text-green-800 border-green-200">Admin</Badge>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-base sm:text-lg">Create Offer</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
							<Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
							<Input type="number" inputMode="numeric" placeholder="Discount %" value={discountPct} onChange={e => setDiscountPct(e.target.value)} />
							<select className="border rounded-md px-2 py-2 text-sm" value={productId} onChange={e => setProductId(e.target.value)}>
								<option value="">All Products</option>
								{products.map(p => (
									<option key={p.id} value={p.id}>{p.name}</option>
								))}
							</select>
							<Button onClick={onCreate} className="bg-orange-600 hover:bg-orange-700"><Plus className="w-4 h-4 mr-1" />Create</Button>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base sm:text-lg">Existing Offers ({offers.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-600"></div>
							</div>
						) : offers.length === 0 ? (
							<div className="text-center text-gray-500 py-8">No offers yet</div>
						) : (
							<div className="space-y-3">
								{offers.map(o => (
									<div key={o.id || o.title} className="border rounded-lg p-3 sm:p-4 flex items-center justify-between">
										<div>
											<div className="font-medium">{o.title}</div>
											<div className="text-xs text-gray-500">{o.productId ? `Product: ${o.productId}` : 'All Products'}</div>
										</div>
										<Badge className="bg-orange-100 text-orange-800">{o.discountPct}%</Badge>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
			<Footer />
		</div>
	);
};

export default OffersAdmin;