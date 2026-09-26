/* eslint-disable @next/next/no-img-element */
import { DialogTrigger } from '@radix-ui/react-dialog';

import { DietWithFasting, MealType } from '@/entity/diet';
import { IconCheck, IconWhiteClose } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import { Button, Dialog, DialogClose, DialogContent } from '@/shared/ui';
import { buildDisplayImageUrl, cn } from '@/shared/utils';

const dietText: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
};

interface Props {
  meal: DietWithFasting;
}

// 식단 상세(학생/트레이너 공통)에서 끼니 한 칸을 읽기 전용으로 보여준다 - 단식/사진/빈 칸 3가지 상태.
const DietMealItem = ({ meal }: Props) => {
  return (
    <div className='flex w-[calc((100%-12px)/3)] flex-col items-center justify-between'>
      <div className='mb-1 w-full'>
        {meal.fast && (
          <div
            className={cn(
              Typography.TITLE_2,
              'flex h-[88px] w-full flex-col items-center justify-center rounded-md bg-gray-100 p-0 text-center text-gray-400'
            )}>
            <span className='mb-1'>
              <IconCheck fill={'var(--primary-500)'} width={17} height={17} />
            </span>
            단식
          </div>
        )}
        {!meal.fast && meal.dietFile?.fileUrl && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant='ghost' className='h-[88px] w-full p-0'>
                <img
                  src={buildDisplayImageUrl(meal.dietFile.fileUrl, {
                    w: 400,
                    q: 90,
                  })}
                  alt={meal.type}
                  className='custom-image rounded-md'
                />
              </Button>
            </DialogTrigger>
            <DialogContent className='block h-full gap-0 border-none bg-black p-0'>
              <div className='relative flex h-[56px] w-full px-7 py-6'>
                <DialogClose className='text-white'>
                  <IconWhiteClose stroke='white' />
                </DialogClose>
              </div>
              <div className='flex h-[calc(100%-56px)] w-full items-center justify-center'>
                <img
                  src={buildDisplayImageUrl(meal.dietFile.fileUrl, {
                    w: 1200,
                    q: 90,
                  })}
                  alt={meal.type}
                  className='max-w-screen h-full object-contain'
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
        {!meal.fast && !meal.dietFile && (
          <div className='h-[88px] w-full rounded-md bg-gray-100 p-0' />
        )}
      </div>
      <span className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
        {dietText[meal.type]}
      </span>
    </div>
  );
};

export { DietMealItem };
