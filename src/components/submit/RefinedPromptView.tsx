import { RefinedPrompt } from "@/types/prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Flag,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RefinedPromptViewProps {
  prompt: RefinedPrompt;
  processingTimeMs?: number;
}

export function RefinedPromptView({ prompt, processingTimeMs }: RefinedPromptViewProps) {
  const confidenceScore = prompt.metadata.confidence_score;
  const hasMissingSections = prompt.validation_flags.missing_sections.length > 0;
  const hasAmbiguousItems = prompt.validation_flags.ambiguous_items.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Confidence</p>
              <p className="text-xl font-bold text-foreground">{confidenceScore}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
              <Layers className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sources</p>
              <p className="text-xl font-bold text-foreground">
                {prompt.metadata.source_types.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardContent className="p-4 flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                hasMissingSections || hasAmbiguousItems
                  ? "bg-warning/20"
                  : "bg-success/20"
              )}
            >
              {hasMissingSections || hasAmbiguousItems ? (
                <AlertTriangle className="w-5 h-5 text-warning" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-success" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="text-xl font-bold text-foreground">
                {hasMissingSections || hasAmbiguousItems ? "Review" : "Complete"}
              </p>
            </div>
          </CardContent>
        </Card>

        {processingTimeMs && (
          <Card className="glass">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Processing</p>
                <p className="text-xl font-bold text-foreground">
                  {(processingTimeMs / 1000).toFixed(1)}s
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Confidence Progress */}
      <Card className="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Completeness Score</span>
            <span className="text-sm text-muted-foreground">{confidenceScore}%</span>
          </div>
          <Progress
            value={confidenceScore}
            className={cn(
              "h-2",
              confidenceScore >= 80
                ? "[&>div]:bg-success"
                : confidenceScore >= 50
                ? "[&>div]:bg-warning"
                : "[&>div]:bg-destructive"
            )}
          />
        </CardContent>
      </Card>

      {/* Product Overview */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-primary" />
            Product Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
            <p className="text-foreground">{prompt.product_overview.title || "Not specified"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
            <p className="text-foreground">
              {prompt.product_overview.description || "Not specified"}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="w-4 h-4" /> Target Users
              </h4>
              <p className="text-foreground">
                {prompt.product_overview.target_users || "Not specified"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Target className="w-4 h-4" /> Problem Statement
              </h4>
              <p className="text-foreground">
                {prompt.product_overview.problem_statement || "Not specified"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flag className="w-5 h-5 text-primary" />
            Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Functional Requirements
            </h4>
            {prompt.requirements.functional.length > 0 ? (
              <ul className="space-y-2">
                {prompt.requirements.functional.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">No functional requirements extracted</p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Non-Functional Requirements
            </h4>
            {prompt.requirements.non_functional.length > 0 ? (
              <ul className="space-y-2">
                {prompt.requirements.non_functional.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-info mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">
                No non-functional requirements extracted
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Constraints & Deliverables */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Technical</h4>
              <div className="flex flex-wrap gap-2">
                {prompt.constraints.technical.length > 0 ? (
                  prompt.constraints.technical.map((c, i) => (
                    <Badge key={i} variant="secondary">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm italic">None specified</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Business</h4>
              <div className="flex flex-wrap gap-2">
                {prompt.constraints.business.length > 0 ? (
                  prompt.constraints.business.map((c, i) => (
                    <Badge key={i} variant="outline">
                      {c}
                    </Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground text-sm italic">None specified</span>
                )}
              </div>
            </div>
            {prompt.constraints.timeline && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Timeline</h4>
                <Badge variant="secondary">{prompt.constraints.timeline}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Deliverables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Expected Outputs</h4>
              {prompt.deliverables.expected_outputs.length > 0 ? (
                <ul className="space-y-1">
                  {prompt.deliverables.expected_outputs.map((d, i) => (
                    <li key={i} className="text-foreground text-sm">
                      • {d}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground text-sm italic">None specified</span>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Success Criteria</h4>
              {prompt.deliverables.success_criteria.length > 0 ? (
                <ul className="space-y-1">
                  {prompt.deliverables.success_criteria.map((c, i) => (
                    <li key={i} className="text-foreground text-sm">
                      • {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-muted-foreground text-sm italic">None specified</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation Flags */}
      {(hasMissingSections || hasAmbiguousItems || prompt.validation_flags.confidence_notes) && (
        <Card className="glass border-warning/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-warning">
              <AlertTriangle className="w-5 h-5" />
              Validation Flags
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hasMissingSections && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Missing Sections
                </h4>
                <div className="flex flex-wrap gap-2">
                  {prompt.validation_flags.missing_sections.map((s, i) => (
                    <Badge key={i} variant="destructive">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {hasAmbiguousItems && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Ambiguous Items
                </h4>
                <div className="flex flex-wrap gap-2">
                  {prompt.validation_flags.ambiguous_items.map((a, i) => (
                    <Badge key={i} variant="secondary">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {prompt.validation_flags.confidence_notes && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
                <p className="text-sm text-foreground">
                  {prompt.validation_flags.confidence_notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
