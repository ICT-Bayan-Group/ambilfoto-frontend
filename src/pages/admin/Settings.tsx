import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Settings, Percent, Coins, Banknote, Save, Loader2 } from "lucide-react";

interface PlatformSetting {
  value: string;
  description: string;
  updated_at: string;
}

interface PlatformSettings {
  platform_fee_percentage: PlatformSetting;
  point_to_idr_rate: PlatformSetting;
  min_withdrawal_amount: PlatformSetting;
}

const AdminSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  
  const [platformFee, setPlatformFee] = useState("");
  const [pointRate, setPointRate] = useState("");
  const [minWithdrawal, setMinWithdrawal] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      const mockSettings: PlatformSettings = {
        platform_fee_percentage: {
          value: "15",
          description: "Platform fee percentage (default: 15%)",
          updated_at: new Date().toISOString()
        },
        point_to_idr_rate: {
          value: "5000",
          description: "1 Point = 5000 IDR",
          updated_at: new Date().toISOString()
        },
        min_withdrawal_amount: {
          value: "100000",
          description: "Minimum withdrawal amount (IDR)",
          updated_at: new Date().toISOString()
        }
      };
      
      setSettings(mockSettings);
      setPlatformFee(mockSettings.platform_fee_percentage.value);
      setPointRate(mockSettings.point_to_idr_rate.value);
      setMinWithdrawal(mockSettings.min_withdrawal_amount.value);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      setIsSaving(key);
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${key.replace(/_/g, ' ')} updated successfully`);
      fetchSettings();
    } catch (error) {
      console.error("Failed to update setting:", error);
      toast.error("Failed to update setting");
    } finally {
      setIsSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure platform fees, rates, and other settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Platform Fee */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Platform Fee
              </CardTitle>
              <CardDescription>
                Percentage fee charged on each photo sale
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-fee">Fee Percentage (%)</Label>
                <div className="flex gap-2">
                  <Input
                    id="platform-fee"
                    type="number"
                    min="0"
                    max="100"
                    value={platformFee}
                    onChange={(e) => setPlatformFee(e.target.value)}
                    placeholder="15"
                  />
                  <Button
                    onClick={() => handleUpdateSetting("platform_fee_percentage", platformFee)}
                    disabled={isSaving === "platform_fee_percentage"}
                  >
                    {isSaving === "platform_fee_percentage" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {settings?.platform_fee_percentage.value}%
              </p>
            </CardContent>
          </Card>

          {/* Point to IDR Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-500" />
                Point Rate
              </CardTitle>
              <CardDescription>
                Exchange rate for 1 Point to IDR
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="point-rate">1 Point = IDR</Label>
                <div className="flex gap-2">
                  <Input
                    id="point-rate"
                    type="number"
                    min="0"
                    value={pointRate}
                    onChange={(e) => setPointRate(e.target.value)}
                    placeholder="5000"
                  />
                  <Button
                    onClick={() => handleUpdateSetting("point_to_idr_rate", pointRate)}
                    disabled={isSaving === "point_to_idr_rate"}
                  >
                    {isSaving === "point_to_idr_rate" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: Rp {parseInt(settings?.point_to_idr_rate.value || "0").toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>

          {/* Minimum Withdrawal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-500" />
                Min Withdrawal
              </CardTitle>
              <CardDescription>
                Minimum amount for withdrawal requests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-withdrawal">Minimum Amount (IDR)</Label>
                <div className="flex gap-2">
                  <Input
                    id="min-withdrawal"
                    type="number"
                    min="0"
                    step="10000"
                    value={minWithdrawal}
                    onChange={(e) => setMinWithdrawal(e.target.value)}
                    placeholder="100000"
                  />
                  <Button
                    onClick={() => handleUpdateSetting("min_withdrawal_amount", minWithdrawal)}
                    disabled={isSaving === "min_withdrawal_amount"}
                  >
                    {isSaving === "min_withdrawal_amount" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: Rp {parseInt(settings?.min_withdrawal_amount.value || "0").toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How Settings Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Platform Fee</h4>
                <p>
                  When a photo is sold, this percentage is deducted as platform revenue.
                  The remaining amount goes to the photographer's wallet.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Point Rate</h4>
                <p>
                  Determines how much each point is worth in IDR.
                  Used for point purchases and photo pricing in points.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-foreground">Min Withdrawal</h4>
                <p>
                  Photographers must have at least this amount in their wallet
                  before they can request a withdrawal.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminSettings;
