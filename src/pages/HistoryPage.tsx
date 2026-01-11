import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { PromptSubmission, SubmissionStatus, InputType } from "@/types/prompt";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RefinedPromptView } from "@/components/submit/RefinedPromptView";
import {
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Clock,
  FileText,
  Image,
  FileBox,
  Layers,
  RefreshCw,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const statusIcons: Record<SubmissionStatus, React.ElementType> = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle2,
  failed: AlertTriangle,
  rejected: XCircle,
};

const statusColors: Record<SubmissionStatus, string> = {
  pending: "bg-muted text-muted-foreground",
  processing: "bg-info/20 text-info",
  completed: "bg-success/20 text-success",
  failed: "bg-destructive/20 text-destructive",
  rejected: "bg-destructive/20 text-destructive",
};

const inputTypeIcons: Record<InputType, React.ElementType> = {
  text: FileText,
  image: Image,
  document: FileBox,
  mixed: Layers,
};

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | null>(null);
  const [inputTypeFilter, setInputTypeFilter] = useState<InputType | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<PromptSubmission | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { submissions, isLoading, refresh, deleteSubmission } = usePromptHistory({
    searchQuery,
    statusFilter,
    inputTypeFilter,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    const success = await deleteSubmission(deleteId);
    if (success) {
      toast.success("Submission deleted");
    } else {
      toast.error("Failed to delete submission");
    }
    setDeleteId(null);
  };

  const exportToJson = (submission: PromptSubmission) => {
    const data = JSON.stringify(submission.refined_prompt, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${submission.title || "prompt"}-${submission.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to JSON");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">History</h1>
            <p className="text-muted-foreground">View and manage your refined prompts</p>
          </div>
          <Button variant="outline" onClick={refresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={statusFilter || "all"}
                onValueChange={(v) => setStatusFilter(v === "all" ? null : (v as SubmissionStatus))}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={inputTypeFilter || "all"}
                onValueChange={(v) => setInputTypeFilter(v === "all" ? null : (v as InputType))}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <Layers className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Input Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Submissions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : submissions.length === 0 ? (
          <Card className="glass">
            <CardContent className="py-12 text-center">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No submissions found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter || inputTypeFilter
                  ? "Try adjusting your filters"
                  : "Submit your first prompt to get started"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => {
              const StatusIcon = statusIcons[submission.status];
              const InputIcon = inputTypeIcons[submission.input_type];

              return (
                <Card
                  key={submission.id}
                  className="glass glass-hover cursor-pointer"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-foreground truncate">
                            {submission.title || "Untitled Prompt"}
                          </h3>
                          <Badge className={cn("flex-shrink-0", statusColors[submission.status])}>
                            <StatusIcon
                              className={cn(
                                "w-3 h-3 mr-1",
                                submission.status === "processing" && "animate-spin"
                              )}
                            />
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <InputIcon className="w-4 h-4" />
                            {submission.input_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {format(new Date(submission.created_at), "MMM d, yyyy h:mm a")}
                          </span>
                          {submission.completeness_score !== null && (
                            <span className="flex items-center gap-1">
                              Score: {submission.completeness_score}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(submission);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {submission.refined_prompt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToJson(submission);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(submission.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* View Dialog */}
        <Dialog
          open={selectedSubmission !== null}
          onOpenChange={(open) => !open && setSelectedSubmission(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedSubmission?.title || "Untitled Prompt"}</DialogTitle>
              <DialogDescription>
                Created {selectedSubmission && format(new Date(selectedSubmission.created_at), "MMMM d, yyyy 'at' h:mm a")}
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission?.refined_prompt ? (
              <RefinedPromptView
                prompt={selectedSubmission.refined_prompt}
                processingTimeMs={selectedSubmission.processing_time_ms || undefined}
              />
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                {selectedSubmission?.status === "rejected" && (
                  <p>This submission was rejected: {selectedSubmission.error_message}</p>
                )}
                {selectedSubmission?.status === "failed" && (
                  <p>Processing failed: {selectedSubmission.error_message}</p>
                )}
                {selectedSubmission?.status === "processing" && (
                  <p>Still processing...</p>
                )}
                {selectedSubmission?.status === "pending" && (
                  <p>Waiting to be processed...</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The submission and its refined prompt will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
