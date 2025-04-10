declare module 'react-mathjax' {
  import { ReactNode } from 'react';

  interface MathJaxProps {
    children?: ReactNode;
  }

  interface ProviderProps extends MathJaxProps {
    input: 'tex' | 'ascii';
    onLoad?: () => void;
    onError?: (error: Error) => void;
  }

  interface NodeProps {
    formula: string;
    inline?: boolean;
  }

  const MathJax: {
    Provider: (props: ProviderProps) => JSX.Element;
    Node: (props: NodeProps) => JSX.Element;
  };

  export default MathJax;
}
