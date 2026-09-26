import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';

import { useSignUpFunnel } from './useSignUpFunnel';

// 회귀 방지: Step/Funnel이 렌더마다 새로 만들어지면 부모 상태가 바뀔 때 입력창이 다시 마운트돼 포커스가 빠졌다.
const Harness = () => {
  const { step, Step, Funnel } = useSignUpFunnel(2);
  const [verified, setVerified] = useState(true);

  return (
    <>
      <Funnel step={step}>
        <Step id={2}>
          <input aria-label='userId' onChange={() => setVerified(false)} />
        </Step>
        <Step id={1}>
          <p>{verified ? '확인됨' : '미확인'}</p>
        </Step>
        <Step id={3}>
          <p>다음 단계</p>
        </Step>
      </Funnel>
    </>
  );
};

describe('useSignUpFunnel', () => {
  it('부모 상태가 바뀌어도 입력창을 다시 마운트하지 않아 포커스가 유지된다', () => {
    render(<Harness />);
    const input = screen.getByLabelText('userId');
    input.focus();

    fireEvent.change(input, { target: { value: 'a' } });

    expect(screen.getByText('미확인')).toBeInTheDocument();
    expect(screen.getByLabelText('userId')).toBe(input);
    expect(document.activeElement).toBe(input);
  });

  it('현재 step 이하의 Step만 보여준다', () => {
    render(<Harness />);

    expect(screen.getByLabelText('userId')).toBeInTheDocument();
    expect(screen.queryByText('다음 단계')).not.toBeInTheDocument();
  });
});
