"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SpinnerGap } from "@phosphor-icons/react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/settings/profile");
    if (res.ok) {
      const data = await res.json();
      setName(data.user.name);
      setEmail(data.user.email);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword && !currentPassword) {
      toast.error("Current password is required to set a new password");
      return;
    }

    setSaving(true);

    try {
      const body: Record<string, string> = { name, email };
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Profile saved");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to save");
      }
    } catch {
      toast.error("Network error");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <SpinnerGap size={16} className="animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="space-y-2">
        <h3 className="section-title">Name</h3>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-md text-sm"
          required
        />
      </section>

      <section className="space-y-2">
        <h3 className="section-title">Email</h3>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="max-w-md font-mono text-sm"
          required
        />
      </section>

      <section className="space-y-2">
        <h3 className="section-title">Change password</h3>
        <div className="grid gap-4 max-w-md">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Current password
            </label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              New password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              Confirm new password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="text-sm"
            />
          </div>
        </div>
      </section>

      <Button type="submit" disabled={saving}>
        {saving ? (
          <>
            <SpinnerGap size={16} className="animate-spin" />
            Saving...
          </>
        ) : (
          "Save"
        )}
      </Button>
    </form>
  );
}
