import AlertModalContext from '@/context/AlertModalContext'
import { useContext } from 'react'

const useAlertModal = () => {
  const {
    resetAlertModal,
    isOpen,
    setIsOpen,
    description,
    setDescription,
    title,
    setTitle,
    confirmButtonText,
    setConfirmButtonText,
    cancelButtonText,
    setCancelButtonText,
    onConfirm,
    setOnConfirm,
    onCancel,
    setOnCancel,
    allowEscapeKey,
    setAllowEscapeKey,
    showCancelButton,
    setShowCancelButton,
  } = useContext(AlertModalContext)

  const showAlert = ({
    title,
    description = '',
    confirmButtonText = '',
    cancelButtonText = '',
    onConfirm,
    onCancel,
    allowEscapeKey = false,
    showCancelButton = true,
  }: {
    title: string
    description?: string
    allowEscapeKey?: boolean
    showCancelButton?: boolean
    confirmButtonText?: string
    cancelButtonText?: string
    onCancel?: () => void
    onConfirm?: () => void
  }) => {
    setTitle(title)
    setDescription(description)
    setConfirmButtonText(confirmButtonText)
    setCancelButtonText(cancelButtonText)
    setAllowEscapeKey(allowEscapeKey)
    onConfirm && setOnConfirm(() => onConfirm)
    onCancel && setOnCancel(() => onCancel)
    setShowCancelButton(showCancelButton)
    setIsOpen(true)
  }

  const showConfirmAlert = ({
    title,
    description = '',
    confirmButtonText = '',
    allowEscapeKey = false,
    onConfirm,
  }: {
    title: string
    description?: string
    allowEscapeKey?: boolean
    confirmButtonText?: string
    onConfirm?: () => void
  }) => {
    showAlert({
      title,
      description,
      confirmButtonText,
      allowEscapeKey,
      showCancelButton: false,
      onConfirm,
    })
  }

  const showConfirmAlertWithCancel = ({
    title,
    description = '',
    confirmButtonText = '',
    cancelButtonText = '',
    allowEscapeKey = false,
    onConfirm,
    onCancel,
  }: {
    title: string
    description?: string
    allowEscapeKey?: boolean
    confirmButtonText?: string
    cancelButtonText?: string
    onCancel?: () => void
    onConfirm?: () => void
  }) => {
    showAlert({
      title,
      description,
      confirmButtonText,
      cancelButtonText,
      allowEscapeKey,
      showCancelButton: true,
      onConfirm,
      onCancel,
    })
  }

  return {
    isOpen,
    setIsOpen,
    description,
    setDescription,
    title,
    setTitle,
    confirmButtonText,
    setConfirmButtonText,
    cancelButtonText,
    setCancelButtonText,
    onConfirm,
    onCancel,
    resetAlertModal,
    allowEscapeKey,
    setAllowEscapeKey,
    showCancelButton,
    showAlert,
    showConfirmAlert,
    showConfirmAlertWithCancel,
  }
}

export default useAlertModal
