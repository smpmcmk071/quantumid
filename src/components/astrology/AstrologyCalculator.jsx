import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Calculator } from 'lucide-react';

export default function AstrologyCalculator({ personId, personType, birthDate, onComplete }) {
  const [calculating, setCalculating] = useState(false);
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthLocation, setBirthLocation] = useState('');
  const [houseSystem, setHouseSystem] = useState('placidus');

  const handleCalculate = async () => {
    if (!birthTime || !birthLocation) {
      alert('Please provide birth time and location');
      return;
    }

    setCalculating(true);
    try {
      const response = await base44.functions.invoke('calculateAstrology', {
        personId,
        personType,
        birthDate,
        birthTime,
        birthLocation,
        houseSystem
      });

      if (response.data?.success) {
        alert('Astrology chart calculated successfully!');
        if (onComplete) onComplete();
      } else {
        alert('Failed to calculate chart: ' + (response.data?.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error calculating chart: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Calculator className="w-5 h-5 text-teal-400" />
          Calculate Astrology Chart
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-gray-300 text-sm mb-2 block">Birth Time (24-hour format)</label>
          <Input
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white"
          />
          <p className="text-gray-500 text-xs mt-1">
            Or estimate: Morning (09:00), Midday (13:00), Afternoon (16:00), Evening (19:30), Night (22:30)
          </p>
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 block">Birth Location</label>
          <Input
            placeholder="City, State, Country (e.g., Denver, CO, USA)"
            value={birthLocation}
            onChange={(e) => setBirthLocation(e.target.value)}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>

        <div>
          <label className="text-gray-300 text-sm mb-2 block">House System</label>
          <Select value={houseSystem} onValueChange={setHouseSystem}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placidus">Placidus (Most Popular)</SelectItem>
              <SelectItem value="whole_sign">Whole Sign</SelectItem>
              <SelectItem value="koch">Koch</SelectItem>
              <SelectItem value="equal">Equal House</SelectItem>
              <SelectItem value="vedic">Vedic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleCalculate}
          disabled={calculating || !birthTime || !birthLocation}
          className="w-full bg-teal-600 hover:bg-teal-700"
        >
          {calculating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Calculating Chart...
            </>
          ) : (
            'Calculate Full Chart'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}