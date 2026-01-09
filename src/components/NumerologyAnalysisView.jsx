import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function NumerologyAnalysisView({ person, entityType, onGenerate, generating }) {
  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            Detailed Numerology Analysis
          </CardTitle>
          <Button
            onClick={() => onGenerate(person.id, entityType)}
            disabled={generating}
            className="bg-amber-600 hover:bg-amber-700"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                {person.numerology_analysis ? 'Regenerate' : 'Generate'} Analysis
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!person.numerology_analysis && !generating && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No analysis generated yet. Click the button above to generate a comprehensive numerology interpretation.</p>
          </div>
        )}
        
        {generating && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Generating detailed numerology analysis...</p>
            <p className="text-gray-500 text-sm mt-2">This may take 30-60 seconds</p>
          </div>
        )}
        
        {person.numerology_analysis && !generating && (
          <div className="prose prose-invert prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-teal-400 mt-6 mb-3" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-purple-400 mt-4 mb-2" {...props} />,
                p: ({node, ...props}) => <p className="text-gray-300 mb-3 leading-relaxed" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-300 mb-3 space-y-1" {...props} />,
                strong: ({node, ...props}) => <strong className="text-amber-400 font-semibold" {...props} />,
                em: ({node, ...props}) => <em className="text-blue-400 italic" {...props} />
              }}
            >
              {person.numerology_analysis}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}