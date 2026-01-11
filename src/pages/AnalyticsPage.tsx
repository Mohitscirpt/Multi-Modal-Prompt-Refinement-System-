import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  FileText,
  Image,
  FileBox,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { format, subDays, startOfDay, isAfter } from "date-fns";

type DateRange = "7d" | "30d" | "90d" | "all";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const { submissions, isLoading } = usePromptHistory({ limit: 1000 });

  const filteredSubmissions = useMemo(() => {
    if (dateRange === "all") return submissions;
    
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90;
    const cutoffDate = startOfDay(subDays(new Date(), days));
    
    return submissions.filter((s) => isAfter(new Date(s.created_at), cutoffDate));
  }, [submissions, dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredSubmissions.length;
    const completed = filteredSubmissions.filter((s) => s.status === "completed").length;
    const failed = filteredSubmissions.filter((s) => s.status === "failed" || s.status === "rejected").length;
    const avgScore = filteredSubmissions
      .filter((s) => s.completeness_score !== null)
      .reduce((acc, s, _, arr) => acc + (s.completeness_score || 0) / arr.length, 0);

    return {
      total,
      completed,
      failed,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgScore: Math.round(avgScore),
    };
  }, [filteredSubmissions]);

  // Input type distribution
  const inputTypeData = useMemo(() => {
    const counts = { text: 0, image: 0, document: 0, mixed: 0 };
    filteredSubmissions.forEach((s) => {
      counts[s.input_type] = (counts[s.input_type] || 0) + 1;
    });
    return [
      { name: "Text", value: counts.text, color: "hsl(262, 83%, 58%)" },
      { name: "Image", value: counts.image, color: "hsl(199, 89%, 48%)" },
      { name: "Document", value: counts.document, color: "hsl(142, 71%, 45%)" },
      { name: "Mixed", value: counts.mixed, color: "hsl(38, 92%, 50%)" },
    ].filter((d) => d.value > 0);
  }, [filteredSubmissions]);

  // Status distribution
  const statusData = useMemo(() => {
    const counts = { completed: 0, failed: 0, rejected: 0, pending: 0, processing: 0 };
    filteredSubmissions.forEach((s) => {
      counts[s.status] = (counts[s.status] || 0) + 1;
    });
    return [
      { name: "Completed", value: counts.completed, color: "hsl(142, 71%, 45%)" },
      { name: "Failed", value: counts.failed, color: "hsl(0, 63%, 50%)" },
      { name: "Rejected", value: counts.rejected, color: "hsl(0, 84%, 60%)" },
      { name: "Pending", value: counts.pending, color: "hsl(217, 33%, 60%)" },
      { name: "Processing", value: counts.processing, color: "hsl(199, 89%, 48%)" },
    ].filter((d) => d.value > 0);
  }, [filteredSubmissions]);

  // Submissions over time
  const timelineData = useMemo(() => {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 30;
    const data: { date: string; submissions: number; avgScore: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = startOfDay(subDays(new Date(), i));
      const dateStr = format(date, "MMM d");
      const daySubmissions = filteredSubmissions.filter((s) => {
        const submissionDate = startOfDay(new Date(s.created_at));
        return submissionDate.getTime() === date.getTime();
      });

      const avgScore = daySubmissions
        .filter((s) => s.completeness_score !== null)
        .reduce((acc, s, _, arr) => acc + (s.completeness_score || 0) / (arr.length || 1), 0);

      data.push({
        date: dateStr,
        submissions: daySubmissions.length,
        avgScore: Math.round(avgScore) || 0,
      });
    }

    return data;
  }, [filteredSubmissions, dateRange]);

  // Completeness score distribution
  const scoreDistribution = useMemo(() => {
    const buckets = [
      { range: "0-20%", min: 0, max: 20, count: 0 },
      { range: "21-40%", min: 21, max: 40, count: 0 },
      { range: "41-60%", min: 41, max: 60, count: 0 },
      { range: "61-80%", min: 61, max: 80, count: 0 },
      { range: "81-100%", min: 81, max: 100, count: 0 },
    ];

    filteredSubmissions.forEach((s) => {
      if (s.completeness_score !== null) {
        const bucket = buckets.find(
          (b) => s.completeness_score! >= b.min && s.completeness_score! <= b.max
        );
        if (bucket) bucket.count++;
      }
    });

    return buckets;
  }, [filteredSubmissions]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground">Insights into your prompt refinement activity</p>
          </div>
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                  <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.successRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-info" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className="text-2xl font-bold text-foreground">{stats.avgScore}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Failed/Rejected</p>
                  <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Timeline Chart */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Submissions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="submissions"
                      stroke="hsl(262, 83%, 58%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(262, 83%, 58%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Completeness Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="range"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Type Distribution */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Input Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {inputTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={inputTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {inputTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
