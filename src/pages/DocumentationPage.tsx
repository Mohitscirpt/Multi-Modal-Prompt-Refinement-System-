import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  FileText,
  Image,
  FileBox,
  Layers,
  CheckCircle2,
  Target,
  Users,
  Flag,
  AlertTriangle,
  Code,
  Lightbulb,
  BookOpen,
} from "lucide-react";

export default function DocumentationPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">Documentation</h1>
          <p className="text-muted-foreground">
            Learn about the prompt refinement system, template structure, and design decisions.
          </p>
        </div>

        {/* Overview */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none">
            <p className="text-foreground">
              The Multi-Modal Prompt Refinement System transforms various input types (text, images,
              documents, or combinations) into a standardized, structured format suitable for
              downstream AI processing and product development workflows.
            </p>
            <h4 className="text-foreground font-medium mt-4">Key Features:</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>
                <strong className="text-foreground">Multi-Modal Input:</strong> Accepts text, images
                (JPG, PNG, WebP), and documents (PDF, DOCX)
              </li>
              <li>
                <strong className="text-foreground">AI-Powered Extraction:</strong> Uses Google
                Gemini 3 Flash for intelligent content analysis
              </li>
              <li>
                <strong className="text-foreground">Strict Validation:</strong> Rejects irrelevant
                inputs and flags incomplete information
              </li>
              <li>
                <strong className="text-foreground">Full Data Management:</strong> History tracking,
                search, filter, and export capabilities
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Input Types */}
        <Card className="glass">
          <CardHeader>
            <CardTitle>Supported Input Types</CardTitle>
            <CardDescription>The system accepts multiple input formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="w-8 h-8 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Text</h4>
                  <p className="text-sm text-muted-foreground">
                    Plain text descriptions, requirements, specifications, or any written content
                    about your product idea.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Image className="w-8 h-8 text-info mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Images</h4>
                  <p className="text-sm text-muted-foreground">
                    Product sketches, UI mockups, reference designs, screenshots. Supports JPG, PNG,
                    WebP formats.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileBox className="w-8 h-8 text-success mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Documents</h4>
                  <p className="text-sm text-muted-foreground">
                    Specification documents, requirement sheets, project briefs. Supports PDF and
                    DOCX formats.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Layers className="w-8 h-8 text-warning mt-1" />
                <div>
                  <h4 className="font-medium text-foreground">Mixed</h4>
                  <p className="text-sm text-muted-foreground">
                    Combine text with images and/or documents for comprehensive input that captures
                    all aspects of your idea.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Structure */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              Output Template Structure
            </CardTitle>
            <CardDescription>
              The refined prompt follows a standardized JSON structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="metadata">
                <AccordionTrigger className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">metadata</Badge>
                    Processing information and confidence score
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ul className="space-y-2 ml-4">
                    <li>
                      <code className="text-primary">id</code> - Unique identifier for the refined
                      prompt
                    </li>
                    <li>
                      <code className="text-primary">timestamp</code> - When the prompt was
                      processed
                    </li>
                    <li>
                      <code className="text-primary">source_types</code> - Array of input types used
                    </li>
                    <li>
                      <code className="text-primary">confidence_score</code> - 0-100 indicating
                      completeness
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="product_overview">
                <AccordionTrigger className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">product_overview</Badge>
                    Core product intent and purpose
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ul className="space-y-2 ml-4">
                    <li>
                      <code className="text-primary">title</code> - Concise product name/title
                    </li>
                    <li>
                      <code className="text-primary">description</code> - Brief overview of the
                      product
                    </li>
                    <li>
                      <code className="text-primary">target_users</code> - Who will use this product
                    </li>
                    <li>
                      <code className="text-primary">problem_statement</code> - The problem being
                      solved
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="requirements">
                <AccordionTrigger className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">requirements</Badge>
                    Functional and non-functional requirements
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ul className="space-y-2 ml-4">
                    <li>
                      <code className="text-primary">functional</code> - Array of what the product
                      must do
                    </li>
                    <li>
                      <code className="text-primary">non_functional</code> - Quality attributes
                      (performance, security, etc.)
                    </li>
                    <li>
                      <code className="text-primary">priority_ranked</code> - Whether requirements
                      are prioritized
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="constraints">
                <AccordionTrigger className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">constraints</Badge>
                    Technical and business limitations
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ul className="space-y-2 ml-4">
                    <li>
                      <code className="text-primary">technical</code> - Tech stack, platform
                      requirements
                    </li>
                    <li>
                      <code className="text-primary">business</code> - Budget, regulatory, market
                      constraints
                    </li>
                    <li>
                      <code className="text-primary">timeline</code> - Project timeline if mentioned
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="deliverables">
                <AccordionTrigger className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">deliverables</Badge>
                    Expected outputs and success criteria
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ul className="space-y-2 ml-4">
                    <li>
                      <code className="text-primary">expected_outputs</code> - What should be
                      delivered
                    </li>
                    <li>
                      <code className="text-primary">success_criteria</code> - How success is
                      measured
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="validation_flags">
                <AccordionTrigger className="text-foreground">
                  <span className="flex items-center gap-2">
                    <Badge variant="secondary">validation_flags</Badge>
                    Missing or ambiguous information
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <ul className="space-y-2 ml-4">
                    <li>
                      <code className="text-primary">missing_sections</code> - Required sections not
                      found
                    </li>
                    <li>
                      <code className="text-primary">ambiguous_items</code> - Items needing
                      clarification
                    </li>
                    <li>
                      <code className="text-primary">confidence_notes</code> - Additional notes
                      about quality
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Validation & Rejection */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Validation & Rejection Criteria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-foreground mb-2">Input will be REJECTED if:</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Content is not related to product development or software projects</li>
                <li>• Input is spam, gibberish, or obviously irrelevant</li>
                <li>• Content is purely personal, conversational, or off-topic</li>
                <li>• No actionable product information can be extracted</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Input will be FLAGGED (not rejected) if:</h4>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Missing key sections (target users, requirements, etc.)</li>
                <li>• Ambiguous or unclear specifications</li>
                <li>• Conflicting information between sources</li>
                <li>• Low confidence in extracted information</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Design Decisions */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              Design Decisions & Rationale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Why this template structure?
              </h4>
              <p className="text-muted-foreground">
                The template follows standard product development documentation patterns (PRDs, user
                stories) to ensure the refined prompt is immediately useful for development teams. The
                hierarchical structure (overview → requirements → constraints → deliverables) mirrors
                how products are typically scoped and built.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Why strict validation over best-effort?
              </h4>
              <p className="text-muted-foreground">
                Product development requires precision. A best-effort approach would produce outputs
                with hidden quality issues, leading to downstream problems. Strict validation surfaces
                issues immediately, ensuring users provide adequate input or understand what's missing.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Why separate functional vs non-functional requirements?
              </h4>
              <p className="text-muted-foreground">
                This separation is industry standard and helps development teams prioritize and plan.
                Functional requirements drive feature development, while non-functional requirements
                influence architecture decisions. Mixing them leads to confusion and missed quality
                attributes.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">
                Why include confidence scoring?
              </h4>
              <p className="text-muted-foreground">
                AI extraction isn't perfect. The confidence score (0-100) gives users a quick indicator
                of output quality without requiring them to review every field. Scores below 50% suggest
                the input needs enhancement; scores above 80% indicate high-quality, actionable output.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
