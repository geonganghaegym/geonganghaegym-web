import { fireEvent, render, screen } from '@testing-library/react';
import dayjs from 'dayjs';
import { DayButton, DayButtonProps } from 'react-day-picker';

import { Calendar } from './calendar';

// react-day-picker 8 → 10 업그레이드 회귀 방지. 학생 스케줄·식단 등록 달력이 쓰는 조합
// (커스텀 DayButton 블루닷, 주간 접기용 weekHidden modifier, 기간 밖 disabled, 문자열 캡션)을 그대로 재현한다.
const MONTH = new Date(2026, 8, 1);
const RESERVED = new Date(2026, 8, 10);

const ReservedDayButton = (props: DayButtonProps) => (
  <DayButton {...props}>
    {props.children}
    {dayjs(RESERVED).isSame(props.day.date, 'day') && (
      <span data-testid='reserved-dot' className='reserved-indicator' />
    )}
  </DayButton>
);

const renderCalendar = (onSelect = jest.fn<void, [Date | undefined]>()) => {
  render(
    <Calendar
      mode='single'
      month={MONTH}
      onSelect={onSelect}
      disabled={{ before: new Date(2026, 8, 5) }}
      formatters={{
        formatCaption: (date) =>
          `${dayjs(date).format('YYYY')}년 ${date.getMonth() + 1}월`,
      }}
      modifiers={{
        weekHidden: (day: Date) => day.getDate() === 30 && day.getMonth() === 8,
      }}
      modifiersStyles={{ weekHidden: { display: 'none' } }}
      components={{ DayButton: ReservedDayButton }}
    />
  );
  return onSelect;
};

const dayButton = (day: number) =>
  screen
    // display:none 셀의 버튼은 접근성 트리에서 빠지므로 hidden 요소까지 포함해 찾는다
    .getAllByRole('button', { hidden: true })
    .find(
      (el) => el.textContent?.startsWith(String(day)) && !el.closest('.day-outside')
    ) as HTMLButtonElement;

describe('Calendar (react-day-picker 10)', () => {
  it('문자열 캡션을 렌더링한다', () => {
    renderCalendar();

    expect(screen.getByText('2026년 9월')).toBeInTheDocument();
  });

  it('커스텀 DayButton의 블루닷은 예약한 날에만 붙는다', () => {
    renderCalendar();

    expect(screen.getAllByTestId('reserved-dot')).toHaveLength(1);
    expect(dayButton(10)).toContainElement(screen.getByTestId('reserved-dot'));
  });

  it('weekHidden modifier가 붙은 날짜 셀은 display:none 이다', () => {
    renderCalendar();

    const cell = dayButton(30).closest('td');
    expect(cell).toHaveStyle({ display: 'none' });
    expect(dayButton(29).closest('td')).not.toHaveStyle({ display: 'none' });
  });

  it('선택 가능한 날을 누르면 onSelect가 그 날짜로 불린다', () => {
    const onSelect = renderCalendar();

    fireEvent.click(dayButton(20));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(dayjs(onSelect.mock.calls[0][0]).format('YYYY-MM-DD')).toBe(
      '2026-09-20'
    );
  });

  it('disabled 범위의 날은 눌러도 선택되지 않는다', () => {
    const onSelect = renderCalendar();

    const disabledDay = dayButton(3);
    expect(disabledDay).toBeDisabled();
    fireEvent.click(disabledDay);

    expect(onSelect).not.toHaveBeenCalled();
  });
});
