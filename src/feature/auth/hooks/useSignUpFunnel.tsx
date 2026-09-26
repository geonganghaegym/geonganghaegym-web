import { ReactElement, ReactNode, useState } from 'react';

export interface StepProps {
  id: number;
  children: ReactNode;
}

export interface FunnelProps {
  step: number;
  children: ReactElement<StepProps>[];
}

// 렌더마다 새로 만들면 컴포넌트 타입이 바뀌어 하위 입력창이 전부 다시 마운트된다(입력 중 포커스가 빠지던 원인).
// 모듈 수준에 두어 타입을 고정한다.
const Step = (props: StepProps): ReactElement => {
  return <>{props.children}</>;
};

const Funnel = ({ step, children }: FunnelProps) => {
  const stepsToShow = children.filter((child) => child.props.id <= step);
  return <>{stepsToShow}</>;
};

export const useSignUpFunnel = (defaultStep: number) => {
  const [step, setStep] = useState<number>(defaultStep);

  return { step, setStep, Step, Funnel } as const;
};
