import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { id: 1, name: 'Upload' },
  { id: 2, name: 'Transcribe' },
  { id: 3, name: 'Score' },
  { id: 4, name: 'Results' },
];

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  // Normalize currentStep for the 4 logic steps vs 3 UI screens
  // 1: Upload, 2: Transcribing/Scoring, 3: Results
  const activeStep = currentStep === 3 ? 4 : currentStep;

  return (
    <div style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = activeStep > step.id;
        const isActive = activeStep === step.id;
        const isClickable = step.id === 1 && currentStep > 1 && onStepClick;
        
        return (
          <React.Fragment key={step.id}>
            <div 
              style={{
                ...styles.stepWrapper,
                cursor: isClickable ? 'pointer' : 'default',
                opacity: isClickable ? 0.8 : 1,
              }}
              onClick={() => {
                if (isClickable && onStepClick) {
                  onStepClick(step.id);
                }
              }}
            >
              <div 
                style={{
                  ...styles.circle,
                  backgroundColor: isCompleted ? '#3B6D11' : (isActive ? '#7F77DD' : 'white'),
                  borderColor: isCompleted ? '#3B6D11' : (isActive ? '#7F77DD' : 'var(--color-border)'),
                  color: isCompleted || isActive ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
              </div>
              <span style={{
                ...styles.label,
                color: isActive ? 'var(--color-text-main)' : 'var(--color-text-muted)',
                fontWeight: isActive ? '600' : '400',
              }}>
                {step.name}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={styles.line}>
                <div style={{
                  ...styles.lineProgress,
                  width: isCompleted ? '100%' : '0%',
                }} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '600px',
    margin: '0 auto',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    zIndex: 1,
  },
  circle: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    border: '1.5px solid',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  label: {
    fontSize: '12px',
    whiteSpace: 'nowrap',
  },
  line: {
    flex: 1,
    height: '2px',
    backgroundColor: 'var(--color-border)',
    margin: '0 12px',
    marginTop: '-20px', // Align with circles
    position: 'relative',
    overflow: 'hidden',
  },
  lineProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#3B6D11',
    transition: 'width 0.4s ease',
  }
};

export default StepIndicator;
