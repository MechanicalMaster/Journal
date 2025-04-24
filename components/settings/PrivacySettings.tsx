"use client";

import { useState } from "react";
import { Lock, Fingerprint } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PrivacySettings() {
  const { toast } = useToast();
  
  // Settings state
  const [requireAuth, setRequireAuth] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [biometricsAvailable, setBiometricsAvailable] = useState(true);
  const [useBiometrics, setUseBiometrics] = useState(false);

  // Handle authentication toggle
  const handleAuthToggle = (checked: boolean) => {
    if (checked) {
      setShowPinDialog(true);
    } else {
      setRequireAuth(false);
      toast({
        title: "Authentication disabled",
        description: "You will no longer need to authenticate to access the app.",
      });
    }
  };

  // Handle PIN setup
  const handlePinSetup = () => {
    if (pin.length < 4) {
      setPinError("PIN must be at least 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setPinError("PINs do not match");
      return;
    }

    setRequireAuth(true);
    setShowPinDialog(false);
    setPinError("");
    setPin("");
    setConfirmPin("");

    toast({
      title: "Authentication enabled",
      description: "You will now need to authenticate to access the app.",
    });
  };

  // Handle biometrics toggle
  const handleBiometricsToggle = (checked: boolean) => {
    setUseBiometrics(checked);

    if (checked) {
      toast({
        title: "Biometric authentication enabled",
        description: "You can now use your fingerprint or face to unlock the app.",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-blue-500" />
              <Label htmlFor="require-auth">Require Authentication</Label>
            </div>
            <Switch
              id="require-auth"
              checked={requireAuth}
              onCheckedChange={handleAuthToggle}
            />
          </div>

          {biometricsAvailable && (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Fingerprint className="h-5 w-5 text-green-500" />
                <Label htmlFor="use-biometrics">Use Biometrics</Label>
              </div>
              <Switch
                id="use-biometrics"
                checked={useBiometrics}
                onCheckedChange={handleBiometricsToggle}
                disabled={!requireAuth}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* PIN Setup Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set a PIN</DialogTitle>
            <DialogDescription>
              This PIN will be required to access the app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="pin">PIN</Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={4}
                maxLength={8}
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pin">Confirm PIN</Label>
              <Input
                id="confirm-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                minLength={4}
                maxLength={8}
                placeholder="Confirm PIN"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
              />
            </div>
            {pinError && <p className="text-sm text-red-500">{pinError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPinDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePinSetup}>Save PIN</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 