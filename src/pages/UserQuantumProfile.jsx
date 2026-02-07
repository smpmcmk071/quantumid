import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Shield, Briefcase, Users, Heart, Download, Key, Lock, RefreshCw, Upload, Check, X, Receipt, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

async function hashSSN(ssn) {
  if (!ssn) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(ssn.replace(/[^0-9]/g, ''));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashDocumentID(idNumber) {
  if (!idNumber) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(idNumber);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function UserQuantumProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [user, setUser] = useState(null);
  const [quantumProfile, setQuantumProfile] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    birth_time: '',
    birth_location: '',
    ssn: '',
    country: '',
    is_foreign_national: false
  });
  
  // Job History
  const [jobs, setJobs] = useState([
    {
      employer: 'TechCorp Solutions',
      position: 'Senior Software Engineer',
      start_date: '2019-01-15',
      end_date: '2024-06-30',
      responsibilities: 'Led development of cloud infrastructure, mentored junior engineers, architected microservices',
      skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL']
    },
    {
      employer: 'Digital Innovations Inc',
      position: 'Full Stack Developer',
      start_date: '2016-03-10',
      end_date: '2018-12-31',
      responsibilities: 'Built web applications, implemented CI/CD pipelines, database optimization',
      skills: ['Python', 'Django', 'Vue.js', 'MySQL', 'Linux']
    }
  ]);
  const [newJob, setNewJob] = useState({
    employer: '', position: '', start_date: '', end_date: '', responsibilities: '', skills: ''
  });

  // Family Data
  const [familyMembers, setFamilyMembers] = useState([
    { name: 'Margaret Maher', relationship: 'Mother', birth_date: '1947-03-22', ssn: '', country: 'USA', is_foreign_national: false },
    { name: 'Paul Maher Sr.', relationship: 'Father', birth_date: '1945-08-15', ssn: '', country: 'USA', is_foreign_national: false },
    { name: 'Lisa Maher', relationship: 'Sister', birth_date: '1972-05-10', ssn: '', country: 'USA', is_foreign_national: false }
  ]);
  const [newMember, setNewMember] = useState({ name: '', relationship: '', birth_date: '', ssn: '', country: '', is_foreign_national: false });

  // Hobbies
  const [hobbies, setHobbies] = useState([]);
  const [newHobby, setNewHobby] = useState({ name: '', category: '', skill_level: '', since_year: '' });

  // Important Dates
  const [importantDates, setImportantDates] = useState([]);
  const [newDate, setNewDate] = useState({ name: '', date: '' });

  // Alternative Documents
  const [alternativeDocuments, setAlternativeDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({ document_type: '', id_number: '', issuing_country: '', expiry_date: '', image_urls: [] });
  const [uploadingDocImages, setUploadingDocImages] = useState({});

  // Tax Data
  const [taxData, setTaxData] = useState([]);
  const [newTaxYear, setNewTaxYear] = useState({
    tax_year: new Date().getFullYear() - 1,
    w2_wages: '',
    income_1099_misc: '',
    income_1099_nec: '',
    income_1099_int: '',
    income_1099_div: '',
    total_income: '',
    adjusted_gross_income: '',
    deductions: '',
    taxable_income: '',
    total_tax: '',
    federal_withheld: '',
    refund_amount: '',
    amount_owed: '',
    filing_status: '',
    num_dependents: '',
    notes: ''
  });
  
  // Resume parsing
  const [parsing, setParsing] = useState(false);
  const [parsedJobs, setParsedJobs] = useState(null);
  const [resumeText, setResumeText] = useState('');

  // Export selections
  const [exportSelections, setExportSelections] = useState({
    quantumID: true,
    jobHistory: true,
    family: true,
    hobbies: true,
    importantDates: true,
    taxData: true
  });
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);

  // Auto-save supplementary data when jobs, family, hobbies, dates, or tax data change
  useEffect(() => {
    if (!quantumProfile) return;

    const saveSupplementaryData = async () => {
      try {
        await base44.entities.QuantumProfile.update(quantumProfile.id, {
          job_history: jobs,
          family_data: { members: familyMembers },
          hobbies: hobbies,
          important_dates: importantDates,
          alternative_documents: alternativeDocuments,
          tax_data: taxData
        });
      } catch (error) {
        console.error('Error auto-saving data:', error);
      }
    };

    saveSupplementaryData();
  }, [jobs, familyMembers, hobbies, importantDates, alternativeDocuments, taxData]);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Load quantum profile if exists
      const quantumProfiles = await base44.entities.QuantumProfile.filter({ user_id: currentUser.id });
      if (quantumProfiles.length > 0) {
        const qp = quantumProfiles[0];
        setQuantumProfile(qp);
        setFormData({
          full_name: qp.full_name || '',
          birth_date: qp.birth_date || '',
          birth_time: qp.birth_time || '',
          birth_location: qp.birth_location || '',
          ssn: qp.ssn || '',
          country: qp.country || '',
          is_foreign_national: qp.is_foreign_national || false
        });
        setJobs(qp.job_history || []);
        setFamilyMembers(qp.family_data?.members || []);
        setHobbies(qp.hobbies || []);
        setImportantDates(Array.isArray(qp.important_dates) ? qp.important_dates : []);
        setAlternativeDocuments(qp.alternative_documents || []);
        setTaxData(qp.tax_data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const calculateProfile = async () => {
    if (!formData.full_name || !formData.birth_date) {
      alert('Please enter full name and birth date');
      return;
    }

    setCalculating(true);
    try {
      const response = await base44.functions.invoke('calculateNumerology', {
        type: 'name',
        name: formData.full_name,
        birthDate: formData.birth_date,
        birthTime: formData.birth_time || 'unknown',
        birthLocation: formData.birth_location || 'unknown'
      });

      if (response.data?.success) {
        const calcData = response.data.data;

        // Start with existing profile data to prevent overwriting
        const profileData = quantumProfile ? { ...quantumProfile } : {};

        // Merge in new calculated data
        Object.assign(profileData, {
          user_id: user.id,
          birth_date: formData.birth_date,
          birth_time: formData.birth_time || 'None',
          birth_location: formData.birth_location || 'None',
          full_name: formData.full_name,
          ssn: formData.ssn || '',
          country: formData.country || '',
          is_foreign_national: formData.is_foreign_national || false,
          sun_sign: calcData.sun_sign || calcData.astrology?.sunSign || 'None',
          moon_sign: calcData.moon_sign || calcData.astrology?.moonSign || 'None',
          rising_sign: calcData.rising_sign || calcData.astrology?.ascendant || 'None',
          houses: calcData.houses || {},
          planets: calcData.planets || {},
          aspects: calcData.aspects || {},
          element: calcData.element || calcData.astrology?.element || 'None',
          dominant_element: calcData.dominant_element || calcData.astrology?.dominantElement || 'None',
          chinese_zodiac: calcData.chinese_zodiac || calcData.astrology?.chineseZodiac || 'None',
          chinese_animal: calcData.chinese_animal || calcData.astrology?.chineseAnimal || 'None',
          chinese_element: calcData.chinese_element || calcData.astrology?.chineseElement || 'None',
          life_path_number: calcData.life_path_number || calcData.lifePath?.reduced || 0,
          expression_number: calcData.expression_number || calcData.expression?.reduced || 0,
          soul_urge_number: calcData.soul_urge_number || calcData.soulUrge?.reduced || 0,
          personality_number: calcData.personality_number || calcData.personality?.reduced || 0,
          birthday_number: calcData.birthday_number || calcData.birthday?.reduced || 0,
          master_numbers: (calcData.masterNumbers || []).join(', ') || 'None',
          karmic_debt: (calcData.karmicDebt?.locations || '') || 'None',
          karmic_lessons: (calcData.karmicLessons?.lessons || []).join(', ') || 'None',
          dominant_polarity: calcData.astrology?.dominantPolarity || 'None',
          preferred_keys: calcData.astrology?.preferredKeys || [],
          preferred_tempos: calcData.astrology?.preferredTempos || [],
          mood_preferences: calcData.astrology?.moodPreferences || {},
          job_history: jobs,
          family_data: { members: familyMembers },
          hobbies: hobbies,
          tax_data: taxData
        });

        if (quantumProfile) {
          const updated = await base44.entities.QuantumProfile.update(quantumProfile.id, profileData);
          setQuantumProfile(updated);
        } else {
          const created = await base44.entities.QuantumProfile.create(profileData);
          setQuantumProfile(created);
        }

        alert('Profile calculated successfully! Now generate your QuantumID.');
      }
    } catch (error) {
      alert('Error calculating profile: ' + error.message);
    } finally {
      setCalculating(false);
    }
  };
  
  const generateQuantumID = async () => {
    if (!quantumProfile?.planets || !quantumProfile?.life_path_number) {
      alert('Please calculate your profile first before generating QuantumID');
      return;
    }
    
    setGenerating(true);
    try {
      const response = await base44.functions.invoke('generateQuantumID', {
        userProfileId: quantumProfile.id,
        planets: quantumProfile.planets,
        lifePathNumber: quantumProfile.life_path_number,
        birthDate: quantumProfile.birth_date,
        fullName: quantumProfile.full_name,
        ssn: quantumProfile.ssn,
        country: quantumProfile.country,
        is_foreign_national: quantumProfile.is_foreign_national
      });
      
      if (response.data?.success) {
        const qData = response.data;
        
        // Update quantum profile with ID data
        const updated = await base44.entities.QuantumProfile.update(quantumProfile.id, {
          quantum_id: qData.quantumID,
          planetary_codes: qData.planetaryCodes,
          protection_hash: qData.protectionHash,
          short_code_report: qData.shortCodeReport,
          blockchain_ready: true,
          export_data: {
            ...qData.exportData,
            hashedSsn: qData.hashedSsn,
            country: qData.country,
            isForeignNational: qData.isForeignNational
          }
        });
        
        setQuantumProfile(updated);
        alert('QuantumID generated successfully!');
      }
    } catch (error) {
      alert('Error generating QuantumID: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };
  
  const saveProfile = async () => {
    setSaving(true);
    try {
      let profileToUpdate = quantumProfile;
      
      // If no profile exists, create a minimal one
      if (!profileToUpdate) {
        const minimal = {
          user_id: user.id,
          full_name: formData.full_name || user.full_name || 'User',
          birth_date: formData.birth_date || '1970-01-01'
        };
        profileToUpdate = await base44.entities.QuantumProfile.create(minimal);
        setQuantumProfile(profileToUpdate);
      }

      // Update with supplementary data
      const updateData = {
        job_history: jobs,
        family_data: { members: familyMembers },
        hobbies: hobbies,
        important_dates: importantDates,
        tax_data: taxData
      };
      const updated = await base44.entities.QuantumProfile.update(profileToUpdate.id, updateData);
      setQuantumProfile(updated);
      alert('Data saved successfully!');
    } catch (error) {
      alert('Error saving: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

          const handleParseResumeText = async () => {
            if (!resumeText.trim()) {
              alert('Please paste your resume text');
              return;
            }

            setParsing(true);
            try {
              const response = await base44.functions.invoke('parseResume', { resume_text: resumeText });

              if (response.data?.success) {
                const parsed = response.data.data;
                setParsedJobs({
                  skills: parsed.skills || [],
                  education: parsed.education || [],
                  years_exp: parsed.years_experience || 0,
                  jobs: parsed.job_history || []
                });
              } else {
                alert('Error parsing resume: ' + response.data?.error);
              }
            } catch (error) {
              alert('Error parsing resume: ' + error.message);
            } finally {
              setParsing(false);
            }
          };

          const confirmParsedData = () => {
            if (parsedJobs?.jobs && parsedJobs.jobs.length > 0) {
              setJobs([...jobs, ...parsedJobs.jobs]);
            }
            setParsedJobs(null);
          };
  
  const addJob = () => {
    if (!newJob.employer || !newJob.position) {
      alert('Employer and position are required');
      return;
    }
    setJobs([...jobs, { ...newJob, skills: newJob.skills.split(',').map(s => s.trim()) }]);
    setNewJob({ employer: '', position: '', start_date: '', end_date: '', responsibilities: '', skills: '' });
  };
  
  const addFamilyMember = async () => {
    if (!newMember.name || !newMember.relationship) {
      alert('Name and relationship are required');
      return;
    }
    const hashedSsn = newMember.ssn ? await hashSSN(newMember.ssn) : '';
    const memberWithHashedSsn = { ...newMember, ssn: hashedSsn };
    setFamilyMembers([...familyMembers, memberWithHashedSsn]);
    setNewMember({ name: '', relationship: '', birth_date: '', ssn: '', country: '', is_foreign_national: false });
  };
  
  const addHobby = () => {
    if (!newHobby.name) {
      alert('Hobby name is required');
      return;
    }
    setHobbies([...hobbies, { ...newHobby, since_year: parseInt(newHobby.since_year) || new Date().getFullYear() }]);
    setNewHobby({ name: '', category: '', skill_level: '', since_year: '' });
  };

  const addImportantDate = () => {
    if (!newDate.name || !newDate.date) {
      alert('Event name and date are required');
      return;
    }
    setImportantDates([...importantDates, newDate]);
    setNewDate({ name: '', date: '' });
  };

  const addAlternativeDocument = async () => {
    if (!newDocument.document_type || !newDocument.id_number) {
      alert('Document type and ID number are required');
      return;
    }
    const hashedIdNumber = await hashDocumentID(newDocument.id_number);
    const docWithHashedId = { ...newDocument, id_number: hashedIdNumber };
    setAlternativeDocuments([...alternativeDocuments, docWithHashedId]);
    setNewDocument({ document_type: '', id_number: '', issuing_country: '', expiry_date: '', image_urls: [] });
  };

  const handleDocumentImageUpload = async (e, docIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocImages({ ...uploadingDocImages, [docIndex]: true });
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const newDocs = [...alternativeDocuments];
      newDocs[docIndex].image_urls = [...(newDocs[docIndex].image_urls || []), response.file_url];
      setAlternativeDocuments(newDocs);
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploadingDocImages({ ...uploadingDocImages, [docIndex]: false });
    }
  };

  const removeDocumentImage = (docIndex, imgIndex) => {
    const newDocs = [...alternativeDocuments];
    newDocs[docIndex].image_urls.splice(imgIndex, 1);
    setAlternativeDocuments(newDocs);
  };
  
  const addTaxYear = () => {
    if (!newTaxYear.tax_year) {
      alert('Tax year is required');
      return;
    }
    const taxYearData = {
      ...newTaxYear,
      tax_year: parseInt(newTaxYear.tax_year),
      w2_wages: parseFloat(newTaxYear.w2_wages) || 0,
      income_1099_misc: parseFloat(newTaxYear.income_1099_misc) || 0,
      income_1099_nec: parseFloat(newTaxYear.income_1099_nec) || 0,
      income_1099_int: parseFloat(newTaxYear.income_1099_int) || 0,
      income_1099_div: parseFloat(newTaxYear.income_1099_div) || 0,
      total_income: parseFloat(newTaxYear.total_income) || 0,
      adjusted_gross_income: parseFloat(newTaxYear.adjusted_gross_income) || 0,
      deductions: parseFloat(newTaxYear.deductions) || 0,
      taxable_income: parseFloat(newTaxYear.taxable_income) || 0,
      total_tax: parseFloat(newTaxYear.total_tax) || 0,
      federal_withheld: parseFloat(newTaxYear.federal_withheld) || 0,
      refund_amount: parseFloat(newTaxYear.refund_amount) || 0,
      amount_owed: parseFloat(newTaxYear.amount_owed) || 0,
      num_dependents: parseInt(newTaxYear.num_dependents) || 0
    };
    setTaxData([...taxData, taxYearData]);
    setNewTaxYear({
      tax_year: new Date().getFullYear() - 1,
      w2_wages: '', income_1099_misc: '', income_1099_nec: '', income_1099_int: '', income_1099_div: '',
      total_income: '', adjusted_gross_income: '', deductions: '', taxable_income: '', total_tax: '',
      federal_withheld: '', refund_amount: '', amount_owed: '', filing_status: '', num_dependents: '', notes: ''
    });
  };
  
  const downloadReport = () => {
    if (!quantumProfile) return;

    const report = {};

    if (exportSelections.quantumID) {
      report.quantumID = {
        quantumID: quantumProfile.quantum_id,
        shortCodes: quantumProfile.short_code_report,
        planetaryCodes: quantumProfile.planetary_codes,
        lifePathNumber: quantumProfile.life_path_number,
        protectionHash: quantumProfile.protection_hash,
        country: quantumProfile.export_data?.country,
        isForeignNational: quantumProfile.export_data?.isForeignNational,
        hashedSsn: quantumProfile.export_data?.hashedSsn,
        blockchainExportData: quantumProfile.export_data,
        generatedAt: new Date().toISOString()
      };
    }

    if (exportSelections.jobHistory && jobs.length > 0) {
      report.jobHistory = jobs;
    }

    if (exportSelections.family && familyMembers.length > 0) {
      report.family = familyMembers;
    }

    if (exportSelections.hobbies && hobbies.length > 0) {
      report.hobbies = hobbies;
    }

    if (exportSelections.importantDates && importantDates.length > 0) {
      report.importantDates = importantDates;
    }

    if (exportSelections.taxData && taxData.length > 0) {
      report.taxData = taxData;
    }

    if (alternativeDocuments.length > 0) {
      report.alternativeDocuments = alternativeDocuments;
    }

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quantum-profile-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {quantumProfile?.quantum_id && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-300 font-semibold">QuantumID Generated</p>
              <p className="text-green-200 text-sm">Your self-sovereign identity has been created and is blockchain-ready</p>
            </div>
          </div>
        )}

        {showExportOptions && (
          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Select Data to Export</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSelections.quantumID}
                  onChange={(e) => setExportSelections({...exportSelections, quantumID: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-purple-200">QuantumID & Hashes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSelections.jobHistory}
                  onChange={(e) => setExportSelections({...exportSelections, jobHistory: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-purple-200">Job History</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSelections.family}
                  onChange={(e) => setExportSelections({...exportSelections, family: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-purple-200">Family Data</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSelections.hobbies}
                  onChange={(e) => setExportSelections({...exportSelections, hobbies: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-purple-200">Hobbies</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSelections.importantDates}
                  onChange={(e) => setExportSelections({...exportSelections, importantDates: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-purple-200">Important Dates</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportSelections.taxData}
                  onChange={(e) => setExportSelections({...exportSelections, taxData: e.target.checked})}
                  className="w-4 h-4"
                />
                <span className="text-purple-200">Tax Data</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={true}
                  disabled
                  className="w-4 h-4"
                />
                <span className="text-purple-200">Alternative Documents</span>
              </label>
            </div>
            <div className="flex gap-3">
              <Button onClick={downloadReport} className="bg-gradient-to-r from-cyan-600 to-purple-600">
                <Download className="w-4 h-4 mr-2" />
                Download Export
              </Button>
              <Button onClick={() => setShowExportOptions(false)} variant="outline" className="border-purple-500/30 text-purple-200">
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-cyan-400" />
              Quantum Profile
            </h1>
            <p className="text-purple-200 mt-2">Self-sovereign identity with blockchain-ready export</p>
          </div>
          
          {quantumProfile?.quantum_id && (
            <Button onClick={() => setShowExportOptions(!showExportOptions)} variant="outline" className="border-cyan-500/30 text-cyan-300">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          )}
        </div>
        
        {/* Profile Setup Section */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-purple-300 text-sm">Full Name</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="Enter your full name"
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">Birth Date</label>
                <Input
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">Birth Time (optional)</label>
                <Input
                  value={formData.birth_time}
                  onChange={(e) => setFormData({...formData, birth_time: e.target.value})}
                  placeholder="e.g., 14:30 or morning"
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">Birth Location (optional)</label>
                <Input
                  value={formData.birth_location}
                  onChange={(e) => setFormData({...formData, birth_location: e.target.value})}
                  placeholder="City, Country"
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">SSN / National ID</label>
                <Input
                  value={formData.ssn}
                  onChange={(e) => setFormData({...formData, ssn: e.target.value})}
                  placeholder="Protected - used in hash"
                  type="password"
                  className="bg-slate-800 border-purple-500/30 text-white mt-2"
                />
              </div>
              <div>
                <label className="text-purple-300 text-sm">Country</label>
                <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                  <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white mt-2">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Mexico">Mexico</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                    <SelectItem value="France">France</SelectItem>
                    <SelectItem value="Germany">Germany</SelectItem>
                    <SelectItem value="Italy">Italy</SelectItem>
                    <SelectItem value="Japan">Japan</SelectItem>
                    <SelectItem value="Australia">Australia</SelectItem>
                    <SelectItem value="Brazil">Brazil</SelectItem>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="China">China</SelectItem>
                    <SelectItem value="Spain">Spain</SelectItem>
                    <SelectItem value="Netherlands">Netherlands</SelectItem>
                    <SelectItem value="Switzerland">Switzerland</SelectItem>
                    <SelectItem value="Sweden">Sweden</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <input
                  type="checkbox"
                  checked={formData.is_foreign_national}
                  onChange={(e) => setFormData({...formData, is_foreign_national: e.target.checked})}
                  className="w-4 h-4"
                />
                <label className="text-purple-300 text-sm">Foreign National</label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={calculateProfile}
                disabled={calculating}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {calculating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Calculate Profile
              </Button>
              
              {quantumProfile?.planets && (
                <div className="text-green-400 flex items-center gap-2">
                  ✓ Profile calculated
                </div>
              )}
            </div>
            
            {quantumProfile && (
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-purple-300 text-xs">Life Path</p>
                  <p className="text-white font-bold text-xl">{quantumProfile.life_path_number || 'None'}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-purple-300 text-xs">Sun Sign</p>
                  <p className="text-white font-bold">{quantumProfile.sun_sign || 'None'}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg">
                  <p className="text-purple-300 text-xs">Moon Sign</p>
                  <p className="text-white font-bold">{quantumProfile.moon_sign || 'None'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* QuantumID Display */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-cyan-400" />
              QuantumID Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quantumProfile?.quantum_id ? (
              <div className="space-y-4">
                <div>
                  <label className="text-purple-300 text-sm">Your QuantumID (SHA-256)</label>
                  <div className="bg-slate-800 p-3 rounded-lg mt-2 font-mono text-xs text-cyan-300 break-all">
                    {quantumProfile.quantum_id}
                  </div>
                </div>
                
                <div>
                  <label className="text-purple-300 text-sm">Protection Hash</label>
                  <div className="bg-slate-800 p-3 rounded-lg mt-2 font-mono text-xs text-green-300 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    {quantumProfile.protection_hash?.substring(0, 32)}...
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-purple-300 text-sm">Life Path Number</label>
                    <div className="bg-slate-800 p-3 rounded-lg mt-2 text-white">
                      {quantumProfile.life_path_number}
                    </div>
                  </div>
                  <div>
                    <label className="text-purple-300 text-sm">Blockchain Ready</label>
                    <div className="bg-slate-800 p-3 rounded-lg mt-2 text-white">
                      {quantumProfile.blockchain_ready ? '✅ Yes' : '❌ No'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-purple-200 mb-4">
                  {quantumProfile?.planets ? 'Profile calculated - ready to generate QuantumID' : 'Calculate your profile first'}
                </p>
                <Button
                  onClick={generateQuantumID}
                  disabled={generating || !quantumProfile?.planets || quantumProfile?.quantum_id}
                  className="bg-gradient-to-r from-cyan-600 to-purple-600"
                >
                  {generating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  {quantumProfile?.quantum_id ? 'QuantumID Already Generated' : 'Generate QuantumID'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Data Capture Tabs */}
        <Card className="bg-slate-900/50 backdrop-blur-sm border-purple-500/30">
          <CardContent className="pt-6">
            <Tabs defaultValue="jobs" className="w-full">
              <TabsList className="grid w-full grid-cols-7 bg-slate-800 overflow-x-auto">
                <TabsTrigger value="jobs" className="data-[state=active]:bg-purple-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Jobs
                </TabsTrigger>
                <TabsTrigger value="family" className="data-[state=active]:bg-purple-600">
                  <Users className="w-4 h-4 mr-2" />
                  Family
                </TabsTrigger>
                <TabsTrigger value="hobbies" className="data-[state=active]:bg-purple-600">
                      <Heart className="w-4 h-4 mr-2" />
                      Hobbies
                    </TabsTrigger>
                    <TabsTrigger value="dates" className="data-[state=active]:bg-purple-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Important Dates
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="data-[state=active]:bg-purple-600">
                      <Shield className="w-4 h-4 mr-2" />
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="tax" className="data-[state=active]:bg-purple-600">
                      <Receipt className="w-4 h-4 mr-2" />
                      Tax Data
                    </TabsTrigger>
                    <TabsTrigger value="astrology" className="data-[state=active]:bg-purple-600">
                      <Shield className="w-4 h-4 mr-2" />
                      Astrology
                    </TabsTrigger>
              </TabsList>
              
              {/* Jobs Tab */}
              <TabsContent value="jobs" className="space-y-4">
                {/* Resume Paste */}
                  <div className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                    <label className="text-purple-300 text-sm font-semibold mb-3 block">
                      Quick Import: Paste Resume Text
                    </label>
                    <Textarea
                      placeholder="Paste your resume content here..."
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      disabled={parsing}
                      className="bg-slate-700 border-purple-500/30 text-white min-h-40"
                    />
                    <Button
                      onClick={handleParseResumeText}
                      disabled={parsing || !resumeText.trim()}
                      className="mt-3 bg-purple-600 hover:bg-purple-700 w-full"
                    >
                      {parsing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Parse Resume
                        </>
                      )}
                    </Button>
                  </div>

                {/* Parsed Data Confirmation */}
                {parsedJobs && (
                  <div className="bg-cyan-900/30 border border-cyan-500/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-cyan-300 font-semibold">Parsed Resume Data</h4>
                      <button
                        onClick={() => setParsedJobs(null)}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {parsedJobs.education && parsedJobs.education.length > 0 && (
                      <div>
                        <p className="text-purple-300 text-xs">Education</p>
                        <div className="space-y-1">
                          {parsedJobs.education.map((edu, i) => (
                            <p key={i} className="text-cyan-200 text-sm">
                              {edu.degree} {edu.major && `in ${edu.major}`} - {edu.school} {edu.graduation_year && `(${edu.graduation_year})`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {parsedJobs.years_exp && (
                      <div>
                        <p className="text-purple-300 text-xs">Years of Experience</p>
                        <p className="text-cyan-200">{parsedJobs.years_exp}+</p>
                      </div>
                    )}

                    {parsedJobs.skills && (
                      <div>
                        <p className="text-purple-300 text-xs">Skills</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {parsedJobs.skills.map((skill, i) => (
                            <span key={i} className="bg-purple-600/30 px-2 py-1 rounded text-xs text-cyan-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {parsedJobs.jobs && parsedJobs.jobs.length > 0 && (
                          <div>
                            <p className="text-purple-300 text-xs">Job History</p>
                            <div className="space-y-2 mt-2">
                              {parsedJobs.jobs.map((job, i) => (
                                <div key={i} className="text-cyan-200 text-sm bg-slate-700 p-2 rounded">
                                  <p className="font-semibold">{job.position} at {job.employer}</p>
                                  <p className="text-xs text-purple-300">{job.start_date} - {job.end_date}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={confirmParsedData}
                        className="bg-green-600 hover:bg-green-700 flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Add to Jobs
                      </Button>
                      <Button
                        onClick={() => setParsedJobs(null)}
                        variant="outline"
                        className="border-purple-500/30 text-purple-200 flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Dismiss
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Employer"
                    value={newJob.employer}
                    onChange={(e) => setNewJob({...newJob, employer: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="Position"
                    value={newJob.position}
                    onChange={(e) => setNewJob({...newJob, position: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={newJob.start_date}
                    onChange={(e) => setNewJob({...newJob, start_date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={newJob.end_date}
                    onChange={(e) => setNewJob({...newJob, end_date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <Textarea
                  placeholder="Responsibilities"
                  value={newJob.responsibilities}
                  onChange={(e) => setNewJob({...newJob, responsibilities: e.target.value})}
                  className="bg-slate-800 border-purple-500/30 text-white"
                />
                <Input
                  placeholder="Skills (comma-separated)"
                  value={newJob.skills}
                  onChange={(e) => setNewJob({...newJob, skills: e.target.value})}
                  className="bg-slate-800 border-purple-500/30 text-white"
                />
                <Button onClick={addJob} className="bg-purple-600 hover:bg-purple-700">
                  Add Job
                </Button>
                
                <div className="space-y-2 mt-4">
                  {jobs.map((job, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20 flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{job.position} at {job.employer}</h4>
                        <p className="text-purple-300 text-sm">{job.start_date} - {job.end_date || 'Present'}</p>
                        {job.skills && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {job.skills.map((skill, i) => (
                              <span key={i} className="bg-purple-600/30 px-2 py-1 rounded text-xs text-purple-200">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setJobs(jobs.filter((_, i) => i !== idx))}
                        className="text-red-400 hover:text-red-300 ml-4"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Family Tab */}
              <TabsContent value="family" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="Relationship"
                    value={newMember.relationship}
                    onChange={(e) => setNewMember({...newMember, relationship: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="date"
                    placeholder="Birth Date"
                    value={newMember.birth_date}
                    onChange={(e) => setNewMember({...newMember, birth_date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="SSN / National ID"
                    value={newMember.ssn}
                    onChange={(e) => setNewMember({...newMember, ssn: e.target.value})}
                    type="password"
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Select value={newMember.country} onValueChange={(value) => setNewMember({...newMember, country: value})}>
                    <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Switzerland">Switzerland</SelectItem>
                      <SelectItem value="Sweden">Sweden</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newMember.is_foreign_national}
                      onChange={(e) => setNewMember({...newMember, is_foreign_national: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <label className="text-purple-300 text-sm">Foreign National</label>
                  </div>
                </div>
                <Button onClick={addFamilyMember} className="bg-purple-600 hover:bg-purple-700">
                  Add Family Member
                </Button>
                
                <div className="space-y-2 mt-4">
                  {familyMembers.map((member, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{member.name}</h4>
                          <p className="text-purple-300 text-sm">{member.relationship} • {member.birth_date}</p>
                          <p className="text-purple-300 text-xs mt-1">
                            {member.country || 'No country'} {member.is_foreign_national && '• Foreign National'}
                          </p>
                          {member.ssn && (
                            <p className="text-purple-400 text-xs mt-1 font-mono">SSN: {member.ssn.substring(0, 16)}...</p>
                          )}
                        </div>
                        <button
                          onClick={() => setFamilyMembers(familyMembers.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Hobbies Tab */}
              <TabsContent value="hobbies" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Hobby Name"
                    value={newHobby.name}
                    onChange={(e) => setNewHobby({...newHobby, name: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Select value={newHobby.category} onValueChange={(value) => setNewHobby({...newHobby, category: value})}>
                    <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Music">Music</SelectItem>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Creative">Creative</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                      <SelectItem value="Gaming">Gaming</SelectItem>
                      <SelectItem value="Reading">Reading</SelectItem>
                      <SelectItem value="Cooking">Cooking</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Fitness">Fitness</SelectItem>
                      <SelectItem value="Collectibles">Collectibles</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={newHobby.skill_level} onValueChange={(value) => setNewHobby({...newHobby, skill_level: value})}>
                    <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                      <SelectValue placeholder="Skill Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Since Year"
                    value={newHobby.since_year}
                    onChange={(e) => setNewHobby({...newHobby, since_year: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <Button onClick={addHobby} className="bg-purple-600 hover:bg-purple-700">
                  Add Hobby
                </Button>
                
                <div className="space-y-2 mt-4">
                  {hobbies.map((hobby, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-semibold">{hobby.name}</h4>
                          <p className="text-purple-300 text-sm">
                            {hobby.category} • {hobby.skill_level} • Since {hobby.since_year}
                          </p>
                        </div>
                        <button
                          onClick={() => setHobbies(hobbies.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Important Dates Tab */}
              <TabsContent value="dates" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newDate.name} onValueChange={(value) => setNewDate({...newDate, name: value})}>
                    <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Graduation">Graduation</SelectItem>
                      <SelectItem value="Wedding">Wedding</SelectItem>
                      <SelectItem value="Birth">Birth</SelectItem>
                      <SelectItem value="Job Start">Job Start</SelectItem>
                      <SelectItem value="Job End">Job End</SelectItem>
                      <SelectItem value="Promotion">Promotion</SelectItem>
                      <SelectItem value="Business Launch">Business Launch</SelectItem>
                      <SelectItem value="Relocation">Relocation</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Achievement">Achievement</SelectItem>
                      <SelectItem value="Breakup">Breakup</SelectItem>
                      <SelectItem value="Recovery">Recovery</SelectItem>
                      <SelectItem value="Custom">Custom Event</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    placeholder="Date"
                    value={newDate.date}
                    onChange={(e) => setNewDate({...newDate, date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <Button onClick={addImportantDate} className="bg-purple-600 hover:bg-purple-700">
                  Add Important Date
                </Button>
                
                <div className="space-y-2 mt-4">
                  {importantDates.map((item, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-semibold">{item.name}</h4>
                          <p className="text-purple-300 text-sm">{item.date}</p>
                        </div>
                        <button
                          onClick={() => setImportantDates(importantDates.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              {/* Alternative Documents Tab */}
              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select value={newDocument.document_type} onValueChange={(value) => setNewDocument({...newDocument, document_type: value})}>
                    <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                      <SelectValue placeholder="Document Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Driver's License">Driver's License</SelectItem>
                      <SelectItem value="Passport">Passport</SelectItem>
                      <SelectItem value="National ID Card">National ID Card</SelectItem>
                      <SelectItem value="Travel Document">Travel Document</SelectItem>
                      <SelectItem value="Visa">Visa</SelectItem>
                      <SelectItem value="Work Permit">Work Permit</SelectItem>
                      <SelectItem value="Residency Card">Residency Card</SelectItem>
                      <SelectItem value="Birth Certificate">Birth Certificate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="ID Number"
                    value={newDocument.id_number}
                    onChange={(e) => setNewDocument({...newDocument, id_number: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Select value={newDocument.issuing_country} onValueChange={(value) => setNewDocument({...newDocument, issuing_country: value})}>
                    <SelectTrigger className="bg-slate-800 border-purple-500/30 text-white">
                      <SelectValue placeholder="Issuing Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="Italy">Italy</SelectItem>
                      <SelectItem value="Japan">Japan</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="China">China</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                      <SelectItem value="Netherlands">Netherlands</SelectItem>
                      <SelectItem value="Switzerland">Switzerland</SelectItem>
                      <SelectItem value="Sweden">Sweden</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    placeholder="Expiry Date"
                    value={newDocument.expiry_date}
                    onChange={(e) => setNewDocument({...newDocument, expiry_date: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  </div>
                  <div className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                  <label className="text-purple-300 text-sm block mb-2">Upload Document Images (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadingDocImages({ temp: true });
                        base44.integrations.Core.UploadFile({ file }).then(res => {
                          setNewDocument({...newDocument, image_urls: [...(newDocument.image_urls || []), res.file_url]});
                          setUploadingDocImages({ temp: false });
                        }).catch(err => {
                          alert('Error uploading: ' + err.message);
                          setUploadingDocImages({ temp: false });
                        });
                      }
                    }}
                    disabled={uploadingDocImages.temp}
                    className="text-sm text-purple-300"
                  />
                  {newDocument.image_urls && newDocument.image_urls.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {newDocument.image_urls.map((url, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                          <img src={url} alt="doc" className="h-12 w-12 object-cover rounded" />
                          <button
                            onClick={() => setNewDocument({...newDocument, image_urls: newDocument.image_urls.filter((_, i) => i !== idx)})}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                  <Button onClick={addAlternativeDocument} className="bg-purple-600 hover:bg-purple-700">
                  Add Document
                  </Button>

                <div className="space-y-2 mt-4">
                  {alternativeDocuments.map((doc, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{doc.document_type}</h4>
                          <p className="text-purple-400 text-sm font-mono">Hash: {doc.id_number.substring(0, 16)}...</p>
                          <p className="text-purple-300 text-sm">{doc.issuing_country} • Expires: {doc.expiry_date || 'No expiry'}</p>

                          {doc.image_urls && doc.image_urls.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {doc.image_urls.map((imgUrl, imgIdx) => (
                                <div key={imgIdx} className="flex items-center gap-2">
                                  <img src={imgUrl} alt={`${doc.document_type}-${imgIdx}`} className="h-20 w-auto rounded border border-purple-500/30" />
                                  <button
                                    onClick={() => removeDocumentImage(idx, imgIdx)}
                                    className="text-red-400 hover:text-red-300 text-sm"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="mt-3">
                            <label className="text-purple-300 text-xs block mb-1">Add More Images</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleDocumentImageUpload(e, idx)}
                              disabled={uploadingDocImages[idx]}
                              className="text-xs text-purple-300"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => setAlternativeDocuments(alternativeDocuments.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Tax Data Tab */}
              <TabsContent value="tax" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Tax Year (e.g., 2024)"
                    value={newTaxYear.tax_year}
                    onChange={(e) => setNewTaxYear({...newTaxYear, tax_year: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    placeholder="Filing Status"
                    value={newTaxYear.filing_status}
                    onChange={(e) => setNewTaxYear({...newTaxYear, filing_status: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="W-2 Wages"
                    value={newTaxYear.w2_wages}
                    onChange={(e) => setNewTaxYear({...newTaxYear, w2_wages: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="1099-MISC Income"
                    value={newTaxYear.income_1099_misc}
                    onChange={(e) => setNewTaxYear({...newTaxYear, income_1099_misc: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="1099-NEC Income"
                    value={newTaxYear.income_1099_nec}
                    onChange={(e) => setNewTaxYear({...newTaxYear, income_1099_nec: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="1099-INT Interest"
                    value={newTaxYear.income_1099_int}
                    onChange={(e) => setNewTaxYear({...newTaxYear, income_1099_int: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="1099-DIV Dividends"
                    value={newTaxYear.income_1099_div}
                    onChange={(e) => setNewTaxYear({...newTaxYear, income_1099_div: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Total Income (Line 9)"
                    value={newTaxYear.total_income}
                    onChange={(e) => setNewTaxYear({...newTaxYear, total_income: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="AGI (Line 11)"
                    value={newTaxYear.adjusted_gross_income}
                    onChange={(e) => setNewTaxYear({...newTaxYear, adjusted_gross_income: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Deductions (Line 12)"
                    value={newTaxYear.deductions}
                    onChange={(e) => setNewTaxYear({...newTaxYear, deductions: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Taxable Income (Line 15)"
                    value={newTaxYear.taxable_income}
                    onChange={(e) => setNewTaxYear({...newTaxYear, taxable_income: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Total Tax (Line 24)"
                    value={newTaxYear.total_tax}
                    onChange={(e) => setNewTaxYear({...newTaxYear, total_tax: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Federal Withheld"
                    value={newTaxYear.federal_withheld}
                    onChange={(e) => setNewTaxYear({...newTaxYear, federal_withheld: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Refund Amount"
                    value={newTaxYear.refund_amount}
                    onChange={(e) => setNewTaxYear({...newTaxYear, refund_amount: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Amount Owed"
                    value={newTaxYear.amount_owed}
                    onChange={(e) => setNewTaxYear({...newTaxYear, amount_owed: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Number of Dependents"
                    value={newTaxYear.num_dependents}
                    onChange={(e) => setNewTaxYear({...newTaxYear, num_dependents: e.target.value})}
                    className="bg-slate-800 border-purple-500/30 text-white"
                  />
                </div>
                <Textarea
                  placeholder="Notes (e.g., special deductions, reminders)"
                  value={newTaxYear.notes}
                  onChange={(e) => setNewTaxYear({...newTaxYear, notes: e.target.value})}
                  className="bg-slate-800 border-purple-500/30 text-white"
                />
                <Button onClick={addTaxYear} className="bg-purple-600 hover:bg-purple-700">
                  Add Tax Year
                </Button>
                
                <div className="space-y-2 mt-4">
                  {taxData.sort((a, b) => b.tax_year - a.tax_year).map((tax, idx) => (
                    <div key={idx} className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-white font-semibold text-lg">Tax Year {tax.tax_year}</h4>
                        <button
                          onClick={() => setTaxData(taxData.filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-purple-300">Filing Status:</span>
                          <span className="text-white ml-2">{tax.filing_status || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Dependents:</span>
                          <span className="text-white ml-2">{tax.num_dependents || 0}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">W-2 Wages:</span>
                          <span className="text-white ml-2">${tax.w2_wages?.toLocaleString() || 0}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">AGI (Line 11):</span>
                          <span className="text-white ml-2">${tax.adjusted_gross_income?.toLocaleString() || 0}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Total Tax (Line 24):</span>
                          <span className="text-white ml-2">${tax.total_tax?.toLocaleString() || 0}</span>
                        </div>
                        <div>
                          <span className="text-purple-300">Federal Withheld:</span>
                          <span className="text-white ml-2">${tax.federal_withheld?.toLocaleString() || 0}</span>
                        </div>
                        {tax.refund_amount > 0 && (
                          <div>
                            <span className="text-purple-300">Refund:</span>
                            <span className="text-green-400 ml-2">${tax.refund_amount?.toLocaleString()}</span>
                          </div>
                        )}
                        {tax.amount_owed > 0 && (
                          <div>
                            <span className="text-purple-300">Amount Owed:</span>
                            <span className="text-red-400 ml-2">${tax.amount_owed?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      {tax.notes && (
                        <div className="mt-2 text-sm">
                          <span className="text-purple-300">Notes:</span>
                          <p className="text-gray-300 mt-1">{tax.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Astrology Tab */}
              <TabsContent value="astrology" className="space-y-4">
                {quantumProfile && (
                  <div className="space-y-6">
                    {/* Planets */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-white font-semibold mb-4">Planets</h4>
                      {quantumProfile.planets && Object.keys(quantumProfile.planets).length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(quantumProfile.planets).map(([planet, data]) => (
                            <div key={planet} className="bg-slate-700 p-3 rounded">
                              <p className="text-purple-300 text-sm">{planet}</p>
                              <p className="text-white">{data.sign || 'N/A'} {data.degree || 'N/A'}°</p>
                              {data.house && <p className="text-purple-200 text-xs">House {data.house}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-purple-300">Calculate your profile to populate planets data</p>
                      )}
                    </div>

                    {/* Houses */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-white font-semibold mb-4">12 Houses</h4>
                      {quantumProfile.houses && Object.keys(quantumProfile.houses).length > 0 ? (
                        <div className="grid grid-cols-3 gap-3">
                          {Array.from({ length: 12 }, (_, i) => {
                            const house = quantumProfile.houses[`house_${i + 1}`] || quantumProfile.houses[i + 1];
                            return (
                              <div key={i} className="bg-slate-700 p-3 rounded text-center">
                                <p className="text-purple-300 text-xs">House {i + 1}</p>
                                <p className="text-white text-sm">{house?.sign || 'N/A'}</p>
                                {house?.degree && <p className="text-purple-200 text-xs">{house.degree}°</p>}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-purple-300">Calculate your profile to populate houses data</p>
                      )}
                    </div>

                    {/* Aspects */}
                    <div className="bg-slate-800 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="text-white font-semibold mb-4">Aspects</h4>
                      {quantumProfile.aspects && Object.keys(quantumProfile.aspects).length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {Object.entries(quantumProfile.aspects).map(([key, aspect]) => (
                            <div key={key} className="bg-slate-700 p-2 rounded text-sm">
                              <p className="text-white">{aspect.planet1 || key} {aspect.type || ''}</p>
                              <p className="text-purple-300 text-xs">{aspect.planet2 || ''} {aspect.orb ? `(Orb: ${aspect.orb}°)` : ''}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-purple-300">Calculate your profile to populate aspects data</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-700 p-4 rounded">
                        <p className="text-purple-300 text-sm">Element</p>
                        <p className="text-white font-semibold">{quantumProfile.element || 'N/A'}</p>
                      </div>
                      <div className="bg-slate-700 p-4 rounded">
                        <p className="text-purple-300 text-sm">Dominant Polarity</p>
                        <p className="text-white font-semibold capitalize">{quantumProfile.dominant_polarity || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-purple-300 text-center py-8">Create a profile first to view astrology data</p>
                )}
              </TabsContent>
              </Tabs>

              <div className="mt-6 flex justify-end">
              <Button
                onClick={saveProfile}
                disabled={saving || !quantumProfile}
                className="bg-gradient-to-r from-cyan-600 to-purple-600"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Save All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}