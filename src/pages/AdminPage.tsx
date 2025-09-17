import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, TrendingUp, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import WordCloudComponent from "@/components/WordCloudComponent";

interface SubmissionData {
  comment_id: string;
  full_comment: string;
  summary: string;
  sentiment_analysis: string;
  keywords: string[];
  created_at: string;
}

interface UserSubmission {
  id: string;
  name: string;
  email: string;
  district: string;
  state: string;
  subject: string;
  comment: string;
  created_at: string;
}

const AdminPage = () => {
  const [submissions, setSubmissions] = useState<SubmissionData[]>([]);
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPersonalInfo, setShowPersonalInfo] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      // Fetch sentiment analysis data
      const { data: sentimentData, error: sentimentError } = await supabase
        .from('sentiment_analysis')
        .select('*')
        .order('created_at', { ascending: false });

      if (sentimentError) throw sentimentError;

      // Fetch user submissions
      const { data: userData, error: userError } = await supabase
        .from('user_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (userError) throw userError;

      setSubmissions(sentimentData || []);
      setUserSubmissions(userData || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePersonalInfo = (id: string) => {
    setShowPersonalInfo(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Analytics calculations
  const totalSubmissions = submissions.length;
  
  const sentimentData = submissions.reduce((acc, submission) => {
    const sentiment = submission.sentiment_analysis.toLowerCase();
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const pieChartData = Object.entries(sentimentData).map(([sentiment, count]) => ({
    name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
    value: count,
    fill: sentiment === 'positive' ? '#10B981' : sentiment === 'negative' ? '#EF4444' : '#6B7280'
  }));

  const subjectData = userSubmissions.reduce((acc, submission) => {
    const subject = submission.subject;
    acc[subject] = (acc[subject] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const barChartData = Object.entries(subjectData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)
    .map(([subject, count]) => ({
      subject: subject.length > 20 ? subject.substring(0, 20) + '...' : subject,
      count
    }));

  const chartConfig = {
    positive: { label: "Positive", color: "#10B981" },
    negative: { label: "Negative", color: "#EF4444" },
    neutral: { label: "Neutral", color: "#6B7280" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Consultation insights and sentiment analysis
            </p>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSubmissions}</div>
                <p className="text-xs text-muted-foreground">
                  Active consultations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {totalSubmissions > 0 ? Math.round(((sentimentData.positive || 0) / totalSubmissions) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {sentimentData.positive || 0} positive responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique Subjects</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(subjectData).length}</div>
                <p className="text-xs text-muted-foreground">
                  Different topics discussed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Word Cloud */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Overall sentiment of all consultations</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <ChartTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Most Active Subjects</CardTitle>
                <CardDescription>Top consultation topics by frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="subject" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Word Cloud */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Keyword Analysis</CardTitle>
              <CardDescription>Generate a word cloud from all consultation summaries</CardDescription>
            </CardHeader>
            <CardContent>
              <WordCloudComponent />
            </CardContent>
          </Card>

          {/* Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest consultation submissions with sentiment analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.map((submission, index) => {
                  const userSubmission = userSubmissions.find(u => 
                    u.comment === submission.full_comment
                  );
                  const isPersonalVisible = showPersonalInfo[submission.comment_id];
                  
                  return (
                    <motion.div
                      key={submission.comment_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            variant={
                              submission.sentiment_analysis.toLowerCase() === 'positive' 
                                ? 'default' 
                                : submission.sentiment_analysis.toLowerCase() === 'negative' 
                                  ? 'destructive' 
                                  : 'secondary'
                            }
                          >
                            {submission.sentiment_analysis}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {userSubmission && (
                          <button
                            onClick={() => togglePersonalInfo(submission.comment_id)}
                            className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {isPersonalVisible ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                <span>Hide Info</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                <span>Show Info</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      
                      {userSubmission && isPersonalVisible && (
                        <div className="bg-muted/50 rounded p-3 space-y-2">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {userSubmission.name}
                            </div>
                            <div>
                              <span className="font-medium">Email:</span> {userSubmission.email}
                            </div>
                            <div>
                              <span className="font-medium">District:</span> {userSubmission.district}
                            </div>
                            <div>
                              <span className="font-medium">State:</span> {userSubmission.state}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-sm">Subject:</span> {userSubmission.subject}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Summary</h4>
                        <p className="text-sm text-muted-foreground">{submission.summary}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Keywords</h4>
                        <div className="flex flex-wrap gap-2">
                          {submission.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="outline">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm font-medium text-primary hover:underline">
                          View Full Comment
                        </summary>
                        <p className="mt-2 text-sm text-muted-foreground p-3 bg-muted/30 rounded">
                          {submission.full_comment}
                        </p>
                      </details>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;