import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, CheckCircle, AlertCircle, Star } from 'lucide-react';

export default function InterviewAssessment({ candidate, onComplete }) {
  const [responses, setResponses] = useState(candidate.interview_responses || '');
  const [assessing, setAssessing] = useState(false);
  const [assessment, setAssessment] = useState(
    candidate.interview_assessment ? JSON.parse(candidate.interview_assessment) : null
  );

  const runAssessment = async () => {
    if (!responses.trim()) {
      alert('Please enter interview responses first');
      return;
    }

    setAssessing(true);
    try {
      const response = await base44.functions.invoke('assessInterview', {
        candidateId: candidate.id,
        interviewResponses: responses
      });

      if (response.data?.success) {
        setAssessment(response.data.data);
        onComplete();
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setAssessing(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-400';
    if (rating >= 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      strongly_recommend: 'bg-green-500/20 text-green-300 border-green-500',
      recommend: 'bg-blue-500/20 text-blue-300 border-blue-500',
      consider: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
      not_recommended: 'bg-red-500/20 text-red-300 border-red-500'
    };
    return colors[rec] || 'bg-gray-500/20 text-gray-300 border-gray-500';
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-gray-300 text-sm mb-2 block">
          Interview Responses (paste Q&A or notes)
        </label>
        <Textarea
          value={responses}
          onChange={(e) => setResponses(e.target.value)}
          placeholder="Q: Tell me about your experience with React?
A: I've been working with React for 3 years...

Q: How do you handle challenging team situations?
A: I believe in open communication..."
          className="bg-slate-900 border-slate-700 text-white h-48 font-mono text-sm"
        />
      </div>

      <Button
        onClick={runAssessment}
        disabled={assessing || !responses.trim()}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {assessing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing Interview...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Assessment
          </>
        )}
      </Button>

      {assessment && (
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-lg">AI Assessment Results</CardTitle>
              <div className={`px-3 py-1 rounded border ${getRecommendationColor(assessment.recommendation)}`}>
                {assessment.recommendation?.replace('_', ' ')}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Score */}
            <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="text-4xl font-bold text-purple-400 mb-1">
                {assessment.overall_score}/100
              </div>
              <div className="text-gray-400 text-sm">Overall Score</div>
            </div>

            {/* Ratings */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-slate-800 rounded">
                <div className={`text-2xl font-bold ${getRatingColor(assessment.communication_rating)}`}>
                  {assessment.communication_rating}/5
                </div>
                <div className="text-gray-400 text-xs mt-1">Communication</div>
              </div>
              <div className="text-center p-3 bg-slate-800 rounded">
                <div className={`text-2xl font-bold ${getRatingColor(assessment.technical_rating)}`}>
                  {assessment.technical_rating}/5
                </div>
                <div className="text-gray-400 text-xs mt-1">Technical</div>
              </div>
              <div className="text-center p-3 bg-slate-800 rounded">
                <div className={`text-2xl font-bold ${getRatingColor(assessment.cultural_fit_rating)}`}>
                  {assessment.cultural_fit_rating}/5
                </div>
                <div className="text-gray-400 text-xs mt-1">Cultural Fit</div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 bg-blue-500/10 rounded border border-blue-500/20">
              <p className="text-blue-300 text-sm font-medium mb-2">Summary</p>
              <p className="text-gray-300 text-sm">{assessment.summary}</p>
            </div>

            {/* Strengths */}
            {assessment.strengths && (
              <div className="p-3 bg-green-500/10 rounded border border-green-500/20">
                <p className="text-green-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Strengths
                </p>
                <p className="text-gray-300 text-sm whitespace-pre-line">{assessment.strengths}</p>
              </div>
            )}

            {/* Concerns */}
            {assessment.concerns && (
              <div className="p-3 bg-orange-500/10 rounded border border-orange-500/20">
                <p className="text-orange-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Concerns
                </p>
                <p className="text-gray-300 text-sm whitespace-pre-line">{assessment.concerns}</p>
              </div>
            )}

            {/* Next Steps */}
            {assessment.next_steps && (
              <div className="p-3 bg-purple-500/10 rounded border border-purple-500/20">
                <p className="text-purple-300 text-sm font-medium mb-2 flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Next Steps
                </p>
                <p className="text-gray-300 text-sm">{assessment.next_steps}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}