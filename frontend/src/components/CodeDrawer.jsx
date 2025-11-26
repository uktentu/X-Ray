import React from 'react';
import { X, Code2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion, AnimatePresence } from 'framer-motion';

const CodeDrawer = ({ isOpen, onClose, node }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-[600px] bg-slate-900 border-l border-slate-800 z-50 shadow-2xl flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
                            <div className="flex items-center">
                                <Code2 className="text-purple-400 mr-2" size={20} />
                                <div>
                                    <h2 className="font-semibold text-slate-200 text-sm">
                                        {node?.data?.label || 'Code View'}
                                    </h2>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                                        {node?.type === 'dependency' ? 'Decompiled from .class' : 'Source File'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                            {node?.data?.code ? (
                                <SyntaxHighlighter
                                    language="java"
                                    style={vscDarkPlus}
                                    customStyle={{ margin: 0, padding: '1.5rem', fontSize: '13px', lineHeight: '1.5' }}
                                    showLineNumbers={true}
                                    wrapLines={true}
                                >
                                    {node.data.code}
                                </SyntaxHighlighter>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                    No code available
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CodeDrawer;
