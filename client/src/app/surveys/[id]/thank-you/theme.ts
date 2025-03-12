/**
 * Theme configuration for the thank you page
 * Defines styles for success and error states
 */
export const themeConfig = {
  // Card styles
  card: {
    success: {
      root: 'container mx-auto mt-8 max-w-2xl bg-green-50 border-green-200',
      title: 'flex items-center gap-2 text-green-700',
      message: 'text-green-700',
      surveyTitle: 'font-medium text-gray-900',
      description: 'text-gray-600',
      buttons: {
        primary: 'bg-green-600 hover:bg-green-700',
        secondary: 'hover:bg-green-100'
      }
    },
    error: {
      root: 'container mx-auto mt-8 max-w-2xl bg-red-50 border-red-200',
      title: 'flex items-center gap-2 text-red-700',
      message: 'text-red-700 mb-4',
      buttons: {
        primary: 'bg-red-600 hover:bg-red-700',
        secondary: 'hover:bg-red-100'
      }
    }
  },
  // Loading skeleton styles
  loading: {
    root: 'container mx-auto py-6',
    card: 'max-w-2xl mx-auto mt-8 animate-pulse',
    skeleton: {
      title: 'h-8 w-48 bg-gray-200 rounded',
      line1: 'h-4 w-3/4 bg-gray-200 rounded',
      line2: 'h-4 w-1/2 bg-gray-200 rounded',
      button: 'h-10 w-32 bg-gray-200 rounded mt-6'
    }
  }
};
