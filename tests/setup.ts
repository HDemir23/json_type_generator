// Jest setup file
import { TextEncoder, TextDecoder } from 'util';

// Mock TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Increase timeout for tests
jest.setTimeout(10000); 