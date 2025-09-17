import { useState, useEffect } from "react";
import ReactWordcloud from "react-wordcloud";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Cloud, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WordCloudData {
  text: string;
  value: number;
}

const WordCloudComponent = () => {
  const [wordCloudData, setWordCloudData] = useState<WordCloudData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateWordCloud = async () => {
    setIsLoading(true);
    try {
      // Fetch all summaries from the sentiment_analysis table
      const { data, error } = await supabase
        .from('sentiment_analysis')
        .select('summary, keywords');

      if (error) throw error;

      // Process the data to create word frequency map
      const wordFrequency: { [key: string]: number } = {};

      // Combine summaries and keywords
      data?.forEach((item) => {
        // Process summary
        const summaryWords = item.summary
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 3);

        summaryWords.forEach(word => {
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        });

        // Process keywords (give them higher weight)
        item.keywords?.forEach((keyword: string) => {
          const cleanKeyword = keyword.toLowerCase();
          wordFrequency[cleanKeyword] = (wordFrequency[cleanKeyword] || 0) + 3;
        });
      });

      // Convert to word cloud format and get top 50 words
      const wordCloudArray = Object.entries(wordFrequency)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50);

      setWordCloudData(wordCloudArray);
      setIsOpen(true);
    } catch (error) {
      console.error('Error generating word cloud:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const options = {
    colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
    enableTooltip: true,
    deterministic: false,
    fontFamily: 'Inter, sans-serif',
    fontSizes: [20, 60] as [number, number],
    fontStyle: 'normal',
    fontWeight: 'normal',
    padding: 5,
    rotations: 3,
    rotationAngles: [0, 90] as [number, number],
    scale: 'sqrt' as const,
    spiral: 'archimedean' as const,
    transitionDuration: 1000,
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={generateWordCloud} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 mr-2" />
              Generate Word Cloud
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Consultation Keywords Word Cloud</DialogTitle>
          <DialogDescription>
            Most frequently mentioned keywords from all consultations
          </DialogDescription>
        </DialogHeader>
        <div className="h-96 w-full">
          {wordCloudData.length > 0 ? (
            <ReactWordcloud
              words={wordCloudData}
              options={options}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Cloud className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No data available for word cloud generation</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WordCloudComponent;