import { Dialog, Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Fragment, useState } from 'react';

interface FormData {
    id?: number;
    name: string;
    seat: number;
    description: string;
}

interface SeatOption {
    label: string;
    value: number;
}

interface Props {
    open: boolean;
    onClose: () => void;
    onSubmitSuccess: () => void;
    form: FormData;
    setForm: (form: FormData) => void;
    editing: boolean;
}

export default function PackageFormModal({ open, onClose, onSubmitSuccess, form, setForm, editing }: Props) {
    const { props } = usePage();
    const seatCounts = props.seatOptions as SeatOption[];

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const csrf = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        const url = editing ? `/api/packages/${form.id}` : '/api/packages';
        const method = editing ? 'put' : 'post';

        try {
            const response = await axios({
                url,
                method,
                data: form,
                withCredentials: true,
                headers: {
                    'X-CSRF-TOKEN': csrf,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.success) {
                onSubmitSuccess();
                onClose();
            }
        } catch (err: any) {
            if (err.response?.status === 422 && err.response.data.errors) {
                setErrors(err.response.data.errors);
            } else {
                console.error('Unexpected error:', err);
                alert('Something went wrong.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)]" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title className="mb-4 text-lg font-semibold">{editing ? 'Edit Package' : 'Add New Package'}</Dialog.Title>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Package Name */}
                                    <div>
                                        <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
                                            Package Name
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="w-full rounded border px-3 py-2"
                                            required
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    {/* Seat Count */}
                                    <div>
                                        <label htmlFor="seat" className="mb-1 block text-sm font-medium text-gray-700">
                                            Seat Count
                                        </label>
                                        <select
                                            id="seat"
                                            value={form.seat}
                                            onChange={(e) => setForm({ ...form, seat: Number(e.target.value) })}
                                            className="w-full rounded border px-3 py-2"
                                            required
                                        >
                                            <option value="">Select seat count</option>
                                            {seatCounts.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.seat && <p className="mt-1 text-sm text-red-600">{errors.seat}</p>}
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="w-full rounded border px-3 py-2"
                                            required
                                        />
                                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="cursor-pointer rounded border px-4 py-2 text-sm"
                                            disabled={submitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="cursor-pointer rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                        >
                                            {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
