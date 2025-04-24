"use client";

import { Info, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function AboutSettings() {
  // App info
  const appVersion = "1.0.0";
  const contactEmail = "support@journaldigitizer.com";
  const privacyPolicyUrl = "https://journaldigitizer.com/privacy";

  return (
    <Card>
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-blue-500" />
            <Label>App Version</Label>
          </div>
          <span>{appVersion}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <Label>Contact</Label>
          </div>
          <Button variant="link" className="p-0 h-auto" onClick={() => window.open(`mailto:${contactEmail}`)}>
            {contactEmail}
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <Label>Privacy Policy</Label>
          </div>
          <Button variant="link" className="p-0 h-auto" onClick={() => window.open(privacyPolicyUrl, '_blank')}>
            View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 