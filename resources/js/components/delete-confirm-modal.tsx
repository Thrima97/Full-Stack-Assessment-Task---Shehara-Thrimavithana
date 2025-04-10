import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmModal({ open, onClose, onConfirm }: Props) {
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
                            <Dialog.Panel className="w-full max-w-md transform rounded bg-white p-6 shadow-xl transition-all">
                                <Dialog.Title className="mb-3 text-lg font-semibold text-red-600">Confirm Delete</Dialog.Title>
                                <p className="mb-6 text-sm text-gray-700">
                                    Are you sure you want to delete this package? This action cannot be undone.
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button onClick={onClose} className="rounded border px-4 py-2 text-sm">
                                        Cancel
                                    </button>
                                    <button onClick={onConfirm} className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                                        Delete
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
