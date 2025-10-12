"use client";

import { useUpvote, VotableCollection } from "@/lib/useUpvote";
import { useTranslations } from "next-intl";
import { ThumbsUp } from "lucide-react";

interface UpvoteButtonProps {
  col: VotableCollection;
  id: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

/**
 * Reusable upvote button component
 *
 * @example
 * <UpvoteButton col="photos" id={photo.id} />
 * <UpvoteButton col="albums" id={album.id} size="lg" showLabel />
 */
export default function UpvoteButton({
  col,
  id,
  size = "md",
  showLabel = false
}: UpvoteButtonProps) {
  const t = useTranslations('voting');
  const { count, hasVoted, canVote, toggle, isLoading } = useUpvote(col, id);

  // Size classes
  const sizeClasses = {
    sm: "px-2 py-1 text-xs gap-1",
    md: "px-3 py-1.5 text-sm gap-1.5",
    lg: "px-4 py-2 text-base gap-2"
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20
  };

  // Tooltip text
  const getTitle = () => {
    if (!canVote) return t('signInToVote');
    return hasVoted ? t('removeVote') : t('giveVote');
  };

  // Button styling
  const buttonClass = `
    ${sizeClasses[size]}
    rounded-full border flex items-center
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${hasVoted
      ? 'bg-theme-accent-50 border-theme-accent-400 text-theme-accent-700 hover:bg-theme-accent-100'
      : 'bg-theme-bg-primary border-theme-border-hover text-theme-text-primary hover:bg-theme-bg-secondary hover:border-gray-400'
    }
    ${isLoading ? 'opacity-70 cursor-wait' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      onClick={toggle}
      disabled={!canVote || isLoading}
      title={getTitle()}
      className={buttonClass}
      aria-label={getTitle()}
    >
      <ThumbsUp
        size={iconSizes[size]}
        fill={hasVoted ? "currentColor" : "none"}
        strokeWidth={hasVoted ? 0 : 2}
      />
      <span className="font-medium tabular-nums">{count}</span>
      {showLabel && (
        <span className="ml-1">{t('votes', { count })}</span>
      )}
    </button>
  );
}
