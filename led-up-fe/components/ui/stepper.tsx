'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { CheckIcon, Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';

// Types
type IconType = LucideIcon | React.ComponentType<any> | undefined;

interface StepItem {
  id?: string;
  label?: string;
  description?: string;
  icon?: IconType;
  optional?: boolean;
}

interface StepOptions {
  orientation?: 'vertical' | 'horizontal';
  state?: 'loading' | 'error';
  responsive?: boolean;
  checkIcon?: IconType;
  errorIcon?: IconType;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
  mobileBreakpoint?: string;
  variant?: 'circle' | 'circle-alt' | 'line';
  expandVerticalSteps?: boolean;
  size?: 'sm' | 'md' | 'lg';
  styles?: {
    /** Styles for the main container */
    'main-container'?: string;
    /** Styles for the horizontal step */
    'horizontal-step'?: string;
    /** Styles for the horizontal step container (button and labels) */
    'horizontal-step-container'?: string;
    /** Styles for the vertical step */
    'vertical-step'?: string;
    /** Styles for the vertical step container (button and labels) */
    'vertical-step-container'?: string;
    /** Styles for the vertical step content */
    'vertical-step-content'?: string;
    /** Styles for the step button container */
    'step-button-container'?: string;
    /** Styles for the label and description container */
    'step-label-container'?: string;
    /** Styles for the step label */
    'step-label'?: string;
    /** Styles for the step description */
    'step-description'?: string;
  };
  variables?: {
    '--step-icon-size'?: string;
    '--step-gap'?: string;
  };
  scrollTracking?: boolean;
}

interface StepperProps extends StepOptions {
  children?: React.ReactNode;
  className?: string;
  initialStep: number;
  steps: StepItem[];
}

interface StepperContextValue extends StepperProps {
  clickable?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isVertical?: boolean;
  stepCount?: number;
  expandVerticalSteps?: boolean;
  activeStep: number;
  initialStep: number;
}

interface StepProps extends React.HTMLAttributes<HTMLLIElement> {
  label?: string | React.ReactNode;
  description?: string;
  icon?: IconType;
  state?: 'loading' | 'error';
  checkIcon?: IconType;
  errorIcon?: IconType;
  isCompletedStep?: boolean;
  isKeepError?: boolean;
  onClickStep?: (step: number, setStep: (step: number) => void) => void;
}

interface StepSharedProps extends StepProps {
  isLastStep?: boolean;
  isCurrentStep?: boolean;
  index?: number;
  hasVisited: boolean | undefined;
  isError?: boolean;
  isLoading?: boolean;
}

interface StepInternalConfig {
  index: number;
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isLastStep?: boolean;
}

interface FullStepProps extends StepProps, StepInternalConfig {}

interface StepIconProps {
  isCompletedStep?: boolean;
  isCurrentStep?: boolean;
  isError?: boolean;
  isLoading?: boolean;
  isKeepError?: boolean;
  icon?: IconType;
  index?: number;
  checkIcon?: IconType;
  errorIcon?: IconType;
}

interface StepLabelProps {
  isCurrentStep?: boolean;
  opacity: number;
  label?: string | React.ReactNode;
  description?: string | null;
}

type StepButtonContainerProps = StepSharedProps & {
  children?: React.ReactNode;
};

type VerticalStepProps = StepSharedProps & {
  children?: React.ReactNode;
};

interface StepperContextProviderProps {
  value: Omit<StepperContextValue, 'activeStep'>;
  children: React.ReactNode;
}

// Context
const StepperContext = React.createContext<
  StepperContextValue & {
    nextStep: () => void;
    prevStep: () => void;
    resetSteps: () => void;
    setStep: (step: number) => void;
  }
>({
  steps: [],
  activeStep: 0,
  initialStep: 0,
  nextStep: () => {},
  prevStep: () => {},
  resetSteps: () => {},
  setStep: () => {},
});

// Constants
const VARIABLE_SIZES = {
  sm: '36px',
  md: '40px',
  lg: '44px',
};

