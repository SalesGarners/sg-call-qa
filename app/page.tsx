'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import StepIndicator from '@/components/StepIndicator';
import Step1_Upload from '@/components/Step1_Upload';
import Step2_Processing from '@/components/Step2_Processing';
import Step3_Results from '@/components/Step3_Results';
import { AIProvider, AnalysisResult, ProcessingState } from '@/types';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('groq');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [manualTranscript, setManualTranscript] = useState('');
  const [useManualTranscript, setUseManualTranscript] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [leadData, setLeadData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+1',
    category: 'Other',
    employeeCount: '',
    jobTitle: '',
  });
  const [processingState, setProcessingState] = useState<ProcessingState>({
    type: '',
    progress: 0,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentLeadIdRef = useRef<string | null>(null);

  const handleCancelProcessing = async () => {
    // 1. Abort any ongoing network requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Delete the created lead if it exists
    const idToDelete = currentLeadIdRef.current;
    if (idToDelete) {
      try {
        await axios.delete(`/api/leads/${idToDelete}`);
      } catch (err) {
        console.error('Failed to delete lead on cancel:', err);
      }
    }

    // 3. Reset the application state
    resetApp();
  };

  const handleStartAnalysis = async () => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    currentLeadIdRef.current = null;

    setCurrentStep(2);
    setProcessingState({ type: 'transcribing', progress: 0, error: null });

    let finalTranscript = '';

    try {
      // 1. Create Lead Record
      setProcessingState({ type: 'initializing', progress: 5, error: null });
      const leadResponse = await axios.post('/api/leads', leadData, { signal });
      const newLeadId = leadResponse.data.id;
      currentLeadIdRef.current = newLeadId;
      setLeadId(newLeadId);
      setEmailStatus(leadResponse.data.emailStatus ?? null);

      // 2. Transcribe
      if (useManualTranscript) {
        finalTranscript = manualTranscript;
        setTranscript(finalTranscript);
      } else {
        if (!audioFile) throw new Error("No audio file selected");
        
        setProcessingState({ type: 'transcribing', progress: 10, error: null });
        
        const formData = new FormData();
        formData.append('audio', audioFile);

        const transResponse = await axios.post('/api/transcribe', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          signal,
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProcessingState(prev => ({ ...prev, progress: Math.min(percentCompleted, 90) }));
            }
          },
        });

        finalTranscript = transResponse.data.transcript;
        setTranscript(finalTranscript);
        setProcessingState({ type: 'transcribing', progress: 100, error: null });
      }

      // 3. Transition to scoring
      await new Promise(resolve => setTimeout(resolve, 800));
      if (signal.aborted) return;

      setProcessingState({ type: 'scoring', progress: 20, error: null });
      
      const scoreResponse = await axios.post('/api/score', {
        transcript: finalTranscript,
        provider: selectedProvider,
        leadId: newLeadId,
        jobTitle: leadData.jobTitle,
        category: leadData.category,
      }, { signal });

      setAnalysisResult(scoreResponse.data);
      setProcessingState({ type: 'scoring', progress: 100, error: null });

      // Move to results
      await new Promise(resolve => setTimeout(resolve, 800));
      if (signal.aborted) return;

      setCurrentStep(3);
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('Analysis canceled by user');
        return; // Don't update state to error, resetApp handles it
      }
      console.error('App Pipeline Error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'An unexpected error occurred';
      setProcessingState(prev => ({ ...prev, error: errorMessage }));
    }
  };

  const resetApp = () => {
    setCurrentStep(1);
    setAudioFile(null);
    setManualTranscript('');
    setUseManualTranscript(false);
    setTranscript('');
    setAnalysisResult(null);
    setProcessingState({ type: '', progress: 0, error: null });
    setLeadId(null);
    setEmailStatus(null);
    currentLeadIdRef.current = null;
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1 className="outfit-font" style={{ fontSize: '32px', fontWeight: '800', marginBottom: '32px', color: 'var(--color-text-main)' }}>
          SalesGarners Call Quality Analyzer
        </h1>
        <StepIndicator 
          currentStep={currentStep} 
          onStepClick={(step) => {
            if (step === 1 && currentStep > 1) {
              handleCancelProcessing();
            }
          }}
        />
      </header>

      <main>
        {currentStep === 1 && (
          <Step1_Upload
            audioFile={audioFile}
            setAudioFile={setAudioFile}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            manualTranscript={manualTranscript}
            setManualTranscript={setManualTranscript}
            useManualTranscript={useManualTranscript}
            setUseManualTranscript={setUseManualTranscript}
            onStart={handleStartAnalysis}
            leadData={leadData}
            setLeadData={setLeadData}
          />
        )}

        {currentStep === 2 && (
          <Step2_Processing
            processingState={processingState}
            onRetry={handleCancelProcessing}
            onCancel={handleCancelProcessing}
          />
        )}

        {currentStep === 3 && analysisResult && (
          <Step3_Results
            analysisResult={analysisResult}
            transcript={transcript}
            onReset={resetApp}
            leadId={leadId}
            leadData={leadData}
            emailStatus={emailStatus}
          />
        )}
      </main>

      <footer style={{ marginTop: '80px', textAlign: 'center', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        <p>A product by SalesGarners</p>
      </footer>
    </div>
  );
}
