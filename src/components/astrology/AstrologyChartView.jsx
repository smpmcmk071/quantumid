import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Star, Orbit } from 'lucide-react';

export default function AstrologyChartView({ personId, personType }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChart();
  }, [personId]);

  const loadChart = async () => {
    setLoading(true);
    try {
      const charts = await base44.entities.AstrologyChart.filter({
        person_id: personId,
        person_type: personType
      });
      if (charts.length > 0) {
        setChart(charts[0]);
      }
    } catch (error) {
      console.error('Error loading chart:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (!chart) {
    return (
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardContent className="py-12 text-center">
          <Orbit className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No astrology chart calculated yet</p>
        </CardContent>
      </Card>
    );
  }

  const aspects = chart.aspects ? JSON.parse(chart.aspects) : [];

  return (
    <div className="space-y-6">
      {/* Chart Info */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Astrology Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Birth Date:</span>
              <span className="text-white ml-2">{chart.birth_date}</span>
            </div>
            <div>
              <span className="text-gray-400">Birth Time:</span>
              <span className="text-white ml-2">{chart.birth_time}</span>
            </div>
            <div>
              <span className="text-gray-400">Location:</span>
              <span className="text-white ml-2">{chart.birth_location}</span>
            </div>
            <div>
              <span className="text-gray-400">House System:</span>
              <span className="text-white ml-2 capitalize">{chart.house_system}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planetary Positions */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Planetary Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Sun', sign: chart.sun_sign, degree: chart.sun_degree, house: chart.sun_house, color: 'text-yellow-400' },
              { name: 'Moon', sign: chart.moon_sign, degree: chart.moon_degree, house: chart.moon_house, color: 'text-blue-300' },
              { name: 'Mercury', sign: chart.mercury_sign, degree: chart.mercury_degree, house: chart.mercury_house, color: 'text-green-400' },
              { name: 'Venus', sign: chart.venus_sign, degree: chart.venus_degree, house: chart.venus_house, color: 'text-pink-400' },
              { name: 'Mars', sign: chart.mars_sign, degree: chart.mars_degree, house: chart.mars_house, color: 'text-red-400' },
              { name: 'Jupiter', sign: chart.jupiter_sign, degree: chart.jupiter_degree, house: chart.jupiter_house, color: 'text-purple-400' },
              { name: 'Saturn', sign: chart.saturn_sign, degree: chart.saturn_degree, house: chart.saturn_house, color: 'text-gray-400' },
              { name: 'Uranus', sign: chart.uranus_sign, degree: chart.uranus_degree, house: chart.uranus_house, color: 'text-cyan-400' },
              { name: 'Neptune', sign: chart.neptune_sign, degree: chart.neptune_degree, house: chart.neptune_house, color: 'text-indigo-400' },
              { name: 'Pluto', sign: chart.pluto_sign, degree: chart.pluto_degree, house: chart.pluto_house, color: 'text-slate-400' },
            ].map(planet => (
              <div key={planet.name} className="p-3 bg-slate-900/50 rounded border border-slate-700">
                <div className={`font-semibold ${planet.color} mb-1`}>{planet.name}</div>
                <div className="text-white text-sm">
                  {planet.sign} {planet.degree}°
                </div>
                <div className="text-gray-400 text-xs">House {planet.house}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Special Points */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Special Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
              <div className="font-semibold text-teal-400 mb-1">Ascendant</div>
              <div className="text-white text-sm">{chart.ascendant_sign} {chart.ascendant_degree}°</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
              <div className="font-semibold text-teal-400 mb-1">Midheaven</div>
              <div className="text-white text-sm">{chart.midheaven_sign} {chart.midheaven_degree}°</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
              <div className="font-semibold text-amber-400 mb-1">North Node</div>
              <div className="text-white text-sm">{chart.north_node_sign} {chart.north_node_degree}°</div>
              <div className="text-gray-400 text-xs">House {chart.north_node_house}</div>
            </div>
            <div className="p-3 bg-slate-900/50 rounded border border-slate-700">
              <div className="font-semibold text-purple-400 mb-1">Chiron</div>
              <div className="text-white text-sm">{chart.chiron_sign} {chart.chiron_degree}°</div>
              <div className="text-gray-400 text-xs">House {chart.chiron_house}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* House Cusps */}
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">House Cusps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(house => (
              <div key={house} className="p-2 bg-slate-900/50 rounded border border-slate-700">
                <div className="text-gray-400 text-xs">House {house}</div>
                <div className="text-white text-sm">
                  {chart[`house_${house}_sign`]} {chart[`house_${house}_degree`]?.toFixed(2)}°
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aspects */}
      {aspects.length > 0 && (
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Major Aspects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {aspects.map((aspect, idx) => (
                <div key={idx} className="p-2 bg-slate-900/50 rounded border border-slate-700 text-sm">
                  <span className="text-white font-semibold">{aspect.planet1}</span>
                  <span className="text-gray-400 mx-2">{aspect.aspect}</span>
                  <span className="text-white font-semibold">{aspect.planet2}</span>
                  <span className="text-gray-500 ml-2">({aspect.angle}° orb: {aspect.orb}°)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}