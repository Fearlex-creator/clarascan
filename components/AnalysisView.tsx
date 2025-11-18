import React, { useState, useEffect } from 'react';
import { AnalysisResult, UploadedFile } from '../types';
import { 
    Activity, 
    Cpu, 
    ShieldCheck, 
    AlertTriangle, 
    Maximize2, 
    Eye, 
    EyeOff, 
    Share2, 
    Download,
    ScanLine
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface AnalysisViewProps {
    uploadedFile: UploadedFile;
    result: AnalysisResult;
    onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ uploadedFile, result, onReset }) => {
    const [showHeatmap, setShowHeatmap] = useState(true);
    const [selectedFindingIndex, setSelectedFindingIndex] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'findings' | 'details'>('findings');

    // Auto-select first finding if abnormal
    useEffect(() => {
        if (result.findings.length > 0) {
            setSelectedFindingIndex(0);
        }
    }, [result]);

    const confidenceData = result.findings.map(f => ({
        name: f.condition,
        confidence: Math.round(f.confidence * 100),
        fill: f.confidence > 0.8 ? '#ef4444' : '#eab308'
    }));

    // Fallback if normal
    if (confidenceData.length === 0) {
        confidenceData.push({ name: 'Normal', confidence: 99, fill: '#22c55e' });
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full lg:h-[calc(100vh-8rem)]">
            {/* Left Column: Viewer */}
            <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="relative w-full h-full min-h-[500px] bg-slate-950 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
                    {/* Toolbar */}
                    <div className="absolute top-4 left-4 z-30 flex gap-2">
                        <button 
                            onClick={() => setShowHeatmap(!showHeatmap)}
                            className="flex items-center gap-2 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all text-sm font-medium border border-white/10"
                        >
                            {showHeatmap ? <Eye size={16} className="text-accent" /> : <EyeOff size={16} />}
                            {showHeatmap ? 'AI Overlay On' : 'AI Overlay Off'}
                        </button>
                    </div>

                    <div className="absolute top-4 right-4 z-30 flex gap-2">
                         <div className="flex items-center gap-1 bg-accent/90 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg shadow-accent/20">
                            <Cpu size={12} />
                            NVIDIA Inference
                        </div>
                    </div>

                    {/* Image Container */}
                    <div className="relative w-full h-full flex items-center justify-center p-6">
                        <img 
                            src={uploadedFile.previewUrl} 
                            alt="X-Ray" 
                            className="max-w-full max-h-full object-contain opacity-90"
                        />
                        
                        {/* Simulated Heatmap / Bounding Boxes */}
                        {showHeatmap && result.findings.map((finding, idx) => (
                            finding.coordinates && (
                                <div
                                    key={idx}
                                    className={`absolute border-2 ${selectedFindingIndex === idx ? 'border-red-500 bg-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : 'border-yellow-500/50 bg-yellow-500/10'} transition-all duration-500 rounded-lg flex items-start justify-start`}
                                    style={{
                                        left: `${finding.coordinates.x}%`,
                                        top: `${finding.coordinates.y}%`,
                                        width: `${finding.coordinates.width}%`,
                                        height: `${finding.coordinates.height}%`,
                                    }}
                                    onClick={() => setSelectedFindingIndex(idx)}
                                >
                                    <div className="absolute -top-7 left-0 bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-sm">
                                        {finding.condition} {(finding.confidence * 100).toFixed(0)}%
                                    </div>
                                </div>
                            )
                        ))}

                        {/* Scanning Line Animation (Optional flair) */}
                         <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
                             <div className="w-full h-1 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] animate-scan absolute top-0"></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Data Dashboard */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl font-semibold text-slate-900">Analysis Report</h2>
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${result.overallStatus === 'Normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {result.overallStatus}
                            </div>
                        </div>
                        <p className="text-slate-500 text-sm flex items-center gap-2">
                            <ScanLine size={14} />
                            ID: {result.id} • {result.processingTimeMs}ms
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-slate-100">
                        <button 
                            onClick={() => setActiveTab('findings')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'findings' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Findings
                        </button>
                        <button 
                            onClick={() => setActiveTab('details')}
                            className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Confidence Graph
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 overflow-y-auto">
                        {activeTab === 'findings' ? (
                            <div className="space-y-4">
                                {result.findings.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                        <ShieldCheck size={48} className="mb-3 text-green-500 opacity-50" />
                                        <p>No abnormalities detected.</p>
                                    </div>
                                ) : (
                                    result.findings.map((finding, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => setSelectedFindingIndex(idx)}
                                            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedFindingIndex === idx ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-primary/30 bg-slate-50'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-semibold text-slate-900">{finding.condition}</h4>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${finding.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {finding.severity.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{finding.description}</p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full" 
                                                        style={{ width: `${finding.confidence * 100}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-primary">{(finding.confidence * 100).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={confidenceData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                        <XAxis type="number" domain={[0, 100]} hide />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                                        <Tooltip 
                                            cursor={{ fill: '#f1f5f9' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="confidence" radius={[0, 4, 4, 0]} barSize={20}>
                                            {confidenceData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                                <div className="mt-4 text-center text-xs text-slate-400">
                                    Confidence scores based on training data (ImageNet + NIH Chest X-Ray)
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Actions */}
                    <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                        <button onClick={onReset} className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm">
                            Upload New
                        </button>
                        <button className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-white font-medium text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
