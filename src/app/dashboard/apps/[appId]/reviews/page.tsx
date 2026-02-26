"use client";

import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChatText } from "@phosphor-icons/react";
import { toast } from "sonner";
import { MOCK_APPS } from "@/lib/mock-data";

const MOCK_REVIEWS = [
  {
    id: "rev-1",
    rating: 5,
    title: "Great app, works perfectly",
    body: "Love having this in my menu bar. Super fast and the UI is beautiful. One-time purchase too!",
    author: "JohnDoe",
    territory: "United States",
    date: "2026-02-25T16:29:00Z",
    responded: false,
  },
  {
    id: "rev-2",
    rating: 3,
    title: "Good but needs full screen option",
    body: "It's nice to be able to view the camera streams from the menu bar but it is missing the option to view them in full screen mode.",
    author: "RonCv55",
    territory: "Netherlands",
    date: "2026-02-23T20:40:00Z",
    responded: true,
  },
  {
    id: "rev-3",
    rating: 1,
    title: "Does not work",
    body: "Connects but nothing but \"refreshing\" appears in the menu bar. Update: now it doesn't even connect.",
    author: "soundneedle",
    territory: "United States",
    date: "2026-02-19T00:04:00Z",
    responded: true,
  },
  {
    id: "rev-4",
    rating: 4,
    title: "Pratique avec un bon potentiel",
    body: "Tres pratique de pouvoir d'un clic actionner une lampe ou autre objet connecte a partir de la barre superieure.",
    author: "LeMacUser",
    territory: "France",
    date: "2026-02-11T08:30:00Z",
    responded: false,
  },
];

export default function ReviewsPage() {
  const { appId } = useParams<{ appId: string }>();
  const app = MOCK_APPS.find((a) => a.id === appId);

  if (!app) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        App not found
      </div>
    );
  }

  const avgRating =
    MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Customer reviews</h1>

      {/* Summary */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-4xl font-bold">{avgRating.toFixed(1)}</div>
          <div className="mt-1 flex gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                size={14}
                weight={i < Math.round(avgRating) ? "fill" : "regular"}
                className={
                  i < Math.round(avgRating)
                    ? "text-yellow-500"
                    : "text-muted-foreground/30"
                }
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {MOCK_REVIEWS.length} reviews
          </p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {MOCK_REVIEWS.map((review) => (
          <Card key={review.id}>
            <CardContent className="space-y-3 pt-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={12}
                        weight={i < review.rating ? "fill" : "regular"}
                        className={
                          i < review.rating
                            ? "text-yellow-500"
                            : "text-muted-foreground/30"
                        }
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.date).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="text-sm">{review.body}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {review.author} &middot; {review.territory}
                </span>
                {!review.responded && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast.info("Review responses not available in prototype")
                    }
                  >
                    <ChatText size={14} className="mr-1.5" />
                    Reply
                  </Button>
                )}
                {review.responded && (
                  <span className="text-xs text-muted-foreground">
                    Responded
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
