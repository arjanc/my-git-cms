'use client'

import React, { useState } from 'react'
import type { FieldSchema } from '../types/schemas'
import { MediaManager } from './MediaManager'

interface ImageFieldProps {
    field: FieldSchema
    value: string
    onChange: (val: string) => void
}

export function ImageField({ field, value, onChange }: ImageFieldProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-2">
                {value ? (
                    <div className="relative aspect-video w-full max-w-sm rounded border bg-gray-50 overflow-hidden group">
                        <img
                            src={value}
                            alt=""
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFMkU4RjAiLz48cGF0aCBkPSJNMjAgMTJMMTIgMjBIMjhMMjAgMTJaIiBmaWxsPSIjOTQ0QjU1Ii8+PC9zdmc+'
                            }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity flex-col gap-2">
                            <span className="text-[10px] text-white font-mono truncate px-4 w-full text-center">{value}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs px-3"
                                >
                                    Change
                                </button>
                                <button
                                    onClick={() => onChange('')}
                                    className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                                    title="Remove image"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full max-w-sm aspect-video border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
                    >
                        <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Select Image from Library</span>
                    </button>
                )}
            </div>

            {isModalOpen && (
                <MediaManager
                    onClose={() => setIsModalOpen(false)}
                    onSelect={(url) => {
                        onChange(url)
                        setIsModalOpen(false)
                    }}
                />
            )}
        </div>
    )
}
