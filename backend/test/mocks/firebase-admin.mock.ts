// Mock for firebase-admin
const auth = {
  verifyIdToken: jest.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com'
  }),
  createUser: jest.fn().mockResolvedValue({
    uid: 'new-user-id',
    email: 'new-user@example.com'
  }),
  getUserByEmail: jest.fn().mockImplementation((email) => {
    if (email === 'existing@example.com') {
      return Promise.resolve({ uid: 'existing-user-id', email });
    }
    throw new Error('User not found');
  }),
};

export default {
  auth: () => auth,
  initializeApp: jest.fn(),
  credential: {
    cert: jest.fn().mockReturnValue({}),
  },
};
