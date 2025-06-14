export interface StepResultsManager {
  openSteps: Set<number>;
  toggleStep: (index: number) => void;
  isOpen: (index: number) => boolean;
}

export function createStepResultsManager(): StepResultsManager {
  const openSteps = new Set<number>();
  return {
    openSteps,
    toggleStep(index: number) {
      if (openSteps.has(index)) {
        openSteps.delete(index);
      } else {
        openSteps.add(index);
      }
    },
    isOpen(index: number) {
      return openSteps.has(index);
    }
  };
}
