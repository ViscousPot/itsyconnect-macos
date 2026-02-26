"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Star, ChatText, WarningCircle, Translate } from "@phosphor-icons/react";
import { toast } from "sonner";
import { MOCK_APPS } from "@/lib/mock-data";

interface MockReview {
  id: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  territory: string;
  date: string;
  translation?: {
    title: string;
    body: string;
  };
  reply?: {
    body: string;
    date: string;
    pending?: boolean;
  };
}

const MOCK_REVIEWS: MockReview[] = [
  {
    id: "rev-1",
    rating: 5,
    title: "Best weather app I've used",
    body: "Clean interface, accurate forecasts, and the radar is incredibly smooth. Exactly what a weather app should be \u2013 fast and beautiful without being bloated.",
    author: "JohnDoe",
    territory: "United States",
    date: "2026-02-25T16:29:00Z",
  },
  {
    id: "rev-2",
    rating: 3,
    title: "Good but widget needs work",
    body: "The app itself is great, but the home screen widget often shows stale data. It would also be nice to have a wind speed widget option.",
    author: "RonCv55",
    territory: "Netherlands",
    date: "2026-02-23T20:40:00Z",
    reply: {
      body: "Thanks for the feedback! We\u2019re aware of the widget refresh issue and have a fix coming in 2.1.1. Wind speed widget is on our roadmap.",
      date: "2026-02-24T09:15:00Z",
    },
  },
  {
    id: "rev-3",
    rating: 1,
    title: "Crashes on launch since update",
    body: "Updated to 2.0.1 and the app crashes immediately on my iPhone 14. Tried reinstalling twice. Was working fine before.",
    author: "soundneedle",
    territory: "United States",
    date: "2026-02-19T00:04:00Z",
    reply: {
      body: "Sorry about this! We\u2019ve identified the issue affecting iPhone 14 models and submitted a fix. Please try updating to 2.0.2 when it\u2019s available.",
      date: "2026-02-20T11:30:00Z",
      pending: true,
    },
  },
  {
    id: "rev-4",
    rating: 5,
    title: "Simple et efficace",
    body: "Enfin une app m\u00e9t\u00e9o qui va droit au but. Pas de pubs, pas d\u2019abonnement, juste la m\u00e9t\u00e9o. L\u2019animation de pluie est magnifique.",
    author: "LeMacUser",
    territory: "France",
    date: "2026-02-11T08:30:00Z",
    translation: {
      title: "Simple and effective",
      body: "Finally a weather app that gets straight to the point. No ads, no subscription, just the weather. The rain animation is gorgeous.",
    },
  },
  {
    id: "rev-5",
    rating: 4,
    title: "Almost perfect",
    body: "Love the design and accuracy. Only thing missing is air quality alerts \u2013 I need to know when pollen counts are high. Would instantly be 5 stars with that.",
    author: "WeatherWatcher42",
    territory: "United Kingdom",
    date: "2026-02-08T14:20:00Z",
  },
  {
    id: "rev-6",
    rating: 2,
    title: "Standort wird immer zur\u00fcckgesetzt",
    body: "Jedes Mal wenn ich die App \u00f6ffne, springt sie zur\u00fcck zu meinem Heimatort, statt sich die letzte Stadt zu merken. Sehr nervig auf Reisen.",
    author: "TravelPro",
    territory: "Germany",
    date: "2026-02-05T09:45:00Z",
  },
];

const TERRITORIES = [
  ...new Set(MOCK_REVIEWS.map((r) => r.territory)),
].sort();

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          weight={i < rating ? "fill" : "regular"}
          className={
            i < rating ? "text-yellow-500" : "text-muted-foreground/30"
          }
        />
      ))}
    </div>
  );
}

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 text-right text-xs text-muted-foreground">
        {star}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-yellow-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-4 text-right text-xs tabular-nums text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

/** Detect non-English reviews by checking for non-ASCII characters or known non-English territories. */
const NON_ENGLISH_TERRITORIES = new Set([
  "France",
  "Germany",
  "Japan",
  "Spain",
  "Italy",
  "Brazil",
  "China",
  "South Korea",
  "Russia",
]);

