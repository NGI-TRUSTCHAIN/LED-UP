// Mock database connection
module.exports = {
  sql: {
    connect: jest.fn().mockResolvedValue({}),
    close: jest.fn(),
    request: jest.fn().mockReturnValue({
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({ recordset: [] }),
    }),
  },
  connectToDatabase: jest.fn().mockResolvedValue({}),
};
