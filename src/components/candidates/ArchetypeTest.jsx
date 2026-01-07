import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const ALL_QUESTIONS = [
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
  },
  {
    id: 9,
    question: "Under pressure, you tend to:",
    options: [
      { text: "Pivot quickly and explore new approaches", archetype: "visionary", weight: 2 },
      { text: "Double down on analysis and careful planning", archetype: "strategist", weight: 2 },
      { text: "Focus on what can be done right now", archetype: "creator", weight: 2 },
      { text: "Check in with the team and realign priorities", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 10,
    question: "When receiving feedback, you:",
    options: [
      { text: "Consider how it applies to future possibilities", archetype: "visionary", weight: 2 },
      { text: "Analyze it objectively and look for patterns", archetype: "strategist", weight: 2 },
      { text: "Focus on what actions you can take immediately", archetype: "creator", weight: 2 },
      { text: "Appreciate the relationship and understand their perspective", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 11,
    question: "A project is falling behind schedule. You:",
    options: [
      { text: "Reimagine the approach or pivot to a better solution", archetype: "visionary", weight: 2 },
      { text: "Assess what went wrong and adjust the plan", archetype: "strategist", weight: 2 },
      { text: "Work harder to catch up and deliver", archetype: "creator", weight: 2 },
      { text: "Rally the team and ensure no one is overwhelmed", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 12,
    question: "What frustrates you most at work?",
    options: [
      { text: "Lack of vision or being stuck in the status quo", archetype: "visionary", weight: 3 },
      { text: "Poor planning or inconsistent processes", archetype: "strategist", weight: 3 },
      { text: "Too much talk, not enough action", archetype: "creator", weight: 3 },
      { text: "Conflict or lack of team cohesion", archetype: "harmonizer", weight: 3 }
    ]
  },
  {
    id: 13,
    question: "When learning something new, you prefer to:",
    options: [
      { text: "Understand the big picture first, then dive into details", archetype: "visionary", weight: 2 },
      { text: "Study systematically with a structured approach", archetype: "strategist", weight: 2 },
      { text: "Learn by doing and experimenting hands-on", archetype: "creator", weight: 2 },
      { text: "Learn with others in a collaborative setting", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 14,
    question: "Your approach to risk is:",
    options: [
      { text: "Embrace it if the potential upside is transformative", archetype: "visionary", weight: 2 },
      { text: "Carefully evaluate and mitigate before proceeding", archetype: "strategist", weight: 2 },
      { text: "Take calculated risks if it moves things forward", archetype: "creator", weight: 2 },
      { text: "Consider how it affects the team before deciding", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 15,
    question: "In a brainstorming session, you're the one who:",
    options: [
      { text: "Pushes the boundaries with unconventional ideas", archetype: "visionary", weight: 3 },
      { text: "Evaluates feasibility and identifies potential issues", archetype: "strategist", weight: 3 },
      { text: "Volunteers to prototype or test ideas quickly", archetype: "creator", weight: 3 },
      { text: "Ensures everyone contributes and feels heard", archetype: "harmonizer", weight: 3 }
    ]
  },
  {
    id: 16,
    question: "When a teammate is struggling, you:",
    options: [
      { text: "Help them see the bigger purpose of their work", archetype: "visionary", weight: 2 },
      { text: "Offer a clear framework or system to help them", archetype: "strategist", weight: 2 },
      { text: "Jump in and help them get it done", archetype: "creator", weight: 2 },
      { text: "Listen and provide emotional support", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 17,
    question: "Your work style is best described as:",
    options: [
      { text: "Disruptive and forward-thinking", archetype: "visionary", weight: 3 },
      { text: "Methodical and analytical", archetype: "strategist", weight: 3 },
      { text: "Hands-on and results-driven", archetype: "creator", weight: 3 },
      { text: "Collaborative and people-focused", archetype: "harmonizer", weight: 3 }
    ]
  },
  {
    id: 18,
    question: "At the end of the day, you feel accomplished when:",
    options: [
      { text: "You've sparked new ideas or inspired change", archetype: "visionary", weight: 2 },
      { text: "You've solved a complex problem or improved a system", archetype: "strategist", weight: 2 },
      { text: "You've completed concrete tasks and delivered results", archetype: "creator", weight: 2 },
      { text: "You've strengthened team relationships or helped someone", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 19,
    question: "If you could change one thing about your workplace, it would be:",
    options: [
      { text: "More innovation and willingness to try new things", archetype: "visionary", weight: 2 },
      { text: "Better systems and more efficient processes", archetype: "strategist", weight: 2 },
      { text: "Less bureaucracy and faster execution", archetype: "creator", weight: 2 },
      { text: "Stronger culture and team connection", archetype: "harmonizer", weight: 2 }
    ]
  },
  {
    id: 20,
    question: "Your natural leadership style is:",
    options: [
      { text: "Inspiring others with a compelling vision", archetype: "visionary", weight: 3 },
      { text: "Leading through expertise and strategic planning", archetype: "strategist", weight: 3 },
      { text: "Leading by example and getting things done", archetype: "creator", weight: 3 },
      { text: "Empowering others and building consensus", archetype: "harmonizer", weight: 3 }
    ]
  }
];

export default function ArchetypeTest({ onComplete, candidateName }) {
  const [selectedQuestions] = useState(() => {
    // Randomly select 10 questions from the pool
    const shuffled = [...ALL_QUESTIONS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = () => {
    if (selectedOption === null) return;
    
    const newAnswers = { ...answers, [currentQuestion]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);
    
    if (currentQuestion < selectedQuestions.length - 1) {
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
      const question = selectedQuestions[questionIndex];
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

  const question = selectedQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / selectedQuestions.length) * 100;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-300 text-sm">
            Question {currentQuestion + 1} of {selectedQuestions.length}
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
          {currentQuestion === selectedQuestions.length - 1 ? 'Complete' : 'Next'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}