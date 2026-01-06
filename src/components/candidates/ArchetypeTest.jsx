import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const ARCHETYPE_QUESTIONS = [
  {
    id: 1,
    question: "When starting a new project, you prefer to:",
    options: [
      { text: "Generate innovative ideas and see the big picture", archetype: "visionary", weight: 3 },
      { text: "Analyze data and create a detailed plan", archetype: "strategist", weight: 3 },
      { text: "Jump in and start building/creating immediately", archetype: "creator", weight: 3 },
      { text: "Ensure everyone is aligned and comfortable", archetype: "harmonizer", weight: 3 }
    ]
  },
  {
    id: 2,
    question: "In team meetings, you typically:",
    options: [
      { text: "Propose bold new directions", archetype: "visionary", weight: 2 },
      { text: "Ask critical questions and challenge assumptions", archetype: "strategist", weight: 2 },
      { text: "Share practical solutions and examples", archetype: "creator", weight: 2 },
      { text: "Mediate conflicts and ensure everyone is heard", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 3,
    question: "Your biggest strength at work is:",
    options: [
      { text: "Inspiring others with your vision", archetype: "visionary", weight: 3 },
      { text: "Strategic thinking and problem-solving", archetype: "strategist", weight: 3 },
      { text: "Executing and delivering results", archetype: "creator", weight: 3 },
      { text: "Building relationships and team cohesion", archetype: "harmonizer", weight: 3 }
    ]
  },
  {
    id: 4,
    question: "When facing a challenge, you:",
    options: [
      { text: "See it as an opportunity for transformation", archetype: "visionary", weight: 2 },
      { text: "Break it down into manageable steps", archetype: "strategist", weight: 2 },
      { text: "Roll up your sleeves and tackle it head-on", archetype: "creator", weight: 2 },
      { text: "Seek input from others and find consensus", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 5,
    question: "You're most energized by:",
    options: [
      { text: "Brainstorming and exploring possibilities", archetype: "visionary", weight: 2 },
      { text: "Analyzing patterns and optimizing processes", archetype: "strategist", weight: 2 },
      { text: "Building tangible things and seeing progress", archetype: "creator", weight: 2 },
      { text: "Helping others succeed and grow", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 6,
    question: "Your ideal work environment is:",
    options: [
      { text: "Fast-paced with lots of change and innovation", archetype: "visionary", weight: 2 },
      { text: "Structured with clear goals and metrics", archetype: "strategist", weight: 2 },
      { text: "Hands-on with freedom to experiment", archetype: "creator", weight: 2 },
      { text: "Collaborative with supportive teammates", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 7,
    question: "When making decisions, you prioritize:",
    options: [
      { text: "Long-term impact and potential", archetype: "visionary", weight: 3 },
      { text: "Data, logic, and risk assessment", archetype: "strategist", weight: 3 },
      { text: "Practicality and feasibility", archetype: "creator", weight: 3 },
      { text: "Impact on people and team dynamics", archetype: "harmonizer", weight: 3 }
    ]
  },
  {
    id: 8,
    question: "Your communication style is:",
    options: [
      { text: "Inspirational and future-focused", archetype: "visionary", weight: 2 },
      { text: "Logical and detail-oriented", archetype: "strategist", weight: 2 },
      { text: "Direct and action-oriented", archetype: "creator", weight: 2 },
      { text: "Empathetic and supportive", archetype: "harmonizer", weight: 2 }
    ]
  }
];

export default function ArchetypeTest({ onComplete, candidateName }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    const newAnswers = { ...answers, [currentQuestion]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);
    
    if (currentQuestion < ARCHETYPE_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateArchetype(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] !== undefined ? answers[currentQuestion - 1] : null);
    }
  };

  const calculateArchetype = (finalAnswers) => {
    const scores = {
      visionary: 0,
      strategist: 0,
      creator: 0,
      harmonizer: 0
    };

    Object.keys(finalAnswers).forEach((questionIndex) => {
      const optionIndex = finalAnswers[questionIndex];
      const question = ARCHETYPE_QUESTIONS[questionIndex];
      const option = question.options[optionIndex];
      scores[option.archetype] += option.weight;
    });

    const sortedArchetypes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const primary = sortedArchetypes[0][0];
    const secondary = sortedArchetypes[1][0];

    onComplete({
      primary,
      secondary,
      scores,
      answers: finalAnswers
    });
  };

  const question = ARCHETYPE_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / ARCHETYPE_QUESTIONS.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-300 text-sm">
            Question {currentQuestion + 1} of {ARCHETYPE_QUESTIONS.length}
          </p>
          <p className="text-gray-400 text-sm">{Math.round(progress)}% Complete</p>
        </div>
        <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedOption?.toString()} onValueChange={(v) => setSelectedOption(parseInt(v))}>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    selectedOption === index
                      ? 'border-teal-500 bg-teal-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-900/50'
                  }`}
                  onClick={() => setSelectedOption(index)}
                >
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} className="mr-3" />
                  <Label htmlFor={`option-${index}`} className="text-gray-200 cursor-pointer flex-1">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          disabled={currentQuestion === 0}
          variant="outline"
          className="border-slate-700 text-gray-300"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleAnswer}
          disabled={selectedOption === null}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {currentQuestion === ARCHETYPE_QUESTIONS.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}