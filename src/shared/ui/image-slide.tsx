'use client';

import Image from 'next/image';
import { useState } from 'react';

import { IconWhiteClose } from '@/shared/assets';
import { cn } from '@/shared/utils';

import { Card, CardContent } from './card';
import { Carousel, CarouselContent, CarouselItem, CarouselNav } from './carousel';

interface ImageSlideProps {
  images: { fileUrl: string; fileOrder: number }[];
  enlargeMode?: boolean;
}

const ImageSlide = ({ images, enlargeMode = false }: ImageSlideProps) => {
  const [enlargeState, setEnlargeState] = useState(false);

  const openDetailView = () => {
    if (!enlargeMode || enlargeState) return;
    setEnlargeState((prev) => !prev);
  };

  const closeDetailView = () => {
    setEnlargeState(false);
  };

  return (
    <div
      className={cn(
        enlargeState &&
          'fixed left-1/2 top-0 flex h-full w-screen max-w-(--max-width) -translate-x-1/2 items-center justify-center bg-black'
      )}
      onClick={openDetailView}>
      <Carousel>
        <CarouselContent className='p-0'>
          {images.map((file, index) => (
            <CarouselItem key={index}>
              <Card
                className={cn(
                  'h-full w-full bg-white p-0',
                  enlargeState
                    ? 'flex h-full items-center justify-center rounded-none bg-black'
                    : 'bg-white'
                )}>
                <CardContent className='flex-center w-full'>
                  <Image
                    src={`${file.fileUrl}?w=${enlargeState ? 1200 : 400}?q=99`}
                    alt={`slide image - ${index}`}
                    width={300}
                    height={300}
                    className={cn(
                      'h-full w-full rounded-lg bg-white object-cover transition-all',
                      enlargeState
                        ? 'aspect-auto h-full w-full rounded-none'
                        : 'aspect-square'
                    )}
                    priority
                  />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNav className={cn(enlargeState && 'absolute bottom-[56px]')} />
      </Carousel>
      {enlargeState && (
        <div className='absolute left-0 top-0 z-50 mt-8 px-7 py-6'>
          <button onClick={closeDetailView}>
            <IconWhiteClose stroke='white' />
          </button>
        </div>
      )}
    </div>
  );
};

export { ImageSlide };
