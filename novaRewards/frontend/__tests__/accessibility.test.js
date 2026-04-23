import React from 'react';
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import BottomNav from '../components/BottomNav';
import ConfirmationModal from '../components/ConfirmationModal';
import { ToastProvider } from '../components/Toast';
import Leaderboard from '../components/Leaderboard';

// ── Next.js router mock ───────────────────────────────────────────────────────
jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/dashboard' }),
}));

jest.mock('next/link', () =>
  function Link({ href, children, ...props }) {
    return <a href={href} {...props}>{children}</a>;
  }
);

// ── Leaderboard service mock ──────────────────────────────────────────────────
jest.mock('../lib/leaderboardService', () => ({
  leaderboardService: {
    getLeaderboard: jest.fn().mockResolvedValue([
      { publicKey: 'GABC', displayName: 'Alice', totalPoints: '1500', avatar: null },
      { publicKey: 'GDEF', displayName: 'Bob',   totalPoints: '1200', avatar: null },
    ]),
  },
}));

jest.mock('../context/WalletContext', () => ({
  useWallet: () => ({ publicKey: 'GABC' }),
}));

jest.mock('../lib/truncateAddress', () => ({
  truncateAddress: (addr) => addr.slice(0, 6) + '...',
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
async function expectNoViolations(ui) {
  const { container } = render(ui);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
}

// ── Button ────────────────────────────────────────────────────────────────────
describe('Button — axe', () => {
  test('primary button has no violations', async () => {
    await expectNoViolations(<Button>Save</Button>);
  });

  test('disabled button has no violations', async () => {
    await expectNoViolations(<Button disabled>Save</Button>);
  });

  test('danger button has no violations', async () => {
    await expectNoViolations(<Button variant="danger">Delete</Button>);
  });
});

// ── Input ─────────────────────────────────────────────────────────────────────
describe('Input — axe', () => {
  test('input with label has no violations', async () => {
    await expectNoViolations(<Input label="Email address" type="email" />);
  });

  test('input with error has no violations', async () => {
    await expectNoViolations(
      <Input label="Email address" type="email" error="Invalid email address" />
    );
  });

  test('input with aria-label (no visible label) has no violations', async () => {
    await expectNoViolations(<Input aria-label="Search" type="search" />);
  });
});

// ── BottomNav ─────────────────────────────────────────────────────────────────
describe('BottomNav — axe', () => {
  test('bottom navigation has no violations', async () => {
    await expectNoViolations(<BottomNav />);
  });
});

// ── Form landmark ─────────────────────────────────────────────────────────────
describe('Form with labelled inputs — axe', () => {
  test('login form structure has no violations', async () => {
    await expectNoViolations(
      <form aria-label="Sign in">
        <Input label="Email" type="email" name="email" />
        <Input label="Password" type="password" name="password" />
        <Button type="submit">Sign in</Button>
      </form>
    );
  });

  test('form with validation errors has no violations', async () => {
    await expectNoViolations(
      <form aria-label="Sign in">
        <Input label="Email" type="email" error="Email is required" />
        <Input label="Password" type="password" error="Password is required" />
        <Button type="submit">Sign in</Button>
      </form>
    );
  });
});

// ── ConfirmationModal — axe ───────────────────────────────────────────────────
describe('ConfirmationModal — axe', () => {
  const props = {
    isOpen: true,
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
    recipient: 'GABC...XYZ',
    amount: '50',
  };

  test('open modal has no violations', async () => {
    await expectNoViolations(<ConfirmationModal {...props} />);
  });

  test('closed modal (renders nothing) has no violations', async () => {
    await expectNoViolations(<ConfirmationModal {...props} isOpen={false} />);
  });
});

// ── ToastProvider — axe ───────────────────────────────────────────────────────
describe('ToastProvider — axe', () => {
  test('empty toast container has no violations', async () => {
    await expectNoViolations(
      <ToastProvider>
        <div>App content</div>
      </ToastProvider>
    );
  });
});

// ── Leaderboard — axe ────────────────────────────────────────────────────────
describe('Leaderboard — axe', () => {
  test('leaderboard with data has no violations', async () => {
    let container;
    await React.act(async () => {
      ({ container } = render(<Leaderboard />));
      // Allow the useEffect + async fetch to settle
      await new Promise((r) => setTimeout(r, 50));
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
