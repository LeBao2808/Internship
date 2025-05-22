import { create } from 'zustand';

type MessageType = 'success' | 'error' | 'info' | null;

interface MessageState {
  message: string;
  type: MessageType;
  show: boolean;
  setMessage: (msg: string, type?: MessageType) => void;
  clearMessage: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  message: '',
  type: null,
  show: false,
  setMessage: (msg, type = 'success') =>
    set({ message: msg, type: type, show: true }),
  clearMessage: () =>
    set({ message: '', type: null, show: false }),
}));
