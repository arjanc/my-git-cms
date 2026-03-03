'use client'

import React from 'react'
import type { PageSchema } from '../types/schemas'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card'
import { Button } from './ui/button'

interface DashboardProps {
  onNavigate: (view: 'dashboard' | 'editor' | 'files') => void
  basePath: string
  pageSchemas?: PageSchema[]
  onSelectSchema?: (schemaType: string) => void
}

export function Dashboard({ onNavigate, pageSchemas, onSelectSchema }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500">Manage your site content</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pageSchemas && pageSchemas.length > 0 ? (
          pageSchemas.map((schema) => (
            <button
              key={schema.type}
              onClick={() => onSelectSchema?.(schema.type)}
              className="text-left group"
            >
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    {schema.label}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs mt-1">
                    {schema.contentPath}
                  </CardDescription>
                </CardHeader>
              </Card>
            </button>
          ))
        ) : (
          <button onClick={() => onNavigate('files')} className="text-left group">
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="group-hover:text-blue-600 transition-colors">
                  Manage Pages
                </CardTitle>
                <CardDescription>Create, edit, and delete your content pages</CardDescription>
              </CardHeader>
            </Card>
          </button>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Repository</CardTitle>
            <CardDescription>Content stored in your GitHub repository</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-400">Connected via GitHub API</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
