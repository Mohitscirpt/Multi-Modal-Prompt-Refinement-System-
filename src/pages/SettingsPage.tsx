import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Database, Cpu, Shield, Info } from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">System configuration and information</p>
        </div>

        {/* System Info */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="text-lg font-medium text-foreground">1.0.0</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Environment</p>
                <p className="text-lg font-medium text-foreground">Production</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              AI Configuration
            </CardTitle>
            <CardDescription>
              The AI model used for prompt refinement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium text-foreground">Model</p>
                <p className="text-sm text-muted-foreground">Google Gemini 3 Flash Preview</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-medium text-foreground mb-2">Capabilities</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Multi-modal</Badge>
                <Badge variant="outline">Vision</Badge>
                <Badge variant="outline">Document Analysis</Badge>
                <Badge variant="outline">Structured Output</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Data Storage
            </CardTitle>
            <CardDescription>
              Backend infrastructure powered by Lovable Cloud
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Database</p>
                <p className="font-medium text-foreground">PostgreSQL</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">File Storage</p>
                <p className="font-medium text-foreground">Cloud Object Storage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Limits */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Limits & Constraints
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Max file size</span>
                <span className="font-medium text-foreground">20 MB</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Max files per submission</span>
                <span className="font-medium text-foreground">10 files</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Max text length</span>
                <span className="font-medium text-foreground">10,000 characters</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Supported image formats</span>
                <span className="font-medium text-foreground">JPG, PNG, WebP</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Supported document formats</span>
                <span className="font-medium text-foreground">PDF, DOCX</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
