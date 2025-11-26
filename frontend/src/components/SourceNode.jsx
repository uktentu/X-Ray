import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileCode } from 'lucide-react';

const SourceNode = ({ data }) => {
    return (
        <div className="px-4 py-2 shadow-md rounded-full bg-slate-800 border-2 border-blue-500 min-w-[150px]">
            <div className="flex items-center">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-blue-500/20 text-blue-400 mr-2">
                    <FileCode size={16} />
                </div>
                <div className="text-sm font-bold text-slate-200">{data.label}</div>
            </div>
            <div className="text-xs text-slate-400 mt-1">{data.subLabel}</div>

            <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500" />
        </div>
    );
};

export default memo(SourceNode);
