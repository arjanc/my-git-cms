'use client'

import React from 'react'
import type { PageSchema } from '../types/schemas'

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'editor' | 'files') => void
  basePath: string
  pageSchemas?: PageSchema[]
  onSelectSchema?: (schemaType: string) => void
}

export function Dashboard({ onNavigate, pageSchemas, onSelectSchema }: DashboardProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Dashboard</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {pageSchemas && pageSchemas.length > 0 ? (
          pageSchemas.map((schema) => (
            <button
              key={schema.type}
              onClick={() => onSelectSchema?.(schema.type)}
              className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <h3 className="text-xl font-semibold mb-2">{schema.label}</h3>
              <p className="text-gray-600 text-sm font-mono">{schema.contentPath}</p>
            </button>
          ))
        ) : (
          <button
            onClick={() => onNavigate('files')}
            className="p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <h3 className="text-xl font-semibold mb-2">Manage Pages</h3>
            <p className="text-gray-600">Create, edit, and delete your content pages</p>
          </button>
        )}

        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Repository Info</h3>
          <p className="text-gray-600">Content stored in your GitHub repository</p>
        </div>
      </div>
    </div>
  )
}
