import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    duration: string;
    endDate: string;
}

export default function ExtendConfirmModal({ open, onClose, onConfirm, duration, endDate }: Props) {
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
                                <Dialog.Title className="mb-3 text-lg font-semibold text-gray-800">Confirm Extension</Dialog.Title>
                                <p className="mb-6 text-sm text-gray-700">
                                    Are you sure you want to extend this booking by <strong>{duration}</strong>?<br />
                                    New end date: <strong>{endDate}</strong>
                                </p>
                                <div className="flex justify-end gap-3">
                                    <button onClick={onClose} className="rounded border px-4 py-2 text-sm">
                                        Cancel
                                    </button>
                                    <button onClick={onConfirm} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                                        Confirm
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
