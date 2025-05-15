// Mock for aws-sdk S3
export const S3 = jest.fn().mockImplementation(() => ({
  upload: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Location: 'https://example-bucket.s3.amazonaws.com/test-object-key',
      ETag: '"d41d8cd98f00b204e9800998ecf8427e"',
      Bucket: 'example-bucket',
      Key: 'test-object-key'
    })
  }),
  getObject: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Body: Buffer.from('test file content'),
      ContentType: 'image/jpeg',
      LastModified: new Date()
    })
  }),
  deleteObject: jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({})
  })
}));

// Mock the entire aws-sdk
export default {
  S3,
  config: {
    update: jest.fn()
  }
};
