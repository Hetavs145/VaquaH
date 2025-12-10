import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Percent, ChevronLeft } from 'lucide-react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const OffersAdmin = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [offers, setOffers] = useState([]);
	const [form, setForm] = useState({ title: '', code: '', discountPercent: 0, active: true, isHidden: false, minOrderValue: 0 });
	const [editingId, setEditingId] = useState(null);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		(async () => {
			// Short-circuit if no authenticated user
			if (!user) {
				setIsAdmin(false);
				setLoading(false);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				// Use role already resolved by AuthContext to avoid extra Firestore reads
				const adminFlag = !!user.isAdmin;
				setIsAdmin(adminFlag);
				if (adminFlag) {
					await loadOffers();
				}
			} catch (e) {
				console.error('Failed to init offers', e);
				setError(e?.message || 'Failed to load offers');
			} finally {
				setLoading(false);
			}
		})();
	}, [user]);

	const loadOffers = async () => {
		try {
			if (!isAdmin) return;
			const q = query(collection(db, 'offers'), orderBy('createdAt', 'desc'));
			const snap = await getDocs(q);
			setOffers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
		} catch (e) {
			console.error('Load offers failed', e);
			setError(e?.message || 'Failed to load offers');
		}
	};

	const resetForm = () => {
		setForm({ title: '', code: '', discountPercent: 0, active: true, isHidden: false, minOrderValue: 0 });
		setEditingId(null);
	};

	const saveOffer = async (e) => {
		e.preventDefault();
		if (!isAdmin) {
			setError('Insufficient permissions');
			return;
		}
		setSaving(true);
		setError(null);
		try {
			if (editingId) {
				await updateDoc(doc(db, 'offers', editingId), {
					...form,
					updatedAt: serverTimestamp(),
				});
			} else {
				await addDoc(collection(db, 'offers'), {
					...form,
					discountPercent: Number(form.discountPercent) || 0,
					createdAt: serverTimestamp(),
					updatedAt: serverTimestamp(),
				});
			}
			await loadOffers();
			resetForm();
		} catch (e) {
			console.error('Save offer failed', e);
			setError(e?.message || 'Failed to save offer');
		} finally {
			setSaving(false);
		}
	};

	const editOffer = (offer) => {
		setEditingId(offer.id);
		setForm({
			title: offer.title || '',
			code: offer.code || '',
			discountPercent: offer.discountPercent || 0,
			active: !!offer.active,
			isHidden: !!offer.isHidden,
			minOrderValue: offer.minOrderValue || 0
		});
	};

	const removeOffer = async (id) => {
		if (!isAdmin) {
			setError('Insufficient permissions');
			return;
		}
		try {
			await deleteDoc(doc(db, 'offers', id));
			await loadOffers();
		} catch (e) {
			console.error('Delete offer failed', e);
			setError(e?.message || 'Failed to delete offer');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<div className="container-custom py-8 flex-1 flex items-center justify-center">
					<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
				</div>
				<Footer />
			</div>
		);
	}

	if (!isAdmin) {
		return (
			<div className="min-h-screen flex flex-col">
				<Navbar />
				<div className="container-custom py-8 flex-1">
					<Card className="max-w-md mx-auto">
						<CardHeader>
							<CardTitle>Access Denied</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-gray-600 mb-4">You need admin access to view this page.</p>
							<Button variant="outline" onClick={() => navigate('/admin')} className="w-full">
								<ChevronLeft className="w-4 h-4 mr-2" /> Go to Admin Dashboard
							</Button>
						</CardContent>
					</Card>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<div className="container-custom py-8 flex-1">
				<div className="flex items-center gap-3 mb-6">
					<Percent className="w-6 h-6 text-orange-600" />
					<h1 className="text-2xl sm:text-3xl font-bold">Offers & Discounts</h1>
					<Badge className="bg-orange-100 text-orange-800 border-orange-200">Admin</Badge>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>{editingId ? 'Edit Offer' : 'Create Offer'}</CardTitle>
					</CardHeader>
					<CardContent>
						<form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={saveOffer}>
							<Input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
							<Input placeholder="Code (e.g., SAVE10)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
							<Input placeholder="Discount %" type="number" min="0" max="100" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: e.target.value })} required />
							<Input placeholder="Min Order Value (₹)" type="number" min="0" value={form.minOrderValue} onChange={e => setForm({ ...form, minOrderValue: e.target.value })} />
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="isHidden"
									checked={form.isHidden}
									onChange={e => setForm({ ...form, isHidden: e.target.checked })}
									className="w-4 h-4"
								/>
								<label htmlFor="isHidden" className="text-sm font-medium">Hidden Offer</label>
							</div>
							<div className="flex gap-2">
								<Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editingId ? 'Update' : 'Create')}</Button>
								{editingId && (
									<Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
								)}
							</div>
						</form>
						{error && <div className="mt-3 text-sm text-red-600">{error}</div>}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Existing Offers</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border overflow-hidden">
							<div className="hidden md:grid grid-cols-5 gap-2 p-3 font-medium text-sm bg-gray-50">
								<div>Title</div>
								<div>Code</div>
								<div>Discount</div>
								<div>Min Order</div>
								<div>Active</div>
								<div className="text-right pr-2">Actions</div>
							</div>
							<div className="divide-y">
								{offers.map(o => (
									<div key={o.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3">
										<div className="font-medium">{o.title}</div>
										<div className="text-sm">{o.code}</div>
										<div className="text-sm">{Number(o.discountPercent || 0)}%</div>
										<div className="text-sm">₹{Number(o.minOrderValue || 0)}</div>
										<div>
											<Badge className={o.active ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>{o.active ? 'Active' : 'Inactive'}</Badge>
											{o.isHidden && <Badge className="ml-2 bg-purple-100 text-purple-800 border-purple-200">Hidden</Badge>}
										</div>
										<div className="flex md:justify-end items-center gap-2">
											<Button variant="outline" size="sm" onClick={() => editOffer(o)}>
												<Edit className="w-4 h-4 mr-1" /> Edit
											</Button>
											<Button variant="destructive" size="sm" onClick={() => removeOffer(o.id)}>
												<Trash2 className="w-4 h-4 mr-1" /> Delete
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<Footer />
		</div>
	);
};

export default OffersAdmin;