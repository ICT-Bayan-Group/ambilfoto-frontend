import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DeveloperLayout } from "@/components/developer/DeveloperLayout";
import { developerService, DeveloperOverview } from "@/services/api/developer.service";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Save, Building2, Globe, Phone } from "lucide-react";

const DeveloperSettings = () => {
  const { id } = useParams<{ id: string }>();
  const [overview, setOverview] = useState<DeveloperOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: "",
    website: "",
    description: "",
    contact_phone: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (!id) return;
    developerService.getOverview(id)
      .then((res) => {
        if (res.success) {
          setOverview(res.data);
          setForm({
            company_name: res.data.developer.company_name || "",
            website: res.data.developer.website || "",
            description: "",
            contact_phone: "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await developerService.updateProfile(id, form);
      toast({ title: "Profile updated", description: "Changes saved successfully." });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (!id) return null;

  return (
    <DeveloperLayout developerId={id}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your developer profile and account preferences.</p>
        </div>

        {loading ? (
          <Skeleton className="h-64 rounded-xl" />
        ) : (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Developer Profile</CardTitle>
              <CardDescription>
                This information is used for your invoices and developer dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company" className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5" /> Company Name
                  </Label>
                  <Input
                    id="company"
                    placeholder="PT Contoh Teknologi"
                    value={form.company_name}
                    onChange={(e) => setForm((f) => ({ ...f, company_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="website" className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    value={form.website}
                    onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Contact Phone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+628123456789"
                    value={form.contact_phone}
                    onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="desc">Company Description</Label>
                <Input
                  id="desc"
                  placeholder="Deskripsi singkat perusahaan"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account info */}
        {overview && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
              <CardDescription>Read-only account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Full Name</span>
                <span className="font-medium">{overview.developer.full_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{overview.developer.email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Developer ID</span>
                <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{id}</code>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DeveloperLayout>
  );
};

export default DeveloperSettings;
