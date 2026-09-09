import React from 'react';

/**
 * MultipleChoiceNameGrid
 * Large, accessible tap buttons for choosing who is pictured.
 */
const MultipleChoiceNameGrid = ({
  options = [],
  selectedName = null,
  correctName = null,
  onSelectOption,
  isAnswered = false,
}) => {
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
      {options.map((name, idx) => {
        const isSelected = selectedName === name;
        const isCorrect = isAnswered && name === correctName;
        const isWrongSelection = isAnswered && isSelected && name !== correctName;

        let buttonStyle = 'bg-white border-patient-border text-patient-primary hover:border-patient-accent hover:bg-patient-accent-light/40';

        if (isCorrect) {
          buttonStyle = 'bg-patient-success-light border-patient-success text-patient-success font-bold ring-2 ring-patient-success';
        } else if (isWrongSelection) {
          buttonStyle = 'bg-patient-rose-light border-patient-rose text-patient-rose font-medium';
        } else if (isSelected) {
          buttonStyle = 'bg-patient-accent-light border-patient-accent text-patient-accent font-semibold';
        } else if (isAnswered) {
          buttonStyle = 'bg-patient-border-subtle/50 text-patient-muted border-transparent opacity-60';
        }

        return (
          <button
            key={idx}
            type="button"
            onClick={() => !isAnswered && onSelectOption(name)}
            disabled={isAnswered}
            className={`
              w-full p-4 rounded-xl border-2 text-lg font-semibold text-center
              min-h-touch transition-all duration-200 shadow-soft flex items-center justify-between
              focus:outline-none focus:ring-4 focus:ring-patient-accent/30
              ${buttonStyle}
            `}
            aria-label={`Option ${idx + 1}: ${name}`}
          >
            <span className="flex-1 text-center">{name}</span>
            {isCorrect && (
              <span className="text-xl text-patient-success ml-2" aria-hidden="true">
                ✓
              </span>
            )}
            {isWrongSelection && (
              <span className="text-sm font-normal text-patient-rose ml-2" aria-hidden="true">
                (Not quite)
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MultipleChoiceNameGrid;

