"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  MOCK_BETA_LOCALIZATIONS,
  MOCK_BETA_REVIEW_DETAIL,
  type MockBetaAppLocalization,
  type MockBetaReviewDetail,
} from "@/lib/mock-testflight";

function CharCount({ value, limit }: { value: string; limit?: number }) {
  const count = value?.length ?? 0;
  if (!limit) return null;
  const over = count > limit;

  return (
    <span
      className={`text-xs tabular-nums ${over ? "font-medium text-destructive" : "text-muted-foreground"}`}
    >
      {count}/{limit}
    </span>
  );
}

export default function TestFlightInfoPage() {
  const [info, setInfo] = useState<MockBetaAppLocalization>({
    ...MOCK_BETA_LOCALIZATIONS[0],
  });

  const [review, setReview] = useState<MockBetaReviewDetail>({
    ...MOCK_BETA_REVIEW_DETAIL,
  });
  const [licenseAgreement, setLicenseAgreement] = useState("");

  const updateInfoField = useCallback(
    (field: keyof MockBetaAppLocalization, value: string) => {
      setInfo((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const updateReviewField = useCallback(
    (field: keyof MockBetaReviewDetail, value: string | boolean) => {
      setReview((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  return (
    <div className="space-y-8">
      {/* Beta app information */}
      <section className="space-y-4">
        <h3 className="section-title">Beta app information</h3>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground">Description</label>
          <Card className="gap-0 py-0">
            <CardContent className="px-5 py-4">
              <Textarea
                value={info.description}
                onChange={(e) => updateInfoField("description", e.target.value)}
                placeholder="Describe what testers should try..."
                className="border-0 p-0 shadow-none focus-visible:ring-0 resize-none font-mono text-sm min-h-0"
              />
            </CardContent>
            <div className="flex items-center justify-end border-t px-3 py-1.5">
              <CharCount value={info.description} limit={4000} />
            </div>
          </Card>
        </div>

        {/* URLs */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Feedback email</label>
            <Input
              value={info.feedbackEmail}
              onChange={(e) => updateInfoField("feedbackEmail", e.target.value)}
              placeholder="beta@example.com"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Marketing URL</label>
            <Input
              value={info.marketingUrl}
              onChange={(e) => updateInfoField("marketingUrl", e.target.value)}
              placeholder="https://example.com"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm text-muted-foreground">Privacy policy URL</label>
            <Input
              value={info.privacyPolicyUrl}
              onChange={(e) => updateInfoField("privacyPolicyUrl", e.target.value)}
              placeholder="https://example.com/privacy"
              className="font-mono text-sm"
            />
          </div>
        </div>
      </section>

      {/* Beta app review information */}
      <section className="space-y-4">
        <h3 className="section-title">Beta app review information</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">First name</label>
              <Input
                value={review.contactFirstName}
                onChange={(e) => updateReviewField("contactFirstName", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Last name</label>
              <Input
                value={review.contactLastName}
                onChange={(e) => updateReviewField("contactLastName", e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Phone</label>
              <Input
                value={review.contactPhone}
                onChange={(e) => updateReviewField("contactPhone", e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                value={review.contactEmail}
                onChange={(e) => updateReviewField("contactEmail", e.target.value)}
                type="email"
                className="font-mono text-sm"
              />
            </div>
          </div>

          {/* Review notes */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Review notes</label>
            <Card className="gap-0 py-0">
              <CardContent className="px-5 py-4">
                <Textarea
                  value={review.reviewNotes}
                  onChange={(e) => updateReviewField("reviewNotes", e.target.value)}
                  placeholder="Notes for the App Review team..."
                  className="border-0 p-0 shadow-none focus-visible:ring-0 resize-none font-mono text-sm min-h-0"
                />
              </CardContent>
              <div className="flex items-center justify-end border-t px-3 py-1.5">
                <CharCount value={review.reviewNotes} limit={4000} />
              </div>
            </Card>
          </div>
        </div>

        {/* Sign-in required */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              id="sign-in-required"
              checked={review.signInRequired}
              onCheckedChange={(v) => updateReviewField("signInRequired", v)}
            />
            <Label htmlFor="sign-in-required" className="text-sm">
              Sign-in required
            </Label>
          </div>
          {review.signInRequired && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Demo username</label>
                <Input
                  value={review.demoUsername}
                  onChange={(e) => updateReviewField("demoUsername", e.target.value)}
                  placeholder="demo@example.com"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Demo password</label>
                <Input
                  value={review.demoPassword}
                  onChange={(e) => updateReviewField("demoPassword", e.target.value)}
                  type="password"
                  placeholder="Password"
                  className="font-mono text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* License agreement */}
      <section className="space-y-2 pb-8">
        <h3 className="section-title">License agreement</h3>
        <Card className="gap-0 py-0">
          <CardContent className="px-5 py-4">
            <Textarea
              value={licenseAgreement}
              onChange={(e) => setLicenseAgreement(e.target.value)}
              placeholder="Enter your license agreement text..."
              className="border-0 p-0 shadow-none focus-visible:ring-0 resize-none font-mono text-sm min-h-0"
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
