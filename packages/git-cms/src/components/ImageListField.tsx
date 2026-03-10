'use client'

import React, { useState } from 'react'
import { MediaManager } from './MediaManager'
import { Button } from './ui/button'
import { X, Plus } from 'lucide-react'

interface ImageListFieldProps {
  value: string[]
  onChange: (val: string[]) => void
}

export function ImageListField({ value, onChange }: ImageListFieldProps) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null)

  function handleSelect(url: string) {
    if (pickerIndex === null) return
    if (pickerIndex === value.length) {
      onChange([...value, url])
    } else {
      const next = [...value]
      next[pickerIndex] = url
      onChange(next)
    }
    setPickerIndex(null)
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {value.map((src, i) => (
        <div key={i} className="flex items-start gap-2">
          <div className="relative aspect-video w-full max-w-xs rounded-lg border border-gray-200 bg-gray-50 overflow-hidden group flex-1">
            {src ? (
              <>
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNFMkU4RjAiLz48cGF0aCBkPSJNMjAgMTJMMTIgMjBIMjhMMjAgMTJaIiBmaWxsPSIjOTQ0QjU1Ii8+PC9zdmc+'
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center flex-col gap-2 transition-opacity">
                  <span className="text-[10px] text-white font-mono truncate px-4 w-full text-center">{src}</span>
                  <Button size="sm" onClick={() => setPickerIndex(i)}>
                    Change
                  </Button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setPickerIndex(i)}
                className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-colors"
              >
                <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-medium">Select image</span>
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleRemove(i)}
            title="Remove image"
            className="shrink-0 mt-1 h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => setPickerIndex(value.length)}
        className="flex items-center gap-1.5"
      >
        <Plus className="h-4 w-4" />
        Add image
      </Button>

      {pickerIndex !== null && (
        <MediaManager
          onClose={() => setPickerIndex(null)}
          onSelect={handleSelect}
        />
      )}
    </div>
  )
}
