interface ProgressIndicatorProps {
  steps: { title: string }[];
  currentStep: number;
}

export function ProgressIndicator({ steps, currentStep }: ProgressIndicatorProps) {
  return (
    <div className="flex justify-between">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className={`flex items-center ${
            index <= currentStep ? 'text-primary' : 'text-gray-400'
          }`}
        >
          <div className="text-sm font-medium">{step.title}</div>
          {index < steps.length - 1 && (
            <div className="mx-2">→</div>
          )}
        </div>
      ))}
    </div>
  );
} 