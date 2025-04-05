import DeleteConfirmModal from '@/components/delete-confirm-modal';
import PackageFormModal from '@/components/package-form-modal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Packages',
        href: '/admin/packages',
    },
];

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

    // ✅ Load packages
    const fetchPackages = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/packages');
            const data = await res.json();
            if (data.success) {
                setPackages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch packages', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    // ✅ Add
    const handleAdd = () => {
        setForm({ name: '', seat: 0, description: '' });
        setEditing(false);
        setFormModalOpen(true);
    };

    // ✅ Edit
    const handleEdit = (pkg: Package) => {
        setForm(pkg);
        setEditing(true);
        setFormModalOpen(true);
    };

    // ✅ Confirm delete
    const confirmDelete = (id: number) => {
        setDeletingId(id);
        setDeleteModalOpen(true);
    };

    // ✅ Handle delete using axios
    const handleConfirmDelete = async () => {
        if (!deletingId) return;

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

            const response = await axios.delete(`/api/packages/${deletingId}`, {
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    Accept: 'application/json',
                },
            });

            if (response.status === 200) {
                fetchPackages();
                setDeleteModalOpen(false);
            } else {
                alert(response.data?.message || 'Failed to delete package.');
            }
        } catch (error: any) {
            console.error('Delete failed:', error);
            alert(error?.response?.data?.message || 'Unexpected error during deletion.');
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Package Management" />

            <div className="mx-auto mt-8 max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Package Management</h1>
                    <button onClick={handleAdd} className="w-full rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 sm:w-auto">
                        + Add Package
                    </button>
                </div>

                {/* Loading / Empty */}
                {loading ? (
                    <p className="text-gray-500">Loading packages...</p>
                ) : packages.length === 0 ? (
                    <p className="text-gray-500">No packages found.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {packages.map((pkg) => (
                            <div key={pkg.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                                <div className="mb-2 flex items-start justify-between gap-4">
                                    <h2 className="text-lg font-semibold text-gray-800">{pkg.name}</h2>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(pkg)} className="text-sm text-blue-500 hover:underline">
                                            Edit
                                        </button>
                                        <button onClick={() => confirmDelete(pkg.id)} className="text-sm text-red-500 hover:underline">
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

            {/* Modal: Create/Edit */}
            <PackageFormModal
                open={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmitSuccess={fetchPackages}
                form={form}
                setForm={setForm}
                editing={editing}
            />

            {/* Modal: Delete Confirmation */}
            <DeleteConfirmModal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Package"
                message="Are you sure you want to delete this package?"
                confirmText="Delete"
            />
        </AppLayout>
    );
}
