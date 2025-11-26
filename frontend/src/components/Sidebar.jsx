import React, { useState } from 'react';
import { Search, Play, Loader2 } from 'lucide-react';

const Sidebar = ({ onScan, loading, onSearch, onToggleSource, onToggleDependency, onPackageFilter, onToggleOrphans }) => {
    const [mode, setMode] = useState('local'); // 'local' or 'git'
    const [projectPath, setProjectPath] = useState('/Users/udaykirantentu/Desktop/anti/X-Ray/test-project/src/main/java');
    const [gitUrl, setGitUrl] = useState('');
    const [branch, setBranch] = useState('');
    const [targetGroupId, setTargetGroupId] = useState('com.myorg');

    const handleSubmit = (e) => {
        e.preventDefault();
        onScan({
            projectPath: mode === 'local' ? projectPath : null,
            targetGroupId,
            gitUrl: mode === 'git' ? gitUrl : null,
            branch: mode === 'git' ? branch : null
        });
    };

    return (
        <div className="w-80 h-full bg-slate-900 border-r border-slate-800 p-6 flex flex-col">
            <div className="mb-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Dependency X-Ray
                </h1>
                <p className="text-slate-400 text-sm mt-2">
                    Visualize internal dependency chains in real-time.
                </p>
            </div>

            <div className="flex bg-slate-800 p-1 rounded-md mb-6">
                <button
                    onClick={() => setMode('local')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'local' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Local Path
                </button>
                <button
                    onClick={() => setMode('git')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-all ${mode === 'git' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'
                        }`}
                >
                    Git Repo
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'local' ? (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Project Path
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={projectPath}
                                onChange={(e) => setProjectPath(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                placeholder="/path/to/project"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Git URL
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={gitUrl}
                                    onChange={(e) => setGitUrl(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="https://github.com/user/repo.git"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                Branch (Optional)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    placeholder="main"
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Target Group IDs (comma separated)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={targetGroupId}
                            onChange={(e) => setTargetGroupId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                            placeholder="com.myorg, com.partner"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-md flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="animate-spin mr-2" size={18} />
                            Scanning...
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 fill-current" size={18} />
                            Start Scan
                        </>
                    )}
                </button>
            </form>

            <div className="mt-8 space-y-4 border-t border-slate-800 pt-6">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Graph Controls
                </h3>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Search nodes..."
                    />
                </div>

                <div className="relative">
                    <input
                        type="text"
                        onChange={(e) => onPackageFilter(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-3 text-sm text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
                        placeholder="Filter by package..."
                    />
                </div>

                <div className="flex flex-col space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={(e) => onToggleSource(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-500 rounded border-slate-700 bg-slate-800 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-300">Show Source Code</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked={true}
                            onChange={(e) => onToggleDependency(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-purple-500 rounded border-slate-700 bg-slate-800 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-300">Show Dependencies</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            defaultChecked={false}
                            onChange={(e) => onToggleOrphans(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-red-500 rounded border-slate-700 bg-slate-800 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-300">Hide Orphans</span>
                    </label>
                </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800">
                <div className="flex items-center text-slate-500 text-xs">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                    <span>Source Code</span>
                </div>
                <div className="flex items-center text-slate-500 text-xs mt-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 mr-2 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                    <span>Decompiled Dependency</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
