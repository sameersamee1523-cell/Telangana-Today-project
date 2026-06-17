import Modal from './Modal'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm' }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Action" size="sm">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-surface-800 dark:text-white">{title}</h3>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{message}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <button onClick={onClose} className="btn btn-ghost">Cancel</button>
        <button onClick={() => { onConfirm(); onClose() }} className="btn btn-danger">{confirmLabel}</button>
      </div>
    </Modal>
  )
}
