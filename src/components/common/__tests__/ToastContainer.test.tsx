import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ToastContainer } from '../ToastContainer';
import { useToastStore } from '../../../store/toastStore';

describe('ToastContainer', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('when no toasts exist', () => {
    it('renders nothing', () => {
      render(<ToastContainer />);
      expect(screen.queryByTestId('toast-container')).toBeNull();
    });
  });

  describe('when toasts exist', () => {
    it('renders the toast container', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Hello');
      });

      expect(screen.getByTestId('toast-container')).toBeTruthy();
    });

    it('renders the toast message', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Something went wrong');
      });

      expect(screen.getByText('Something went wrong')).toBeTruthy();
    });

    it('renders multiple toasts', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('First');
        useToastStore.getState().showToast('Second');
      });

      expect(screen.getByText('First')).toBeTruthy();
      expect(screen.getByText('Second')).toBeTruthy();
    });

    it('renders a dismiss button for each toast', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Hello');
      });

      expect(screen.getByTestId('toast-dismiss')).toBeTruthy();
    });

    it('dismisses the toast when dismiss button is pressed', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Dismiss me');
      });

      fireEvent.press(screen.getByTestId('toast-dismiss'));

      expect(screen.queryByTestId('toast-container')).toBeNull();
    });

    it('removes toast after 3 seconds', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Auto dismiss');
      });

      expect(screen.getByText('Auto dismiss')).toBeTruthy();

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      expect(screen.queryByTestId('toast-container')).toBeNull();
    });
  });

  describe('toast types', () => {
    it('renders an error toast', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Error message', 'error');
      });

      expect(screen.getByText('Error message')).toBeTruthy();
    });

    it('renders a success toast', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Success message', 'success');
      });

      expect(screen.getByText('Success message')).toBeTruthy();
    });

    it('renders an info toast', () => {
      render(<ToastContainer />);

      act(() => {
        useToastStore.getState().showToast('Info message', 'info');
      });

      expect(screen.getByText('Info message')).toBeTruthy();
    });
  });
});