function isNonEnglish(review: MockReview): boolean {
  return NON_ENGLISH_TERRITORIES.has(review.territory);
}

export default function ReviewsPage() {
  const { appId } = useParams<{ appId: string }>();
  const app = MOCK_APPS.find((a) => a.id === appId);

  const [sortBy, setSortBy] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [territoryFilter, setTerritoryFilter] = useState("all");
  const [hideResponded, setHideResponded] = useState(false);
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    let reviews = [...MOCK_REVIEWS];

    if (ratingFilter !== "all") {
      const star = parseInt(ratingFilter);
      reviews = reviews.filter((r) => r.rating === star);
    }

    if (territoryFilter !== "all") {
      reviews = reviews.filter((r) => r.territory === territoryFilter);
    }

    if (hideResponded) {
      reviews = reviews.filter((r) => !r.reply);
    }

    reviews.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest")
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "highest") return b.rating - a.rating;
      return a.rating - b.rating;
    });

    return reviews;
  }, [sortBy, ratingFilter, territoryFilter, hideResponded]);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  const total = MOCK_REVIEWS.length;
  const avgRating =
    MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / total;
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: MOCK_REVIEWS.filter((r) => r.rating === star).length,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <CardContent className="flex items-center gap-8 py-0">
          <div>
            <div className="text-4xl font-bold tabular-nums">
              {avgRating.toFixed(1)}
            </div>
            <Stars rating={Math.round(avgRating)} />
            <p className="mt-1 text-xs text-muted-foreground">
              {total} review{total !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex-1 space-y-1.5">
            {distribution.map(({ star, count }) => (
              <RatingBar
                key={star}
                star={star}
                count={count}
                total={total}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="highest">Highest rated</SelectItem>
            <SelectItem value="lowest">Lowest rated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ratings</SelectItem>
            <SelectItem value="5">5 stars</SelectItem>
            <SelectItem value="4">4 stars</SelectItem>
            <SelectItem value="3">3 stars</SelectItem>
            <SelectItem value="2">2 stars</SelectItem>
            <SelectItem value="1">1 star</SelectItem>
          </SelectContent>
        </Select>

        <Select value={territoryFilter} onValueChange={setTerritoryFilter}>
          <SelectTrigger className="w-[160px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All territories</SelectItem>
            {TERRITORIES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Switch
            id="hide-responded"
            checked={hideResponded}
            onCheckedChange={setHideResponded}
          />
          <Label htmlFor="hide-responded" className="text-sm">
            Hide responded
          </Label>
        </div>
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No reviews match the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => {
            const foreign = isNonEnglish(review);
            const translated = showTranslation[review.id] && review.translation;

            return (
              <Card key={review.id}>
                <CardContent className="space-y-2 py-0">
                  {/* Header: stars + title + date */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Stars rating={review.rating} size={12} />
                      <p className="text-sm font-semibold">
                        {translated ? review.translation!.title : review.title}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Body */}
                  <p className="text-sm">
                    {translated ? review.translation!.body : review.body}
                  </p>

                  {/* Translation toggle */}
                  {foreign && (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => {
                        if (review.translation) {
                          setShowTranslation((prev) => ({
                            ...prev,
                            [review.id]: !prev[review.id],
                          }));
                        } else {
                          toast.info(
                            "Translation not available in prototype"
                          );
                        }
                      }}
                    >
                      <Translate size={14} />
                      {translated ? "Show original" : "Translate"}
                    </button>
                  )}

                  {/* Footer: author + actions */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {review.author} &middot; {review.territory}
                    </span>
                    <div className="flex items-center gap-2">
                      {review.rating <= 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() =>
                            toast.info("Appeals not available in prototype")
                          }
                        >
                          <WarningCircle size={14} className="mr-1.5" />
                          Appeal
                        </Button>
                      )}
                      {!review.reply && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toast.info(
                              "Review responses not available in prototype"
                            )
                          }
                        >
                          <ChatText size={14} className="mr-1.5" />
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Developer reply */}
                  {review.reply && (
                    <div className="rounded-lg border bg-muted/50 px-4 py-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium">
                            Developer response
                          </p>
                          {review.reply.pending && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              Pending
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.reply.date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm">{review.reply.body}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
