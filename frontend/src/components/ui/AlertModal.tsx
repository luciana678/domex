'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import useAlertModal from '@/hooks/useAlertModal'

function AlertModal() {
  const {
    isOpen,
    setIsOpen,
    title,
    cancelButtonText,
    confirmButtonText,
    description,
    onConfirm,
    onCancel,
    resetAlertModal,
    allowEscapeKey,
    showCancelButton,
  } = useAlertModal()

  const handleOnKeydown = (e: KeyboardEvent) => {
    if (!allowEscapeKey) e.preventDefault()
  }

  const handleOnClose = () => {
    onCancel()
  }

  const handleOnConfirm = () => {
    onConfirm()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent
        onCloseAutoFocus={() => resetAlertModal()}
        onEscapeKeyDown={handleOnKeydown}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || 'Título modal'}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          {showCancelButton && (
            <AlertDialogCancel onClick={handleOnClose}>
              {cancelButtonText || 'Cancelar'}
            </AlertDialogCancel>
          )}

          <AlertDialogAction onClick={handleOnConfirm}>
            {confirmButtonText || 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AlertModal
