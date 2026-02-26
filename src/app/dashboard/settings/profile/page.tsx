"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const [name, setName] = useState("Admin");
  const [email, setEmail] = useState("admin@itsyship.local");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword && !currentPassword) {
      toast.error("Current password is required to set a new password");
      return;
    }

    toast.success("Profile saved (prototype)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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

      <Button type="submit">Save</Button>
    </form>
  );
}
