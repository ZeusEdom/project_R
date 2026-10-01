'use client';

import { useState, useTransition } from 'react';
import { IconStar } from '@repo/ui';
import { rateStoryAction } from '@/app/[locale]/story/[slug]/actions';

interface RatingStarsProps {
  storyId: string;
  initialRatingAvg: number;
  initialRatingCount: number;
  locale: string;
  isLoggedIn: boolean;
}

export function RatingStars({
  storyId,
  initialRatingAvg,
  initialRatingCount,
  locale,
  isLoggedIn,
}: RatingStarsProps) {
  const [ratingAvg, setRatingAvg] = useState(initialRatingAvg);
  const [ratingCount, setRatingCount] = useState(initialRatingCount);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRate = (stars: number) => {
    if (!isLoggedIn) {
      setFeedback(locale === 'en' ? 'Please log in to rate' : 'Đăng nhập để đánh giá');
      return;
    }

    if (hasRated) return;

    setFeedback(null);
    startTransition(async () => {
      const res = await rateStoryAction({ storyId, rating: stars });
      if (res.error) {
        setFeedback(res.error);
      } else if (res.success && res.newAvg && res.newCount) {
        setRatingAvg(res.newAvg);
        setRatingCount(res.newCount);
        setHasRated(true);
        setFeedback(locale === 'en' ? 'Thank you for rating!' : 'Cảm ơn bạn đã đánh giá!');
      }
    });
  };

  return (
    <div className="flex flex-col items-center md:items-start gap-1">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const activeValue = hoverRating !== null ? hoverRating : Math.round(ratingAvg);
          const isFilled = star <= activeValue;

          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => !hasRated && setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => handleRate(star)}
              disabled={isPending || hasRated}
              className={`p-0.5 transition-transform ${
                !hasRated ? 'hover:scale-125 cursor-pointer' : 'cursor-default'
              }`}
              title={`${star} sao`}
            >
              <IconStar
                size={18}
                className={isFilled ? 'text-amber-400 fill-amber-400' : 'text-zinc-700'}
              />
            </button>
          );
        })}

        <span className="text-sm font-bold font-mono text-zinc-100 ml-1.5">
          {ratingAvg.toFixed(1)}
        </span>
        <span className="text-xs text-zinc-500 font-mono">({ratingCount})</span>
      </div>

      {feedback && (
        <span className="text-[11px] font-semibold text-emerald-400 font-mono animate-in fade-in">
          {feedback}
        </span>
      )}
    </div>
  );
}
