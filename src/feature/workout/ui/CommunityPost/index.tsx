'use client';

import Image from 'next/image';

import { IconAvatar, IconChat, IconLike } from '@/shared/assets';
import { Typography } from '@/shared/mixin';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  ImageSlide,
} from '@/shared/ui';
import { cn, formatTimestampToRelativeTime } from '@/shared/utils';

import { CommunityWorkout } from '../../model/types';
import { ExercisePreview } from './ExerciseInfo';

const CommunityPost = ({ workout }: { workout: CommunityWorkout }) => {
  const {
    member,
    files,
    content,
    completedExercises,
    liked,
    likeCnt,
    commentCnt,
    createdAt,
  } = workout;

  return (
    <Card className={cn(Typography.TITLE_3, 'w-full gap-0')}>
      <CardHeader
        className={cn(Typography.TITLE_3, 'mb-6 flex flex-row items-center gap-3')}>
        {member.profile ? (
          <Image
            src={`${member.profile.fileUrl}?w=800&q=90`}
            alt='profile'
            width={32}
            height={32}
            className='w-h-10 h-10 rounded-full border border-gray-300 object-cover'
            priority
          />
        ) : (
          <IconAvatar width={32} height={32} />
        )}
        <div className='flex flex-col'>
          <h3 className={cn(Typography.TITLE_3)}>{member.name}</h3>
          <p className={cn(Typography.BODY_4_REGULAR, 'text-gray-500')}>
            {formatTimestampToRelativeTime(createdAt)}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            Typography.BODY_3,
            'mb-5 line-clamp-2 h-full text-ellipsis text-black'
          )}>
          {content}
        </p>
        <ImageSlide images={files} />
        <ExercisePreview exercises={completedExercises} />
      </CardContent>
      <CardFooter className='mt-6 flex gap-4'>
        <div className=' flex items-center gap-2'>
          <IconLike
            stroke={cn(liked ? 'var(--point-color)' : 'var(--gray-500)')}
            fill={cn(liked ? 'var(--point-color)' : 'transparent')}
          />
          <p className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>{likeCnt}</p>
        </div>
        <div className='flex items-center gap-2'>
          <IconChat />
          <p className={cn(Typography.BODY_4_MEDIUM, 'text-gray-500')}>
            댓글 <span>{commentCnt}</span>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export { CommunityPost };
