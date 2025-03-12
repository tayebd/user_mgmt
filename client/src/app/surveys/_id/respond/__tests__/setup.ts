import '@testing-library/jest-dom';

// Mock SurveyJS theme
jest.mock('./theme', () => ({
  themeJson: {
    cssVariables: {},
    header: {},
    checkbox: {
      root: '',
      item: '',
      itemChecked: '',
      itemControl: '',
      itemDecorator: '',
      itemCheckedDecorator: '',
      itemText: '',
      label: '',
      svgIcon: ''
    }
  },
  customCss: {}
}));

// Mock window.matchMedia for SurveyJS
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
