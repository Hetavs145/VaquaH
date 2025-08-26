import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/adminService';
import { Search, Shield, UserMinus, UserPlus, ChevronLeft } from 'lucide-react';

const UsersAdmin = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [users, setUsers] = useState([]);
	const [filtered, setFiltered] = useState([]);
	const [query, setQuery] = useState('');
	const [actionLoadingId, setActionLoadingId] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		(async () => {
			if (!user) return;
			setLoading(true);
			setError(null);
			try {
				const status = await adminService.checkAdminStatus(user.uid);
				setIsAdmin(!!status.isAdmin);
				if (status.isAdmin) {
					const list = await adminService.getAllUsers();
					setUsers(list);
					setFiltered(list);
				}
			} catch (e) {
				console.error('Failed to load users', e);
				setError(e?.message || 'Failed to load users');
			} finally {
				setLoading(false);
			}
		})();
	}, [user]);

	useEffect(() => {
		if (!query) {
			setFiltered(users);
			return;
		}
		const q = query.toLowerCase();
		setFiltered(
			users.filter(u =>
				(u.email || '').toLowerCase().includes(q) ||
				(u.name || '').toLowerCase().includes(q)
			)
		);
	}, [query, users]);

	const handleGrant = async (target) => {
		setActionLoadingId(target.id);
		try {
			await adminService.grantAdminRole(target.id, target.email, user.uid);
			setUsers(prev => prev.map(u => (u.id === target.id ? { ...u, role: 'admin' } : u)));
			setFiltered(prev => prev.map(u => (u.id === target.id ? { ...u, role: 'admin' } : u)));
		} catch (e) {
			console.error('Grant admin failed', e);
			setError(e?.message || 'Failed to grant admin');
		} finally {
			setActionLoadingId(null);
		}
	};

	const handleRemove = async (target) => {
		setActionLoadingId(target.id);
		try {
			await adminService.removeAdminRole(target.id, user.uid, 'Removed by admin');
			setUsers(prev => prev.map(u => (u.id === target.id ? { ...u, role: 'user' } : u)));
			setFiltered(prev => prev.map(u => (u.id === target.id ? { ...u, role: 'user' } : u)));
		} catch (e) {
			console.error('Remove admin failed', e);
			setError(e?.message || 'Failed to remove admin');
		} finally {
			setActionLoadingId(null);
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
					<Shield className="w-6 h-6 text-blue-600" />
					<h1 className="text-2xl sm:text-3xl font-bold">Users Management</h1>
					<Badge className="bg-purple-100 text-purple-800 border-purple-200">Admin</Badge>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle>Users</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
							<div className="relative w-full sm:w-72">
								<Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
								<Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name or email" className="pl-9" />
							</div>
						</div>

						<div className="rounded-md border overflow-hidden">
							<div className="hidden md:grid grid-cols-5 gap-2 p-3 font-medium text-sm bg-gray-50">
								<div>Name</div>
								<div>Email</div>
								<div>Role</div>
								<div>Created</div>
								<div className="text-right pr-2">Actions</div>
							</div>
							<div className="divide-y">
								{filtered.map(u => {
									const isUserAdmin = (u.role || '').toLowerCase() === 'admin';
									return (
										<div key={u.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3">
											<div>
												<div className="md:hidden text-xs text-gray-500">Name</div>
												<div className="font-medium">{u.name || u.email?.split('@')[0]}</div>
											</div>
											<div>
												<div className="md:hidden text-xs text-gray-500">Email</div>
												<div className="text-sm break-all md:truncate md:max-w-[220px]">{u.email}</div>
											</div>
											<div>
												<div className="md:hidden text-xs text-gray-500">Role</div>
												<Badge className={isUserAdmin ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
													{isUserAdmin ? 'Admin' : 'User'}
												</Badge>
											</div>
											<div>
												<div className="md:hidden text-xs text-gray-500">Created</div>
												<div className="text-sm">{u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : '-'}</div>
											</div>
											<div className="flex md:justify-end items-center gap-2">
												{isUserAdmin ? (
													<Button variant="outline" size="sm" disabled={actionLoadingId === u.id} onClick={() => handleRemove(u)}>
														{actionLoadingId === u.id ? 'Working...' : (<><UserMinus className="w-4 h-4 mr-1" /> Remove Admin</>)}
													</Button>
												) : (
													<Button size="sm" disabled={actionLoadingId === u.id} onClick={() => handleGrant(u)}>
														{actionLoadingId === u.id ? 'Working...' : (<><UserPlus className="w-4 h-4 mr-1" /> Make Admin</>)}
													</Button>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{error && (
							<div className="mt-4 text-sm text-red-600">{error}</div>
						)}
					</CardContent>
				</Card>
			</div>
			<Footer />
		</div>
	);
};

export default UsersAdmin;