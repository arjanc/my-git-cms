'use client';
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { X, Upload, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
export function MediaManager({ apiBasePath = '/admin/api/cms', mediaPath = 'public/media', contentBase = 'example-app', onSelect, onClose, isLibraryView = false, }) {
    const [files, setFiles] = useState([]);
    const [mediaData, setMediaData] = useState({ images: [], labels: [] });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLabel, setSelectedLabel] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const fullPath = contentBase ? `${contentBase}/${mediaPath}` : mediaPath;
    const mediaDataPath = `${fullPath}/media.json`;
    useEffect(() => {
        loadMedia();
    }, []);
    const loadMedia = async () => {
        setLoading(true);
        try {
            const flResponse = await fetch(`${apiBasePath}/${fullPath}`);
            const flData = await flResponse.json();
            if (!flResponse.ok && flResponse.status !== 404) {
                throw new Error(flData.error || 'Failed to load files');
            }
            const imageFiles = (Array.isArray(flData) ? flData : []).filter((item) => item.type === 'file' && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(item.name));
            setFiles(imageFiles);
            const mdResponse = await fetch(`${apiBasePath}/${mediaDataPath}`);
            if (mdResponse.ok) {
                const mdData = await mdResponse.json();
                const content = mdData.content ? JSON.parse(mdData.content) : { images: [], labels: [] };
                setMediaData({
                    images: content.images || [],
                    labels: content.labels || []
                });
            }
            else {
                setMediaData({ images: [], labels: [] });
            }
        }
        catch (err) {
            console.error('Error loading media:', err);
            setError(err.message || 'Failed to load media');
        }
        finally {
            setLoading(false);
        }
    };
    const saveMediaData = async (newData, message) => {
        try {
            const mdResponse = await fetch(`${apiBasePath}/${mediaDataPath}`);
            let sha = undefined;
            if (mdResponse.ok) {
                const mdData = await mdResponse.json();
                sha = mdData.sha;
            }
            const saveResponse = await fetch(`${apiBasePath}/${mediaDataPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: mediaDataPath,
                    content: JSON.stringify(newData, null, 2),
                    message,
                    sha,
                }),
            });
            if (!saveResponse.ok)
                throw new Error('Failed to save media metadata');
            setMediaData(newData);
        }
        catch (err) {
            console.error('Error saving media data:', err);
            throw err;
        }
    };
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setUploading(true);
        setError(null);
        try {
            const reader = new FileReader();
            const base64Promise = new Promise((resolve, reject) => {
                reader.onload = () => {
                    const result = reader.result;
                    resolve(result.split(',')[1]);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const base64 = await base64Promise;
            const fileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const targetFilePath = `${fullPath}/${fileName}`;
            const response = await fetch(`${apiBasePath}/${targetFilePath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: targetFilePath,
                    content: base64,
                    encoding: 'base64',
                    message: `Upload image ${fileName}`,
                }),
            });
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }
            const newImages = [...mediaData.images];
            const existingIndex = newImages.findIndex(i => i.filename === fileName);
            const newItem = { filename: fileName, title: file.name, labels: [] };
            if (existingIndex >= 0) {
                newImages[existingIndex] = newItem;
            }
            else {
                newImages.push(newItem);
            }
            await saveMediaData({ ...mediaData, images: newImages }, `Add metadata for ${fileName}`);
            await loadMedia();
        }
        catch (err) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed');
        }
        finally {
            setUploading(false);
        }
    };
    const handleRenameLabel = async (oldName, newName) => {
        if (!newName || oldName === newName)
            return;
        const updatedImages = mediaData.images.map(img => ({
            ...img,
            labels: (img.labels || []).map(l => l === oldName ? newName : l)
        }));
        const updatedLabels = (mediaData.labels || []).map(l => l === oldName ? newName : l);
        await saveMediaData({ ...mediaData, images: updatedImages, labels: updatedLabels }, `Rename label ${oldName} to ${newName}`);
    };
    const handleDeleteLabel = async (labelName) => {
        if (!confirm(`Delete label "${labelName}"? It will be removed from all images.`))
            return;
        const updatedImages = mediaData.images.map(img => ({
            ...img,
            labels: (img.labels || []).filter(l => l !== labelName)
        }));
        const updatedLabels = (mediaData.labels || []).filter(l => l !== labelName);
        await saveMediaData({ ...mediaData, images: updatedImages, labels: updatedLabels }, `Delete label ${labelName}`);
        if (selectedLabel === labelName)
            setSelectedLabel('All');
    };
    const handleAddLabel = async () => {
        const name = prompt('Enter new label name:');
        if (!name || (mediaData.labels || []).includes(name))
            return;
        const updatedLabels = [...(mediaData.labels || []), name];
        await saveMediaData({ ...mediaData, labels: updatedLabels }, `Add label ${name}`);
    };
    const toggleImageLabel = async (filename, label) => {
        const newImages = [...mediaData.images];
        const idx = newImages.findIndex(i => i.filename === filename);
        if (idx < 0)
            return;
        let labels = [...(newImages[idx].labels || [])];
        labels = labels.includes(label) ? labels.filter(l => l !== label) : [...labels, label];
        newImages[idx] = { ...newImages[idx], labels };
        await saveMediaData({ ...mediaData, images: newImages }, `Update labels for ${filename}`);
    };
    const handleDelete = async (filename) => {
        if (!confirm(`Delete ${filename}?`))
            return;
        setLoading(true);
        try {
            const file = files.find(f => f.name === filename);
            if (!file)
                throw new Error('File not found');
            const delResponse = await fetch(`${apiBasePath}/${fullPath}/${filename}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    path: `${fullPath}/${filename}`,
                    sha: file.sha,
                    message: `Delete image ${filename}`,
                }),
            });
            if (!delResponse.ok) {
                const data = await delResponse.json();
                throw new Error(data.error || 'Delete failed');
            }
            const newImages = mediaData.images.filter(i => i.filename !== filename);
            await saveMediaData({ ...mediaData, images: newImages }, `Remove metadata for ${filename}`);
            await loadMedia();
        }
        catch (err) {
            console.error('Delete error:', err);
            setError(err.message || 'Delete failed');
        }
        finally {
            setLoading(false);
        }
    };
    const sidebarLabels = Array.from(new Set(['All', ...(mediaData.labels || [])]));
    const trackedImages = mediaData.images.filter(img => {
        const matchesLabel = selectedLabel === 'All' || (img.labels || []).includes(selectedLabel);
        const matchesSearch = img.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (img.title ?? '').toLowerCase().includes(searchQuery.toLowerCase());
        const fileExists = files.some(f => f.name === img.filename);
        return matchesLabel && matchesSearch && fileExists;
    });
    const untrackedFiles = files.filter(f => !mediaData.images.some(m => m.filename === f.name));
    const displayedImages = [
        ...trackedImages,
        ...(selectedLabel === 'All'
            ? untrackedFiles
                .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(f => ({ filename: f.name, title: f.name, labels: [] }))
            : []),
    ];
    const getPublicUrl = (filename) => `/media/${filename}`;
    return (React.createElement("div", { className: `media-manager bg-white rounded-lg border border-gray-200 shadow-lg flex flex-col ${isLibraryView
            ? 'h-full'
            : 'max-h-[90vh] w-[90vw] max-w-5xl fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50'}` },
        React.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-gray-200" },
            React.createElement("h2", { className: "text-base font-semibold text-gray-900" }, "Media Library"),
            React.createElement("div", { className: "flex items-center gap-3" },
                React.createElement("input", { type: "file", accept: "image/*", onChange: handleUpload, className: "hidden", id: "media-upload", disabled: uploading }),
                React.createElement("label", { htmlFor: "media-upload" },
                    React.createElement(Button, { asChild: true, size: "sm", disabled: uploading, className: "cursor-pointer" },
                        React.createElement("span", null,
                            React.createElement(Upload, { className: "h-4 w-4 mr-1.5" }),
                            uploading ? 'Uploading…' : 'Upload'))),
                !isLibraryView && (React.createElement(Button, { variant: "ghost", size: "icon", onClick: onClose, className: "h-8 w-8" },
                    React.createElement(X, { className: "h-4 w-4" }))))),
        React.createElement("div", { className: "flex flex-1 overflow-hidden" },
            React.createElement("div", { className: "w-56 border-r border-gray-200 bg-gray-50 flex flex-col overflow-hidden" },
                React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b border-gray-200" },
                    React.createElement("span", { className: "text-xs font-semibold text-gray-600 uppercase tracking-wider" }, "Labels"),
                    React.createElement("button", { onClick: handleAddLabel, className: "text-xs font-bold text-blue-600 hover:text-blue-700" }, "+ Add")),
                React.createElement("div", { className: "flex-1 overflow-y-auto p-2 space-y-0.5" }, sidebarLabels.map(label => (React.createElement("div", { key: label, className: "group flex items-center gap-1" },
                    React.createElement("button", { onClick: () => setSelectedLabel(label), className: `flex-1 text-left px-3 py-1.5 rounded-md text-sm transition-colors ${selectedLabel === label
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-100'}` }, label),
                    label !== 'All' && (React.createElement("div", { className: "hidden group-hover:flex items-center gap-0.5" },
                        React.createElement("button", { onClick: () => {
                                const newName = prompt('Rename label:', label);
                                if (newName)
                                    handleRenameLabel(label, newName);
                            }, className: "p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-white", title: "Rename" },
                            React.createElement(Pencil, { className: "w-3 h-3" })),
                        React.createElement("button", { onClick: () => handleDeleteLabel(label), className: "p-1 rounded text-gray-400 hover:text-red-600 hover:bg-white", title: "Delete" },
                            React.createElement(Trash2, { className: "w-3 h-3" }))))))))),
            React.createElement("div", { className: "flex-1 flex flex-col min-w-0" },
                React.createElement("div", { className: "px-4 py-3 border-b border-gray-200" },
                    React.createElement(Input, { type: "text", placeholder: "Search images\u2026", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) })),
                error && (React.createElement("div", { className: "mx-4 mt-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" }, error)),
                React.createElement("div", { className: "flex-1 overflow-y-auto p-4" }, loading ? (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" }, [1, 2, 3, 4, 5, 6].map(n => (React.createElement("div", { key: n, className: "aspect-square rounded-lg bg-gray-100 animate-pulse" }))))) : displayedImages.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center h-64 text-gray-400 gap-2" },
                    React.createElement(ImageIcon, { className: "w-10 h-10" }),
                    React.createElement("p", { className: "text-sm" }, "No images found"),
                    React.createElement("p", { className: "text-xs" }, "Try uploading one or changing your filters"))) : (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3" }, displayedImages.map((img) => {
                    const metadata = mediaData.images.find(i => i.filename === img.filename) || img;
                    return (React.createElement("div", { key: img.filename, className: "group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow" },
                        React.createElement("div", { className: "aspect-square bg-gray-100 flex items-center justify-center overflow-hidden" },
                            React.createElement(ImagePreview, { url: getPublicUrl(img.filename) })),
                        React.createElement("div", { className: "p-2 bg-white border-t border-gray-100" },
                            React.createElement("div", { className: "truncate text-xs font-medium text-gray-700", title: metadata.title || img.filename }, metadata.title || img.filename),
                            React.createElement("div", { className: "mt-1 flex flex-wrap gap-1" }, (metadata.labels || []).map(l => (React.createElement(Badge, { key: l, variant: "secondary", className: "text-[10px] px-1.5 py-0 h-auto" }, l))))),
                        React.createElement("div", { className: "absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end gap-2 p-2" },
                            onSelect && (React.createElement(Button, { size: "sm", className: "w-full", onClick: () => onSelect(getPublicUrl(img.filename)) }, "Select")),
                            React.createElement("div", { className: "w-full grid grid-cols-2 gap-1" },
                                React.createElement(Button, { variant: "secondary", size: "sm", className: "w-full text-xs h-7", onClick: () => {
                                        const newTitle = prompt('Enter new title:', metadata.title || img.filename);
                                        if (newTitle !== null) {
                                            const newImages = [...mediaData.images];
                                            const idx = newImages.findIndex(i => i.filename === img.filename);
                                            if (idx >= 0)
                                                newImages[idx].title = newTitle;
                                            else
                                                newImages.push({ filename: img.filename, title: newTitle, labels: [] });
                                            saveMediaData({ ...mediaData, images: newImages }, `Update title for ${img.filename}`);
                                        }
                                    } }, "Rename"),
                                React.createElement(Button, { variant: "destructive", size: "sm", className: "w-full text-xs h-7", onClick: () => handleDelete(img.filename) }, "Delete")),
                            (mediaData.labels || []).length > 0 && (React.createElement("div", { className: "w-full bg-black/60 rounded p-1.5" },
                                React.createElement("p", { className: "text-[9px] text-white/50 mb-1 uppercase font-bold tracking-wider" }, "Labels"),
                                React.createElement("div", { className: "flex flex-wrap gap-1" }, (mediaData.labels || []).map(l => (React.createElement("button", { key: l, onClick: () => toggleImageLabel(img.filename, l), className: `text-[9px] px-1.5 py-0.5 rounded transition-colors ${metadata.labels?.includes(l)
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white/20 text-white/80 hover:bg-white/40'}` }, l)))))))));
                })))))),
        !isLibraryView && (React.createElement("div", { className: "px-5 py-3 border-t border-gray-200 flex justify-end" },
            React.createElement(Button, { variant: "outline", size: "sm", onClick: onClose }, "Close"))),
        !isLibraryView && (React.createElement("div", { className: "fixed inset-0 bg-black/50 -z-10", onClick: onClose }))));
}
function ImagePreview({ url }) {
    const [status, setStatus] = useState('loading');
    return status === 'error' ? (React.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full p-4 text-gray-300" },
        React.createElement(ImageIcon, { className: "w-10 h-10" }),
        React.createElement("span", { className: "text-[10px] mt-2 text-gray-400 uppercase font-medium" }, "No Preview"))) : (React.createElement("img", { src: url, alt: "", onLoad: () => setStatus('success'), onError: () => setStatus('error'), className: `object-contain w-full h-full transition-opacity duration-300 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}` }));
}
