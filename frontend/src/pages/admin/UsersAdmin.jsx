import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Search, ShieldCheck } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from '@/hooks/use-toast';

const UsersAdmin = () => {
	const { user } = useAuth();
	const [adminStatus, setAdminStatus] = useState(null);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [query, setQuery] = useState('');

	useEffect(() => {
		const run = async () => {
			if (!user) return;
			try {
				const status = await adminService.checkAdminStatus(user.uid);
				setAdminStatus(status);
				if (status.isAdmin) {
					setLoading(true);
					const list = await adminService.getAllUsers();
					setUsers(list);
				}
			} catch (e) {
				console.error(e);
				toast({ title: 'Error', description: 'Unable to load users', variant: 'destructive' });
			} finally {
				setLoading(false);
			}
		};
		run();
	}, [user]);

	const filtered = useMemo(() => {
		if (!query) return users;
		const q = query.toLowerCase();
		return users.filter(u => (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q) || (u.id || '').toLowerCase().includes(q));
	}, [users, query]);

	return (
		<div className="min-h-screen flex flex-col">
			<Navbar />
			<div className="container-custom py-6 flex-1">
				<div className="flex items-center gap-3 mb-6">
					<Users className="w-7 h-7 text-blue-600" />
					<h1 className="text-2xl sm:text-3xl font-bold">Users Management</h1>
					<Badge className="bg-green-100 text-green-800 border-green-200">Admin</Badge>
				</div>

				<Card className="mb-6">
					<CardHeader>
						<CardTitle className="text-base sm:text-lg">Search</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Input placeholder="Search by name, email, or ID" value={query} onChange={(e) => setQuery(e.target.value)} />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-base sm:text-lg">Users ({filtered.length})</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="flex justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
							</div>
						) : filtered.length === 0 ? (
							<div className="text-center text-gray-500 py-8">No users found</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full text-sm">
									<thead>
										<tr className="text-left border-b">
											<th className="py-2 pr-4">User</th>
											<th className="py-2 pr-4">Email</th>
											<th className="py-2 pr-4">Role</th>
											<th className="py-2 pr-4">Created</th>
										</tr>
									</thead>
									<tbody>
										{filtered.map(u => (
											<tr key={u.id} className="border-b">
												<td className="py-2 pr-4">
													<div className="font-medium">{u.name || '—'}</div>
													<div className="text-xs text-gray-500">{u.id}</div>
												</td>
												<td className="py-2 pr-4">{u.email}</td>
												<td className="py-2 pr-4">
													<Badge className={u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
														{u.role || 'user'}
													</Badge>
												</td>
												<td className="py-2 pr-4">{u.createdAt?.toDate?.()?.toLocaleDateString?.() || '—'}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
			<Footer />
		</div>
	);
};

export default UsersAdmin;