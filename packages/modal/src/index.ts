import { create } from "zustand";

export type ModalType = "birthdayAdd" | "error";

type ModalStore = {
  modalType: ModalType | null;
  isOpen: boolean;
  setIsOpen: (modalType: ModalType | null) => void;
  data: any;
  setData: (data: any) => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  modalType: null,
  isOpen: false,
  data: null,
  setIsOpen: (modalType) =>
    set((state) => ({
      modalType,
      isOpen: modalType !== null,
      data: modalType === null ? null : state.data,
    })),
  setData: (data) => set({ data }),
}));
