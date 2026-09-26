'use client';
import 'swiper/css';
import './swiper.css';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
import { useState } from 'react';

import { DayOfWeek } from '@/feature/schedule';
import { IconAlert } from '@/shared/assets';
import IconNoCircleCheck from '@/shared/assets/images/noCircleCheck.svg';
import { Typography } from '@/shared/mixin';
import { Button, Sheet, SheetContent, SheetTrigger } from '@/shared/ui';
import { TimeSwiper } from '@/shared/ui/time-swiper';
import { cn } from '@/shared/utils';

type TimeSettings =
  | 'lessonStartTime'
  | 'lessonEndTime'
  | 'lunchStartTime'
  | 'lunchEndTime';

interface TimeListType {
  name: TimeSettings;
  timePeriods: string;
  hours: string;
  minutes: string;
  state: boolean;
}

const dayOfWeekMap: Record<DayOfWeek, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

const classTime = [60];
const timePeriods = ['오전', '오후'];
const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));
const minutes = ['00', '30'];

interface Props {
  timeList: TimeListType[];
  setTimeList: React.Dispatch<React.SetStateAction<TimeListType[]>>;
  isLunchTimeUnset: boolean;
  setIsLunchTimeUnset: React.Dispatch<React.SetStateAction<boolean>>;
  classTimeState: number;
  setClassTimeState: React.Dispatch<React.SetStateAction<number>>;
  dayOff: DayOfWeek[];
  setDayOff: React.Dispatch<React.SetStateAction<DayOfWeek[]>>;
}
export const ClassTimeSetting = ({
  timeList,
  setTimeList,
  isLunchTimeUnset,
  setIsLunchTimeUnset,
  classTimeState,
  setClassTimeState,
  dayOff,
  setDayOff,
}: Props) => {
  const [isClassTimeSheetOpen, setIsClassTimeSheetOpen] = useState(false); // 수업시간 sheet

  const openTimePicker = (selectedTime: TimeSettings) => {
    setTimeList((prev) =>
      prev.map((item) => ({
        ...item,
        state: item.name === selectedTime,
      }))
    );
  };

  //timepicker 스크롤, 클릭, 스와이프
  const changeSlide = (key: string, selectedValue: string, timeType: TimeSettings) => {
    setTimeList((prev) =>
      prev.map((item) => {
        return item.name === timeType
          ? {
              ...item,
              [key]: selectedValue,
            }
          : item;
      })
    );
  };

  //설정 안 함 체크박스 클릭시
  const resetSettingsOnDisable = () => {
    setIsLunchTimeUnset((prev) => !prev);

    setTimeList((prev) =>
      prev.map((item) => {
        return (item.name === 'lunchStartTime' || item.name === 'lunchEndTime') &&
          item.state
          ? {
              ...item,
              state: false,
            }
          : item;
      })
    );
  };

  //수업시간 선택
  const selectedClassTime = (selectedTime: number) => {
    setClassTimeState(selectedTime);
    setIsClassTimeSheetOpen(false);
  };

  //휴무일 선택
  const selectedDayClick = (day: DayOfWeek) => {
    if (dayOff.includes(day)) {
      setDayOff(dayOff.filter((d) => d !== day));
    } else {
      setDayOff([...dayOff, day]);
    }
  };

  return (
    <div>
      {timeList.length > 0 && (
        <>
          <article className='border-b border-solid border-gray-100 py-9'>
            <dl className='flex items-center justify-between'>
              <dt className={cn(Typography.TITLE_1_BOLD, 'text-black')}>근무 시간</dt>
              <dd>
                <Button
                  className={cn(
                    Typography.BODY_2,
                    'w-[89px] rounded-md bg-gray-100 py-4 text-black'
                  )}
                  onClick={() => openTimePicker('lessonStartTime')}>
                  {`${timeList[0].timePeriods} ${timeList[0].hours}:${timeList[0].minutes}`}
                </Button>
                <span className={cn(Typography.BODY_1, 'mx-1')}>~</span>
                <Button
                  className={cn(
                    Typography.BODY_2,
                    'w-[89px] rounded-md bg-gray-100 py-4 text-black'
                  )}
                  onClick={() => openTimePicker('lessonEndTime')}>
                  {`${timeList[1].timePeriods} ${timeList[1].hours}:${timeList[1].minutes}`}
                </Button>
              </dd>
            </dl>
            {timeList.map((timeSetting, idx) =>
              (timeSetting.name === 'lessonStartTime' && timeSetting.state) ||
              (timeSetting.name === 'lessonEndTime' && timeSetting.state) ? (
                <div key={`${timeSetting.name}_${idx}`} className='flex flex-col'>
                  <div className='relative mt-9 flex items-center justify-center'>
                    <TimeSwiper
                      items={timePeriods}
                      loop={false}
                      initialSlide={timePeriods.indexOf(timeSetting.timePeriods)}
                      onSlideChange={(e) =>
                        changeSlide(
                          'timePeriods',
                          timePeriods[e.realIndex],
                          timeSetting.name
                        )
                      }
                      className='timeSwiper'
                    />
                    <TimeSwiper
                      items={hours}
                      initialSlide={hours.indexOf(timeSetting.hours)}
                      onSlideChange={(e) =>
                        changeSlide('hours', hours[e.realIndex], timeSetting.name)
                      }
                      className='timeSwiper'
                    />
                    <TimeSwiper
                      items={minutes}
                      loop={false}
                      initialSlide={minutes.indexOf(timeSetting.minutes)}
                      onSlideChange={(e) =>
                        changeSlide('minutes', minutes[e.realIndex], timeSetting.name)
                      }
                      className='timeSwiper'
                    />
                    <div className='absolute left-4 right-4 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-[#f2f3f5] text-2xl'></div>
                  </div>
                  <p
                    className={cn(
                      Typography.BODY_3,
                      'mt-7 flex items-center gap-1 px-4 text-gray-500'
                    )}>
                    <IconAlert width={12} height={12} />
                    근무 시간은 오전 6시부터 밤 12시까지 설정이 가능해요.
                  </p>
                </div>
              ) : null
            )}
          </article>

          <article className='border-b border-solid border-gray-100 py-9'>
            <dl className='flex items-center justify-between'>
              <dt className={cn(Typography.TITLE_1_BOLD, 'text-black')}>점심 시간</dt>
              <dd className='flex flex-col items-end justify-end'>
                <div className='mb-5'>
                  <Button
                    className={cn(
                      Typography.BODY_2,
                      'w-[89px] rounded-md bg-gray-100 py-4 text-black disabled:bg-gray-100 disabled:text-gray-500'
                    )}
                    disabled={isLunchTimeUnset}
                    onClick={() => openTimePicker('lunchStartTime')}>
                    {`${timeList[2].timePeriods} ${timeList[2].hours}:${timeList[2].minutes}`}
                  </Button>
                  <span className={cn(Typography.BODY_1, 'mx-1')}>~</span>
                  <Button
                    className={cn(
                      Typography.BODY_2,
                      'w-[89px] rounded-md bg-gray-100 py-4 text-black disabled:bg-gray-100 disabled:text-gray-500'
                    )}
                    onClick={() => openTimePicker('lunchEndTime')}
                    disabled={isLunchTimeUnset}>
                    {`${timeList[3].timePeriods} ${timeList[3].hours}:${timeList[3].minutes}`}
                  </Button>
                </div>
                <div className='flex items-center justify-center'>
                  <span className={cn(Typography.BODY_2, 'mr-1 text-gray-500')}>
                    설정 안 함
                  </span>
                  <label className='custom-checkbox'>
                    <input
                      type='checkbox'
                      className='peer hidden'
                      checked={isLunchTimeUnset}
                      onChange={resetSettingsOnDisable}
                    />
                    <span className='flex h-7 w-7 items-center justify-center rounded-sm border border-solid border-gray-300 peer-checked:border-none peer-checked:bg-primary-500'>
                      {isLunchTimeUnset && (
                        <IconNoCircleCheck width={15} height={12} fill='white' />
                      )}
                    </span>
                  </label>
                </div>
              </dd>
            </dl>

            {timeList.map((timeSetting, idx) =>
              (timeSetting.name === 'lunchStartTime' && timeSetting.state) ||
              (timeSetting.name === 'lunchEndTime' && timeSetting.state) ? (
                <div key={`${timeSetting.name}_${idx}`} className='flex flex-col'>
                  <div className='relative mt-9 flex items-center justify-center'>
                    <TimeSwiper
                      items={timePeriods}
                      loop={false}
                      initialSlide={timePeriods.indexOf(timeSetting.timePeriods)}
                      onSlideChange={(e) =>
                        changeSlide(
                          'timePeriods',
                          timePeriods[e.realIndex],
                          timeSetting.name
                        )
                      }
                      className='timeSwiper'
                    />
                    <TimeSwiper
                      items={hours}
                      initialSlide={hours.indexOf(timeSetting.hours)}
                      onSlideChange={(e) =>
                        changeSlide('hours', hours[e.realIndex], timeSetting.name)
                      }
                      className='timeSwiper'
                    />
                    <TimeSwiper
                      items={minutes}
                      loop={false}
                      initialSlide={minutes.indexOf(timeSetting.minutes)}
                      onSlideChange={(e) =>
                        changeSlide('minutes', minutes[e.realIndex], timeSetting.name)
                      }
                      className='timeSwiper'
                    />
                    <div className='absolute left-4 right-4 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-[#f2f3f5] text-2xl'></div>
                  </div>
                  <p
                    className={cn(
                      Typography.BODY_3,
                      'mt-7 flex items-center gap-1 px-4 text-gray-500'
                    )}>
                    <IconAlert width={12} height={12} />
                    근무 시간 내에서 설정할 수 있어요.
                  </p>
                </div>
              ) : null
            )}
          </article>

          <article className='border-b border-solid border-gray-100'>
            <dl className='flex items-center justify-between py-9'>
              <dt className={cn(Typography.TITLE_1_BOLD, 'text-black')}>수업 시간</dt>
              <dd>
                <Sheet open={isClassTimeSheetOpen} onOpenChange={setIsClassTimeSheetOpen}>
                  <SheetTrigger>
                    {classTime.map((item) =>
                      item === classTimeState
                        ? `${Math.floor(item / 60) === 0 ? '' : `${Math.floor(item / 60)}시간`} ${item % 60 === 0 ? '' : '30분'}`
                        : ''
                    )}
                  </SheetTrigger>
                  <SheetContent side='bottom' headerType='thumb' className='pt-4'>
                    <ul>
                      {classTime.map((item, index) => {
                        return (
                          <li key={`${item}_${index}`}>
                            <Button
                              variant='ghost'
                              className={cn(
                                Typography.TITLE_1_SEMIBOLD,
                                'h-[54px] w-full items-center justify-between p-0 text-black'
                              )}
                              onClick={() => selectedClassTime(item)}>
                              {`${Math.floor(item / 60) === 0 ? '' : `${Math.floor(item / 60)}시간`} ${item % 60 === 0 ? '' : '30분'}`}
                              {item === classTimeState && (
                                <span>
                                  <IconNoCircleCheck
                                    width={24}
                                    height={24}
                                    fill='var(--primary-500)'
                                  />
                                </span>
                              )}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </SheetContent>
                </Sheet>
              </dd>
            </dl>
          </article>

          <article>
            <dl className='py-9'>
              <dt className={cn(Typography.TITLE_1_BOLD, 'mb-6 text-black')}>휴무일</dt>
              <dd>
                <ul className='flex items-center justify-between'>
                  {Object.entries(dayOfWeekMap).map(([eng, kor], index) => {
                    const isSelected = dayOff.includes(eng as DayOfWeek)
                      ? 'bg-primary-500 text-gray-100'
                      : 'bg-gray-100 text-gray-600';
                    return (
                      <li key={`${eng}_${index}`}>
                        <Button
                          className={cn(
                            Typography.TITLE_1_SEMIBOLD,
                            `p-4} w-[40px] rounded-full ${isSelected}`
                          )}
                          onClick={() => selectedDayClick(eng as DayOfWeek)}>
                          {kor}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </dd>
            </dl>
          </article>
        </>
      )}
    </div>
  );
};
