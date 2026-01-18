import { getAccessToken, createPayout, getPayoutStatus, PayPalCredentials } from '@/lib/paypal';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('PayPal Library', () => {
  const mockCredentials: PayPalCredentials = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    mode: 'sandbox',
  };

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('getAccessToken', () => {
    it('returns access token on successful request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: 'test-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'openid',
        }),
      });

      const token = await getAccessToken(mockCredentials);

      expect(token).toBe('test-access-token');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-m.sandbox.paypal.com/v1/oauth2/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/x-www-form-urlencoded',
          }),
          body: 'grant_type=client_credentials',
        })
      );
    });

    it('uses live URL for live mode', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'live-token' }),
      });

      const liveCredentials: PayPalCredentials = {
        ...mockCredentials,
        mode: 'live',
      };

      await getAccessToken(liveCredentials);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api-m.paypal.com/v1/oauth2/token',
        expect.any(Object)
      );
    });

    it('throws error on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Invalid credentials',
      });

      await expect(getAccessToken(mockCredentials)).rejects.toThrow(
        'Failed to get PayPal access token'
      );
    });
  });

  describe('createPayout', () => {
    const mockPayoutItems = [
      {
        email: 'recipient@example.com',
        amount: '100.00',
        currency: 'USD',
        note: 'Test payment',
        itemId: 'item-123',
      },
    ];

    beforeEach(() => {
      // Mock getAccessToken response first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token' }),
      });
    });

    it('creates payout successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          batch_header: {
            payout_batch_id: 'batch-123',
            batch_status: 'PENDING',
          },
        }),
      });

      const result = await createPayout(mockCredentials, mockPayoutItems, 'batch-id-123');

      expect(result.batch_header.payout_batch_id).toBe('batch-123');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('throws error on payout failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        text: async () => 'Payout failed',
      });

      await expect(
        createPayout(mockCredentials, mockPayoutItems, 'batch-id-123')
      ).rejects.toThrow('Failed to create payout');
    });
  });

  describe('getPayoutStatus', () => {
    beforeEach(() => {
      // Mock getAccessToken response first
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'test-token' }),
      });
    });

    it('returns payout status successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          batch_header: {
            payout_batch_id: 'batch-123',
            batch_status: 'SUCCESS',
          },
          items: [],
        }),
      });

      const result = await getPayoutStatus(mockCredentials, 'batch-123');

      expect(result.batch_header.batch_status).toBe('SUCCESS');
    });

    it('throws error on status fetch failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(
        getPayoutStatus(mockCredentials, 'batch-123')
      ).rejects.toThrow('Failed to get payout status');
    });
  });
});
