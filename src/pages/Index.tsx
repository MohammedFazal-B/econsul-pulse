import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart3, Users, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-government-blue rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            eConsultation Platform
          </h1>
          <p className="text-xl text-muted-foreground mb-2 max-w-2xl mx-auto">
            Ministry of Corporate Affairs
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Share your valuable feedback and insights to help shape corporate policies and regulations
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-government-blue/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-government-blue/20 transition-colors">
                <MessageSquare className="w-6 h-6 text-government-blue" />
              </div>
              <CardTitle className="text-2xl">Submit Consultation</CardTitle>
              <CardDescription className="text-base">
                Share your feedback, suggestions, and comments on corporate affairs policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/user">
                <Button className="w-full text-lg py-6" size="lg">
                  Start Consultation
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-government-green/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-government-green/20 transition-colors">
                <BarChart3 className="w-6 h-6 text-government-green" />
              </div>
              <CardTitle className="text-2xl">Analytics Dashboard</CardTitle>
              <CardDescription className="text-base">
                View insights, sentiment analysis, and consultation statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button variant="secondary" className="w-full text-lg py-6" size="lg">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center p-8 bg-card rounded-lg border">
            <Users className="w-8 h-8 text-government-blue mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Public Engagement</h3>
            <p className="text-muted-foreground">Citizen-centric policy development</p>
          </div>
          <div className="text-center p-8 bg-card rounded-lg border">
            <BarChart3 className="w-8 h-8 text-government-green mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Data-Driven Insights</h3>
            <p className="text-muted-foreground">AI-powered sentiment analysis</p>
          </div>
          <div className="text-center p-8 bg-card rounded-lg border">
            <FileText className="w-8 h-8 text-government-orange mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-foreground mb-2">Transparent Process</h3>
            <p className="text-muted-foreground">Open consultation framework</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p>&copy; 2024 Ministry of Corporate Affairs, Government of India</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