// Variants
const iconVariants = cva('', {
  variants: {
    size: {
      sm: 'size-4',
      md: 'size-4',
      lg: 'size-5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const labelVariants = cva('', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const descriptionVariants = cva('', {
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-xs',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const verticalStepVariants = cva(
  [
    'flex flex-col relative transition-all duration-200',
    'data-[completed=true]:[&:not(:last-child)]:after:bg-primary',
    'data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive',
  ],
  {
    variants: {
      variant: {
        circle: cn(
          '[&:not(:last-child)]:gap-[var(--step-gap)] [&:not(:last-child)]:pb-[var(--step-gap)]',
          "[&:not(:last-child)]:after:bg-border [&:not(:last-child)]:after:w-[2px] [&:not(:last-child)]:after:content-['']",
          '[&:not(:last-child)]:after:inset-x-[calc(var(--step-icon-size)/2)]',
          '[&:not(:last-child)]:after:absolute',
          '[&:not(:last-child)]:after:top-[calc(var(--step-icon-size)+var(--step-gap))]',
          '[&:not(:last-child)]:after:bottom-[var(--step-gap)]',
          '[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200'
        ),
        line: 'flex-1 border-t-0 mb-4',
      },
    },
  }
);

// Hooks
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

function useStepper() {
  const context = React.useContext(StepperContext);

  if (context === undefined) {
    throw new Error('useStepper must be used within a StepperProvider');
  }

  const { children, className, ...rest } = context;

  const isLastStep = context.activeStep === context.steps.length - 1;
  const hasCompletedAllSteps = context.activeStep === context.steps.length;
  const previousActiveStep = usePrevious(context.activeStep);
  const currentStep = context.steps[context.activeStep];
  const isOptionalStep = !!currentStep?.optional;
  const isDisabledStep = context.activeStep === 0;

  return {
    ...rest,
    isLastStep,
    hasCompletedAllSteps,
    isOptionalStep,
    isDisabledStep,
    currentStep,
    previousActiveStep,
  };
}

// Components
const StepperProvider = React.memo(({ value, children }: StepperContextProviderProps) => {
  const isError = value.state === 'error';
  const isLoading = value.state === 'loading';
  const [activeStep, setActiveStep] = React.useState(value.initialStep);

  const nextStep = React.useCallback(() => {
    setActiveStep((prev) => prev + 1);
  }, []);

  const prevStep = React.useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  const resetSteps = React.useCallback(() => {
    setActiveStep(value.initialStep);
  }, [value.initialStep]);

  const setStep = React.useCallback((step: number) => {
    setActiveStep(step);
  }, []);

  const contextValue = React.useMemo(
    () => ({
      ...value,
      isError,
      isLoading,
      activeStep,
      nextStep,
      prevStep,
      resetSteps,
      setStep,
    }),
    [value, isError, isLoading, activeStep, nextStep, prevStep, resetSteps, setStep]
  );

  return <StepperContext.Provider value={contextValue}>{children}</StepperContext.Provider>;
});
StepperProvider.displayName = 'StepperProvider';

const VerticalContent = React.memo(({ children }: { children: React.ReactNode }) => {
  const { activeStep } = useStepper();
  const childArr = React.Children.toArray(children);
  const stepCount = childArr.length;

  return (
    <ul className="list-none p-0 m-0 w-full">
      {React.Children.map(children, (child, i) => {
        const isCompletedStep = (React.isValidElement(child) && (child.props as any).isCompletedStep) ?? i < activeStep;
        const isLastStep = i === stepCount - 1;
        const isCurrentStep = i === activeStep;

        const stepProps = {
          index: i,
          isCompletedStep,
          isCurrentStep,
          isLastStep,
        };

        if (React.isValidElement(child)) return React.cloneElement(child, stepProps);

        return null;
      })}
    </ul>
  );
});
VerticalContent.displayName = 'VerticalContent';

const HorizontalContent = React.memo(({ children }: { children: React.ReactNode }) => {
  const { activeStep } = useStepper();
  const childArr = React.Children.toArray(children);

  if (activeStep > childArr.length) return null;

  return (
    <div className="w-full">
      {React.Children.map(childArr[activeStep], (node) => {
        if (!React.isValidElement(node)) return null;

        return React.Children.map(node.props.children, (childNode) => childNode);
      })}
    </div>
  );
});
HorizontalContent.displayName = 'HorizontalContent';

const StepLabel = React.memo(({ isCurrentStep, opacity, label, description }: StepLabelProps) => {
  const { variant, styles, size, orientation } = useStepper();
  const shouldRender = !!label || !!description;

  if (!shouldRender) return null;

  return (
    <div
      aria-current={isCurrentStep ? 'step' : undefined}
      className={cn(
        'stepper__step-label-container',
        'flex flex-col',
        variant !== 'line' ? 'ms-2' : orientation === 'horizontal' && 'my-2',
        variant === 'circle-alt' && 'text-center',
        variant === 'circle-alt' && orientation === 'horizontal' && 'ms-0',
        variant === 'circle-alt' && orientation === 'vertical' && 'text-start',
        styles?.['step-label-container']
      )}
      style={{
        opacity,
      }}
    >
      {!!label && (
        <span className={cn('stepper__step-label', labelVariants({ size }), styles?.['step-label'])}>{label}</span>
      )}
      {!!description && (
        <span
          className={cn(
            'stepper__step-description',
            'text-muted-foreground',
            descriptionVariants({ size }),
            styles?.['step-description']
          )}
        >
          {description}
        </span>
      )}
    </div>
  );
});
StepLabel.displayName = 'StepLabel';

const StepIcon = React.memo<StepIconProps>(
  ({
    isCompletedStep,
    isCurrentStep,
    isError,
    isLoading,
    isKeepError,
    icon: CustomIcon,
    index,
    checkIcon: CustomCheckIcon,
    errorIcon: CustomErrorIcon,
  }) => {
    const { size } = useStepper();

    const Icon = CustomIcon || null;
    const ErrorIcon = CustomErrorIcon || null;
    const Check = CustomCheckIcon || CheckIcon;

    if (isCompletedStep) {
      if (isError && isKeepError) {
        return (
          <div key="icon">
            <X className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      return (
        <div key="check-icon">
          <Check className={cn(iconVariants({ size }))} />
        </div>
      );
    }

    if (isCurrentStep) {
      if (isError && ErrorIcon) {
        return (
          <div key="error-icon">
            <ErrorIcon className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      if (isError) {
        return (
          <div key="icon">
            <X className={cn(iconVariants({ size }))} />
          </div>
        );
      }
      if (isLoading) {
        return <Loader2 className={cn(iconVariants({ size }), 'animate-spin')} />;
      }
    }

    if (Icon) {
      return (
        <div key="step-icon">
          <Icon className={cn(iconVariants({ size }))} />
        </div>
      );
    }

    return (
      <span key="label" className={cn('text-md text-center font-medium')}>
        {(index || 0) + 1}
      </span>
    );
  }
);
StepIcon.displayName = 'StepIcon';

const StepButtonContainer = React.memo(
  ({
    isCurrentStep,
    isCompletedStep,
    children,
    isError,
    isLoading: isLoadingProp,
    onClickStep,
  }: StepButtonContainerProps) => {
    const { clickable, isLoading: isLoadingContext, variant, styles } = useStepper();

    const currentStepClickable = clickable || !!onClickStep;
    const isLoading = isLoadingProp || isLoadingContext;

    if (variant === 'line') return null;

    return (
      <Button
        variant="ghost"
        tabIndex={currentStepClickable ? 0 : -1}
        className={cn(
          'stepper__step-button-container',
          'pointer-events-none rounded-full p-0',
          'size-[var(--step-icon-size)]',
          'flex items-center justify-center rounded-full border-2',
          'data-[clickable=true]:pointer-events-auto',
          'data-[active=true]:bg-primary data-[active=true]:border-primary data-[active=true]:text-primary-foreground',
          'data-[current=true]:border-primary data-[current=true]:bg-secondary',
          'data-[invalid=true]:bg-destructive data-[invalid=true]:border-destructive data-[invalid=true]:text-destructive-foreground',
          styles?.['step-button-container']
        )}
        aria-current={isCurrentStep ? 'step' : undefined}
        data-current={isCurrentStep}
        data-invalid={isError && (isCurrentStep || isCompletedStep)}
        data-active={isCompletedStep}
        data-clickable={currentStepClickable}
        data-loading={isLoading && (isCurrentStep || isCompletedStep)}
      >
        {children}
      </Button>
    );
  }
);
StepButtonContainer.displayName = 'StepButtonContainer';

const VerticalStep = React.forwardRef<HTMLLIElement, VerticalStepProps>(
  (
    {
      children,
      index,
      isCompletedStep,
      isCurrentStep,
      label,
      description,
      icon,
      hasVisited,
      state,
      checkIcon: checkIconProp,
      errorIcon: errorIconProp,
      onClickStep,
    },
    ref
  ) => {
    const {
      checkIcon: checkIconContext,
      errorIcon: errorIconContext,
      isError,
      isLoading,
      variant,
      onClickStep: onClickStepGeneral,
      clickable,
      expandVerticalSteps,
      styles,
      scrollTracking,
      orientation,
      steps,
      setStep,
      isLastStep: isLastStepCurrentStep,
      previousActiveStep,
    } = useStepper();

    const opacity = hasVisited ? 1 : 0.8;
    const localIsLoading = isLoading || state === 'loading';
    const localIsError = isError || state === 'error';

    const isLastStep = index === steps.length - 1;

    const active = variant === 'line' ? isCompletedStep || isCurrentStep : isCompletedStep;
    const checkIcon = checkIconProp || checkIconContext;
    const errorIcon = errorIconProp || errorIconContext;

    const handleClick = React.useCallback(() => {
      if (onClickStep) onClickStep(index || 0, setStep);
      else onClickStepGeneral?.(index || 0, setStep);
    }, [index, onClickStep, onClickStepGeneral, setStep]);

    const renderChildren = () => {
      if (!expandVerticalSteps) {
        return (
          <Collapsible open={isCurrentStep}>
            <CollapsibleContent
              ref={(node) => {
                if (
                  scrollTracking &&
                  ((index === 0 && previousActiveStep && previousActiveStep === steps.length) || (index && index > 0))
                ) {
                  node?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                }
              }}
              className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden"
            >
              {children}
            </CollapsibleContent>
          </Collapsible>
        );
      }
      return children;
    };

    return (
      <li
        ref={ref}
        className={cn(
          'stepper__vertical-step',
          verticalStepVariants({
            variant: variant?.includes('circle') ? 'circle' : 'line',
          }),
          isLastStepCurrentStep && 'gap-[var(--step-gap)]',
          styles?.['vertical-step']
        )}
        data-optional={steps[index || 0]?.optional}
        data-completed={isCompletedStep}
        data-active={active}
        data-clickable={clickable || !!onClickStep}
        data-invalid={localIsError}
        onClick={handleClick}
        aria-current={isCurrentStep ? 'step' : undefined}
      >
        <div
          data-vertical
          data-active={active}
          className={cn(
            'stepper__vertical-step-container',
            'flex items-center',
            variant === 'line' && 'data-[active=true]:border-primary border-s-[3px] py-2 ps-3',
            styles?.['vertical-step-container']
          )}
        >
          <StepButtonContainer
            {...{
              isLoading: localIsLoading,
              isError: localIsError,
              isCurrentStep,
              isCompletedStep,
              index,
              hasVisited,
              onClickStep,
            }}
          >
            <StepIcon
              {...{
                index,
                isError: localIsError,
                isLoading: localIsLoading,
                isCurrentStep,
                isCompletedStep,
              }}
              icon={icon}
              checkIcon={checkIcon}
              errorIcon={errorIcon}
            />
          </StepButtonContainer>
          <StepLabel label={label} description={description} {...{ isCurrentStep, opacity }} />
        </div>
        <div
          className={cn(
            'stepper__vertical-step-content',
            !isLastStep && 'min-h-4',
            variant !== 'line' && 'ps-[--step-icon-size]',
            variant === 'line' && orientation === 'vertical' && 'min-h-0',
            styles?.['vertical-step-content']
          )}
        >
          {renderChildren()}
        </div>
      </li>
    );
  }
);
VerticalStep.displayName = 'VerticalStep';

const HorizontalStep = React.forwardRef<HTMLLIElement, StepSharedProps>((props, ref) => {
  const {
    isError,
    isLoading,
    onClickStep: onClickStepContext,
    variant,
    clickable,
    checkIcon: checkIconContext,
    errorIcon: errorIconContext,
    styles,
    steps,
    setStep,
  } = useStepper();

  const {
    index,
    isCompletedStep,
    isCurrentStep,
    hasVisited,
    icon,
    label,
    description,
    isKeepError,
    state,
    checkIcon: checkIconProp,
    errorIcon: errorIconProp,
    onClickStep,
  } = props;

  const localIsLoading = isLoading || state === 'loading';
  const localIsError = isError || state === 'error';

  const opacity = hasVisited ? 1 : 0.8;

  const active = variant === 'line' ? isCompletedStep || isCurrentStep : isCompletedStep;

  const checkIcon = checkIconProp || checkIconContext;
  const errorIcon = errorIconProp || errorIconContext;

  const handleClick = React.useCallback(() => {
    if (onClickStep) {
      onClickStep(index || 0, setStep);
    } else if (onClickStepContext) {
      onClickStepContext(index || 0, setStep);
    }
  }, [index, onClickStep, onClickStepContext, setStep]);

  return (
    <li
      data-disabled={!hasVisited}
      className={cn(
        'stepper__horizontal-step',
        'relative flex items-center transition-all duration-200',
        '[&:not(:last-child)]:flex-1',
        '[&:not(:last-child)]:after:transition-all [&:not(:last-child)]:after:duration-200',
        "[&:not(:last-child)]:after:bg-border [&:not(:last-child)]:after:h-[2px] [&:not(:last-child)]:after:content-['']",
        'data-[completed=true]:[&:not(:last-child)]:after:bg-primary',
        'data-[invalid=true]:[&:not(:last-child)]:after:bg-destructive',
        variant === 'circle-alt' &&
          'flex-1 flex-col justify-start [&:not(:last-child)]:after:relative [&:not(:last-child)]:after:end-[50%] [&:not(:last-child)]:after:start-[50%] [&:not(:last-child)]:after:top-[calc(var(--step-icon-size)/2)] [&:not(:last-child)]:after:-order-1 [&:not(:last-child)]:after:w-[calc((100%-var(--step-icon-size))-(var(--step-gap)))]',
        variant === 'circle' &&
          '[&:not(:last-child)]:after:me-[var(--step-gap)] [&:not(:last-child)]:after:ms-[var(--step-gap)] [&:not(:last-child)]:after:flex-1',
        variant === 'line' && 'data-[active=true]:border-primary flex-1 flex-col border-t-[3px]',
        styles?.['horizontal-step']
      )}
      data-optional={steps[index || 0]?.optional}
      data-completed={isCompletedStep}
      data-active={active}
      data-invalid={localIsError}
      data-clickable={clickable}
      onClick={handleClick}
      ref={ref}
      aria-current={isCurrentStep ? 'step' : undefined}
    >
      <div
        className={cn(
          'stepper__horizontal-step-container',
          'flex items-center',
          variant === 'circle-alt' && 'flex-col justify-center gap-1',
          variant === 'line' && 'w-full',
          styles?.['horizontal-step-container']
        )}
      >
        <StepButtonContainer {...{ ...props, isError: localIsError, isLoading: localIsLoading }}>
          <StepIcon
            {...{
              index,
              isCompletedStep,
              isCurrentStep,
              isError: localIsError,
              isKeepError,
              isLoading: localIsLoading,
            }}
            icon={icon}
            checkIcon={checkIcon}
            errorIcon={errorIcon}
          />
        </StepButtonContainer>
        <StepLabel label={label} description={description} {...{ isCurrentStep, opacity }} />
      </div>
    </li>
  );
});
HorizontalStep.displayName = 'HorizontalStep';

const Step = React.forwardRef<HTMLLIElement, StepProps>((props, ref) => {
  const {
    children,
    description,
    icon,
    state,
    checkIcon,
    errorIcon,
    index,
    isCompletedStep,
    isCurrentStep,
    isLastStep,
    isKeepError,
    label,
    onClickStep,
  } = props as FullStepProps;

  const { isVertical, isError, isLoading, clickable } = useStepper();

  const hasVisited = isCurrentStep || isCompletedStep;

  const sharedProps = {
    isLastStep,
    isCompletedStep,
    isCurrentStep,
    index,
    isError,
    isLoading,
    clickable,
    label,
    description,
    hasVisited,
    icon,
    isKeepError,
    checkIcon,
    state,
    errorIcon,
    onClickStep,
  };

  return isVertical ? (
    <VerticalStep {...sharedProps} ref={ref}>
      {children}
    </VerticalStep>
  ) : (
    <HorizontalStep {...sharedProps} ref={ref} />
  );
});
Step.displayName = 'Step';

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>((props, ref) => {
  const {
    className,
    children,
    orientation: orientationProp,
    state,
    responsive,
    checkIcon,
    errorIcon,
    onClickStep,
    mobileBreakpoint,
    expandVerticalSteps = false,
    initialStep = 0,
    size,
    steps,
    variant,
    styles,
    variables,
    scrollTracking = false,
    ...rest
  } = props;

  const childArr = React.Children.toArray(children);

  const items = [] as React.ReactElement[];

  const footer = childArr.map((child, _index) => {
    if (!React.isValidElement(child)) throw new Error('Stepper children must be valid React elements.');

    if (child.type === Step) {
      items.push(child);
      return null;
    }

    return child;
  });

  const stepCount = items.length;

  const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint || '768px'})`);

  const clickable = !!onClickStep;

  const orientation = isMobile && responsive ? 'vertical' : orientationProp;

  const isVertical = orientation === 'vertical';

  return (
    <StepperProvider
      value={{
        initialStep,
        orientation,
        state,
        size,
        responsive,
        checkIcon,
        errorIcon,
        onClickStep,
        clickable,
        stepCount,
        isVertical,
        variant: variant || 'circle',
        expandVerticalSteps,
        steps,
        scrollTracking,
        styles,
      }}
    >
      <div
        ref={ref}
        className={cn(
          'stepper__main-container',
          'flex w-full flex-wrap',
          stepCount === 1 ? 'justify-end' : 'justify-between',
          orientation === 'vertical' ? 'flex-col' : 'flex-row',
          variant === 'line' && orientation === 'horizontal' && 'gap-4',
          className,
          styles?.['main-container']
        )}
        style={
          {
            '--step-icon-size': variables?.['--step-icon-size'] || `${VARIABLE_SIZES[size || 'md']}`,
            '--step-gap': variables?.['--step-gap'] || '8px',
          } as React.CSSProperties
        }
        aria-label="Progress steps"
        {...rest}
      >
        <VerticalContent>{items}</VerticalContent>
      </div>
      {orientation === 'horizontal' && <HorizontalContent>{items}</HorizontalContent>}
      {footer}
    </StepperProvider>
  );
});

Stepper.displayName = 'Stepper';
Stepper.defaultProps = {
  size: 'md',
  orientation: 'horizontal',
  responsive: true,
};

export { Stepper, Step, useStepper };
export type { StepProps, StepperProps, StepItem };
