import { useToastStore } from '../toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('showToast', () => {
    it('adds a toast to the toasts array', () => {
      useToastStore.getState().showToast('Hello');
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('sets the message correctly', () => {
      useToastStore.getState().showToast('Something went wrong');
      expect(useToastStore.getState().toasts[0].message).toBe('Something went wrong');
    });

    it('defaults type to info when not specified', () => {
      useToastStore.getState().showToast('Hello');
      expect(useToastStore.getState().toasts[0].type).toBe('info');
    });

    it('sets type to error when specified', () => {
      useToastStore.getState().showToast('Failed', 'error');
      expect(useToastStore.getState().toasts[0].type).toBe('error');
    });

    it('sets type to success when specified', () => {
      useToastStore.getState().showToast('Saved', 'success');
      expect(useToastStore.getState().toasts[0].type).toBe('success');
    });

    it('assigns a unique id to each toast', () => {
      useToastStore.getState().showToast('First');
      useToastStore.getState().showToast('Second');
      const toasts = useToastStore.getState().toasts;
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('can show multiple toasts at once', () => {
      useToastStore.getState().showToast('First');
      useToastStore.getState().showToast('Second');
      useToastStore.getState().showToast('Third');
      expect(useToastStore.getState().toasts).toHaveLength(3);
    });

    it('auto-dismisses after 3 seconds', () => {
      useToastStore.getState().showToast('Auto dismiss');
      expect(useToastStore.getState().toasts).toHaveLength(1);

      jest.advanceTimersByTime(3000);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('does not dismiss before 3 seconds', () => {
      useToastStore.getState().showToast('Not yet');
      jest.advanceTimersByTime(2999);
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('only dismisses the correct toast when multiple exist', () => {
      useToastStore.getState().showToast('First');
      jest.advanceTimersByTime(1000);
      useToastStore.getState().showToast('Second');
      jest.advanceTimersByTime(2000);

      // first toast should be gone (3s elapsed), second should remain
      const toasts = useToastStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Second');
    });
  });

  describe('hideToast', () => {
    it('removes the toast with the matching id', () => {
      useToastStore.getState().showToast('To remove');
      const id = useToastStore.getState().toasts[0].id;

      useToastStore.getState().hideToast(id);

      expect(useToastStore.getState().toasts).toHaveLength(0);
    });

    it('does not remove other toasts', () => {
      useToastStore.getState().showToast('Keep me');
      useToastStore.getState().showToast('Remove me');
      const toasts = useToastStore.getState().toasts;
      const removeId = toasts[1].id;

      useToastStore.getState().hideToast(removeId);

      expect(useToastStore.getState().toasts).toHaveLength(1);
      expect(useToastStore.getState().toasts[0].message).toBe('Keep me');
    });

    it('does nothing when id does not exist', () => {
      useToastStore.getState().showToast('Keep me');

      useToastStore.getState().hideToast('nonexistent-id');

      expect(useToastStore.getState().toasts).toHaveLength(1);
    });

    it('handles hiding from empty toasts array', () => {
      expect(() => {
        useToastStore.getState().hideToast('nonexistent-id');
      }).not.toThrow();
    });
  });
});
