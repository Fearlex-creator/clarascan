import React, { useState, useEffect } from 'react';
import { UploadZone } from './components/UploadZone';
import { AnalysisView } from './components/AnalysisView';
import { ScanStatus, UploadedFile, AnalysisResult } from './types';
import { analyzeImage } from './services/nvidiaService';
import { Activity, BrainCircuit, ChevronRight, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ScanStatus>(ScanStatus.IDLE);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');

  const steps = [
    "Uploading DICOM data...",
    "Normalizing contrast...",
    "Sending to NVIDIA Inference Server...",
    "Running detection models...",
    "Aggregating heatmap..."
  ];

  const handleFileSelect = async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setUploadedFile({ file, previewUrl });
    setStatus(ScanStatus.UPLOADING);

    // Simulate Step-by-step processing visual
    let stepIndex = 0;
    setStatus(ScanStatus.PROCESSING);
    setProcessingStep(steps[0]);

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setProcessingStep(steps[stepIndex]);
      }
    }, 700);

    try {
      const data = await analyzeImage(file);
      clearInterval(stepInterval);
      setResult(data);
      setStatus(ScanStatus.COMPLETE);
    } catch (error) {
      clearInterval(stepInterval);
      setStatus(ScanStatus.ERROR);
      console.error(error);
    }
  };

  const handleReset = () => {
    setStatus(ScanStatus.IDLE);
    setUploadedFile(null);
    setResult(null);
    setProcessingStep('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BrainCircuit className="text-primary" size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-tight leading-none">ClaraScan AI</h1>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Powered by NVIDIA</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
             <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Documentation</a>
             <a href="#" className="text-sm font-medium text-slate-500 hover:text-primary transition-colors">Model Cards</a>
             <div className="h-4 w-px bg-slate-200"></div>
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-medium text-slate-600">System Operational</span>
             </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {status === ScanStatus.IDLE && (
          <div className="max-w-3xl mx-auto mt-12 space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
                AI-Powered Chest Radiography
              </h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Advanced deep learning models for immediate preliminary analysis. 
                Detects Pneumonia, Atelectasis, Effusion, and more with high precision.
              </p>
            </div>
            
            <div className="bg-white p-2 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100">
               <UploadZone onFileSelect={handleFileSelect} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-12">
               {[
                 { label: 'Inference Time', val: '< 200ms' },
                 { label: 'Accuracy (AUC)', val: '0.94' },
                 { label: 'Classes', val: '14+' }
               ].map((stat, i) => (
                 <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-2xl font-bold text-slate-900">{stat.val}</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">{stat.label}</div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {(status === ScanStatus.PROCESSING || status === ScanStatus.UPLOADING) && uploadedFile && (
          <div className="max-w-lg mx-auto mt-24 text-center space-y-8 animate-fade-in">
            <div className="relative w-64 h-64 mx-auto">
              {/* Scanning Animation Container */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900">
                  <img src={uploadedFile.previewUrl} className="w-full h-full object-cover opacity-50" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent h-1/2 w-full animate-scan"></div>
              </div>
            </div>
            
            <div className="space-y-3">
               <div className="flex items-center justify-center gap-3 text-primary">
                  <Loader2 className="animate-spin" size={24} />
                  <h3 className="text-xl font-semibold">Analyzing Scan</h3>
               </div>
               <p className="text-slate-500 font-mono text-sm">{processingStep}</p>
            </div>
          </div>
        )}

        {status === ScanStatus.COMPLETE && result && uploadedFile && (
           <AnalysisView 
              uploadedFile={uploadedFile} 
              result={result} 
              onReset={handleReset} 
            />
        )}

        {status === ScanStatus.ERROR && (
          <div className="text-center mt-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
               <Activity className="text-red-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Analysis Failed</h3>
            <p className="text-slate-500 mt-2 mb-6">Unable to process the image. Please try again.</p>
            <button 
              onClick={handleReset}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="text-sm text-slate-500">
             © 2024 ClaraScan AI Demo. For investigational use only.
           </div>
           <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>v2.4.0-beta</span>
              <span>•</span>
              <span>NVIDIA T4 GPU</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
