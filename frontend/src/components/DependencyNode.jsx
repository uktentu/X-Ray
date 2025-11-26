import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Box } from 'lucide-react';

const DependencyNode = ({ data }) => {
    return (
        <div className="px-4 py-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] rounded-full bg-slate-900 border-2 border-purple-500 min-w-[180px]">
            <div className="flex items-center">
                <div className="rounded-md w-8 h-8 flex items-center justify-center bg-purple-500/20 text-purple-400 mr-2">
                    <Box size={16} />
                </div>
                <div className="text-sm font-bold text-slate-200">{data.label}</div>
            </div>
            <div className="text-xs text-purple-300 mt-1 font-mono">{data.subLabel}</div>

            <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500" />
            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500" />
        </div>
    );
};

export default memo(DependencyNode);
