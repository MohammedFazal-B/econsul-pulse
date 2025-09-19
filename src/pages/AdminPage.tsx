import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import WordCloudComponent from "@/components/WordCloudComponent";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Eye, Filter, MapPin, Minus, Search, SortAsc, SortDesc, ThumbsDown, ThumbsUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
  
  // Filter and sort states
  const [dateSort, setDateSort] = useState<'asc' | 'desc' | 'none'>('desc');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Get unique values for filter options
  const uniqueDistricts = [...new Set(userSubmissions.map(u => u.district))].sort();
  const uniqueStates = [...new Set(userSubmissions.map(u => u.state))].sort();

  // Filter and sort submissions
  const filteredAndSortedSubmissions = submissions
    .filter(submission => {
      const userSubmission = userSubmissions.find(u => u.comment === submission.full_comment);
      
      // Search filter
      if (searchQuery && !submission.summary.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Sentiment filter
      if (sentimentFilter !== 'all' && submission.sentiment_analysis.toLowerCase() !== sentimentFilter) {
        return false;
      }
      
      // District filter
      if (districtFilter !== 'all' && userSubmission?.district !== districtFilter) {
        return false;
      }
      
      // State filter
      if (stateFilter !== 'all' && userSubmission?.state !== stateFilter) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (dateSort === 'asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (dateSort === 'desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return 0;
    });

  // Analytics calculations
  const totalSubmissions = submissions.length;
  
  const sentimentData = submissions.reduce((acc, submission) => {
    const sentiment_analysis = submission.sentiment_analysis.toLowerCase();
    acc[sentiment_analysis] = (acc[sentiment_analysis] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const pieChartData = Object.entries(sentimentData).map(([sentiment_analysis, count]) => ({
    name: sentiment_analysis.charAt(0).toUpperCase() + sentiment_analysis.slice(1),
    value: count,
    fill: sentiment_analysis === 'positive' ? '#10B981' : sentiment_analysis === 'negative' ? '#EF4444' : '#60A5FA'
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
    neutral: { label: "Neutral", color: "#60A5FA" },
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

          {/* Sentiment Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Positive Feedback</CardTitle>
                <ThumbsUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {sentimentData.positive || 0}
                </div>
                <p className="text-xs text-green-600">
                  {totalSubmissions > 0 ? Math.round(((sentimentData.positive || 0) / totalSubmissions) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Negative Feedback</CardTitle>
                <ThumbsDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {sentimentData.negative || 0}
                </div>
                <p className="text-xs text-red-600">
                  {totalSubmissions > 0 ? Math.round(((sentimentData.negative || 0) / totalSubmissions) * 100) : 0}% of total
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Neutral Feedback</CardTitle>
                <Minus className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {sentimentData.neutral || 0}
                </div>
                <p className="text-xs text-blue-600">
                  {totalSubmissions > 0 ? Math.round(((sentimentData.neutral || 0) / totalSubmissions) * 100) : 0}% of total
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

          {/* Filter and Sort Section */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filter & Sort Submissions
              </CardTitle>
              <CardDescription>Filter and sort consultation submissions by various criteria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Date Sort */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sort by Date</label>
                  <Select value={dateSort} onValueChange={(value: 'asc' | 'desc' | 'none') => setDateSort(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">
                        <div className="flex items-center gap-2">
                          <SortDesc className="w-4 h-4" />
                          Descending
                        </div>
                      </SelectItem>
                      <SelectItem value="asc">
                        <div className="flex items-center gap-2">
                          <SortAsc className="w-4 h-4" />
                          Ascending
                        </div>
                      </SelectItem>
                      <SelectItem value="none">No Sorting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sentiment Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sentiment</label>
                  <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sentiments</SelectItem>
                      <SelectItem value="positive">Positive</SelectItem>
                      <SelectItem value="negative">Negative</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* District Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">District</label>
                  <Select value={districtFilter} onValueChange={setDistrictFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by district" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {uniqueDistricts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* State Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">State</label>
                  <Select value={stateFilter} onValueChange={setStateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All States</SelectItem>
                      {uniqueStates.map(state => (
                        <SelectItem key={state} value={state}>{state}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Search Summary</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search in summaries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Results Count */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{filteredAndSortedSubmissions.length}</span> of <span className="font-semibold">{submissions.length}</span> submissions
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
              <CardDescription>Latest consultation submissions with sentiment analysis and user details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Sentiment</th>
                      <th className="text-left p-3 font-medium">Summarized Comments</th>
                      <th className="text-left p-3 font-medium">Keywords</th>
                      <th className="text-left p-3 font-medium">Full Comments</th>
                      <th className="text-left p-3 font-medium">Show Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedSubmissions.map((submission, index) => {
                  const userSubmission = userSubmissions.find(u => 
                    u.comment === submission.full_comment
                  );
                  
                  return (
                        <motion.tr
                      key={submission.comment_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3">
                            <div className="text-sm text-muted-foreground">
                              {new Date(submission.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge 
                              className={`${
                                submission.sentiment_analysis.toLowerCase() === 'positive' 
                                  ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800' 
                                  : submission.sentiment_analysis.toLowerCase() === 'negative' 
                                    ? 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800' 
                                    : 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800'
                              }`}
                            >
                              {submission.sentiment_analysis}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-muted-foreground max-w-md">
                              {submission.summary}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1 border border-gray-200 rounded-md p-2 bg-gray-50">
                              {submission.keywords.slice(0, 3).map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs border-gray-300">
                                  {keyword}
                                </Badge>
                              ))}
                              {submission.keywords.length > 3 && (
                                <Badge variant="outline" className="text-xs border-gray-300">
                                  +{submission.keywords.length - 3}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm text-muted-foreground max-w-xs truncate">
                              {submission.full_comment.length > 50 
                                ? submission.full_comment.substring(0, 50) + '...' 
                                : submission.full_comment}
                            </div>
                          </td>
                          <td className="p-3">
                            {userSubmission ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 rounded-md shadow-sm hover:shadow transition-all duration-200">
                                    <Eye className="w-3 h-3" />
                                    View Details
                                  </button>
                                </DialogTrigger>
                                <DialogContent className="max-w-[85%] max-h-[95%] h-[85%] overflow-hidden">
                                  <DialogHeader className="border-b pb-4">
                                    <DialogTitle className="text-xl font-semibold text-gray-900">
                                      Consultation Details
                                    </DialogTitle>
                                  </DialogHeader>
                                  
                                  <div className="grid grid-cols-3 gap-8 h-[65vh] overflow-hidden">
                                    {/* Left Panel - User Details & Full Comments */}
                                    <div className="col-span-2 space-y-4 overflow-y-auto pr-4">
                                      {/* User Profile Card */}
                                      <div className="relative bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 shadow-lg overflow-hidden">
                                        {/* Unique Background Elements */}
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full -translate-y-12 translate-x-12 opacity-40"></div>
                                        <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full translate-y-10 -translate-x-10 opacity-40"></div>
                                        <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
                                        
                                        <div className="relative z-10">
                                          <div className="flex items-center gap-5 mb-6">
                                            <div className="relative group">
                                              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-white font-bold text-2xl shadow-xl group-hover:scale-105 transition-transform duration-300">
                                                {userSubmission.name.charAt(0).toUpperCase()}
                                              </div>
                                              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-lg opacity-30 -z-10"></div>
                                            </div>
                                            <div className="flex-1">
                                              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                                {userSubmission.name}
                                              </h3>
                                              <p className="text-sm text-gray-600 mb-3">{userSubmission.email}</p>
                                              <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-gray-500 font-medium">Consultation Participant</span>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          <div className="grid grid-cols-1 gap-4">
                                            <div className="relative group">
                                              <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                  <MapPin className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Location</p>
                                                  <p className="text-sm text-gray-900 font-semibold">{userSubmission.district}, {userSubmission.state}</p>
                                                </div>
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                              </div>
                                            </div>
                                            
                                            <div className="relative group">
                                              <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-purple-100 shadow-sm group-hover:shadow-md transition-all duration-300">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                  <Calendar className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Submitted</p>
                                                  <p className="text-sm text-gray-900 font-semibold">
                                                    {new Date(submission.created_at).toLocaleDateString('en-US', {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      year: 'numeric'
                                                    })}
                                                  </p>
                                                </div>
                                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Subject Card */}
                                      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Subject</h4>
                                        <p className="text-gray-900 leading-relaxed">{userSubmission.subject}</p>
                                      </div>

                                      {/* Full Comments Card */}
                                      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Full Comment</h4>
                                        <div className="bg-gray-50 rounded-md p-4">
                                          <p className="text-gray-700 leading-relaxed">{submission.full_comment}</p>
                                        </div>
                            </div>
                          </div>

                                    {/* Right Panel - Sentiment, Summary & Keywords */}
                                    <div className="col-span-1 space-y-4 overflow-y-auto">
                                      {/* Sentiment Analysis Card */}
                                      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Sentiment</h4>
                                        <div className="text-center">
                                          <Badge 
                                            className={`px-4 py-2 text-sm font-medium ${
                                              submission.sentiment_analysis.toLowerCase() === 'positive' 
                                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-700' 
                                                : submission.sentiment_analysis.toLowerCase() === 'negative' 
                                                  ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-50 hover:text-red-700' 
                                                  : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 hover:text-blue-700'
                                            }`}
                                          >
                                            {submission.sentiment_analysis}
                                          </Badge>
                                        </div>
                        </div>

                                      {/* Summary Card */}
                                      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Summary</h4>
                                        <p className="text-gray-700 text-sm leading-relaxed">{submission.summary}</p>
                      </div>
                      
                                      {/* Keywords Card */}
                                      <div className="bg-white border border-gray-100 rounded-lg p-5 shadow-sm">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Keywords</h4>
                                        <div className="flex flex-wrap gap-1.5">
                          {submission.keywords.map((keyword, idx) => (
                                            <Badge key={idx} variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700 px-2 py-1">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                                      {/* Additional Info Card */}
                                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-5 shadow-sm">
                                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Analysis</h4>
                                        <div className="space-y-2">
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-600">Confidence</span>
                                            <span className="font-medium text-gray-900">High</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-600">Processing</span>
                                            <span className="font-medium text-gray-900">Complete</span>
                                          </div>
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-600">Keywords Found</span>
                                            <span className="font-medium text-gray-900">{submission.keywords.length}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-muted-foreground text-sm">No user data</span>
                            )}
                          </td>
                        </motion.tr>
                  );
                })}
                  </tbody>
                </table>
              </div>
              
              {filteredAndSortedSubmissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {submissions.length === 0 ? 'No submissions found' : 'No submissions match your filters'}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;