import DeleteConfirmModal from '@/components/delete-confirm-modal';
import PackageFormModal from '@/components/package-form-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Packages', href: '/admin/packages' }];

interface Package {
    id: number;
    name: string;
    seat: number;
    description: string;
}

export default function PackagePage() {
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);

    const [formModalOpen, setFormModalOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Omit<Package, 'id'> & { id?: number }>({
        name: '',
        seat: 0,
        description: '',
    });

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchPackages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/packages');
            const data = await res.json();
            if (data.success) {
                setPackages(data.data);
            } else {
                toast.error('Failed to load packages');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error fetching packages');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const handleAddClick = () => {
        setForm({ name: '', seat: 0, description: '' });
        setEditing(false);
        setFormModalOpen(true);
    };

    const handleEditClick = (pkg: Package) => {
        setForm(pkg);
        setEditing(true);
        setFormModalOpen(true);
    };

    const handleDeleteConfirm = (id: number) => {
        setDeletingId(id);
        setDeleteModalOpen(true);
    };

    const deletePackage = async () => {
        if (!deletingId) return;

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await axios.delete(`/api/packages/${deletingId}`, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            });

            if (res.status === 200) {
                toast.success('Package deleted');
                fetchPackages();
                setDeleteModalOpen(false);
            } else {
                toast.error(res.data?.message || 'Deletion failed');
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Unexpected error during deletion');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Package Management" />
            <div className="mx-auto max-w-7xl space-y-8 px-4 py-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-2xl font-bold text-white">Package Management</h1>
                    <button onClick={handleAddClick} className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:w-auto">
                        + Add Package
                    </button>
                </div>

                {/* Packages Grid */}
                {loading ? (
                    <p className="text-gray-500">Loading packages...</p>
                ) : packages.length === 0 ? (
                    <p className="text-gray-500">No packages found.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => (
                            <div
                                key={pkg.id}
                                className="min-w-xs rounded-lg border border-gray-200 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
                            >
                                <div className="mb-2 flex items-start justify-between gap-4">
                                    <h2 className="text-lg font-semibold text-gray-900">{pkg.name}</h2>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEditClick(pkg)} className="cursor-pointer text-sm text-blue-500 hover:underline">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteConfirm(pkg.id)}
                                            className="cursor-pointer text-sm text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                <p className="mb-1 text-sm text-gray-600">Seats: {pkg.seat}</p>
                                <p className="text-sm text-gray-700">{pkg.description}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <PackageFormModal
                open={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmitSuccess={() => {
                    toast.success(editing ? 'Package updated' : 'Package created');
                    fetchPackages();
                }}
                form={form}
                setForm={setForm}
                editing={editing}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={deletePackage}
                title="Delete Package"
                message="Are you sure you want to delete this package?"
                confirmText="Delete"
            />
        </AppLayout>
    );
}
