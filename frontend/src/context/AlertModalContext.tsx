'use client'

import { PropsWithChildren, createContext, useState } from 'react'

export type AlertModalContextType = {
  resetAlertModal: () => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  description: string
  setDescription: (description: string) => void
  title: string
  setTitle: (title: string) => void
  confirmButtonText: string
  setConfirmButtonText: (confirmButtonText: string) => void
  cancelButtonText: string
  setCancelButtonText: (cancelButtonText: string) => void
  onConfirm: () => void
  setOnConfirm: (onConfirm: () => void) => void
  onCancel: () => void
  setOnCancel: (onCancel: () => void) => void
  allowEscapeKey: boolean
  setAllowEscapeKey: (allowEscapeKey: boolean) => void
  showCancelButton: boolean
  setShowCancelButton: (showCancelButton: boolean) => void
}

const AlertModalContext = createContext<AlertModalContextType>({
  resetAlertModal: () => {},
  isOpen: false,
  setIsOpen: () => {},
  description: '',
  setDescription: () => {},
  title: '',
  setTitle: () => {},
  confirmButtonText: '',
  setConfirmButtonText: () => {},
  cancelButtonText: '',
  setCancelButtonText: () => {},
  onConfirm: () => {},
  setOnConfirm: () => {},
  onCancel: () => {},
  setOnCancel: () => {},
  allowEscapeKey: false,
  setAllowEscapeKey: () => {},
  showCancelButton: false,
  setShowCancelButton: () => {},
})

export const AlertModalProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<AlertModalContextType['isOpen']>(false)
  const [description, setDescription] = useState<AlertModalContextType['description']>('')
  const [title, setTitle] = useState<AlertModalContextType['title']>('')
  const [confirmButtonText, setConfirmButtonText] =
    useState<AlertModalContextType['confirmButtonText']>('')
  const [cancelButtonText, setCancelButtonText] =
    useState<AlertModalContextType['cancelButtonText']>('')
  const [onConfirm, setOnConfirm] = useState<AlertModalContextType['onConfirm']>(() => () => {})
  const [onCancel, setOnCancel] = useState<AlertModalContextType['onCancel']>(() => () => {})
  const [allowEscapeKey, setAllowEscapeKey] =
    useState<AlertModalContextType['allowEscapeKey']>(false)
  const [showCancelButton, setShowCancelButton] =
    useState<AlertModalContextType['showCancelButton']>(true)

  const resetAlertModal = () => {
    setIsOpen(false)
    setDescription('')
    setTitle('')
    setConfirmButtonText('')
    setCancelButtonText('')
    setOnConfirm(() => () => {})
    setOnCancel(() => () => {})
    setAllowEscapeKey(false)
  }

  return (
    <AlertModalContext.Provider
      value={{
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
      }}>
      {children}
    </AlertModalContext.Provider>
  )
}

export default AlertModalContext
