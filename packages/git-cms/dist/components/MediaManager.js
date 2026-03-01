'use client';
import React, { useState, useEffect } from 'react';
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
            // Load files in directory
            const flResponse = await fetch(`${apiBasePath}/${fullPath}`);
            const flData = await flResponse.json();
            if (!flResponse.ok && flResponse.status !== 404) {
                throw new Error(flData.error || 'Failed to load files');
            }
            const imageFiles = (Array.isArray(flData) ? flData : []).filter(item => item.type === 'file' && /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(item.name));
            setFiles(imageFiles);
            // Load media.json metadata
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
            // Fetch latest SHA
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
            // Update media.json with new image and default label
            const newImages = [...mediaData.images];
            const existingIndex = newImages.findIndex(i => i.filename === fileName);
            const newItem = {
                filename: fileName,
                title: file.name,
                labels: [],
            };
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
        if (!confirm(`Are you sure you want to delete the label "${labelName}"? It will be removed from all images.`))
            return;
        const updatedImages = mediaData.images.map(img => {
            let labels = (img.labels || []).filter(l => l !== labelName);
            return { ...img, labels };
        });
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
        if (labels.includes(label)) {
            labels = labels.filter(l => l !== label);
        }
        else {
            labels = [...labels, label];
        }
        newImages[idx] = { ...newImages[idx], labels };
        await saveMediaData({ ...mediaData, images: newImages }, `Update labels for ${filename}`);
    };
    const handleDelete = async (filename) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`))
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
        ...(selectedLabel === 'All' ?
            untrackedFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(f => ({
                filename: f.name,
                title: f.name,
                labels: []
            })) : [])
    ];
    const getPublicUrl = (filename) => `/media/${filename}`;
    return (React.createElement("div", { className: `media-manager bg-white rounded-lg shadow-lg flex flex-col ${isLibraryView ? 'h-full' : 'max-h-[90vh] w-[90vw] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50'}` },
        React.createElement("div", { className: "flex items-center justify-between p-4 border-b" },
            React.createElement("h2", { className: "text-xl font-bold" }, "Media Library"),
            React.createElement("div", { className: "flex items-center gap-4" },
                React.createElement("input", { type: "file", accept: "image/*", onChange: handleUpload, className: "hidden", id: "media-upload", disabled: uploading }),
                React.createElement("label", { htmlFor: "media-upload", className: `px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 text-sm font-medium ${uploading ? 'opacity-50 cursor-not-allowed' : ''}` }, uploading ? 'Uploading...' : 'Upload Image'),
                !isLibraryView && (React.createElement("button", { onClick: onClose, className: "text-gray-500 hover:text-gray-700" },
                    React.createElement("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                        React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })))))),
        React.createElement("div", { className: "flex flex-1 overflow-hidden" },
            React.createElement("div", { className: "w-64 border-r bg-gray-50 p-4 flex flex-col overflow-hidden" },
                React.createElement("div", { className: "flex items-center justify-between mb-2" },
                    React.createElement("h3", { className: "text-sm font-semibold text-gray-900" }, "Labels"),
                    React.createElement("button", { onClick: handleAddLabel, className: "text-blue-600 hover:text-blue-700 text-xs font-bold" }, "+ Add")),
                React.createElement("div", { className: "flex-1 overflow-y-auto space-y-1 pr-2" }, sidebarLabels.map(label => (React.createElement("div", { key: label, className: "group flex items-center gap-1" },
                    React.createElement("button", { onClick: () => setSelectedLabel(label), className: `flex-1 text-left px-3 py-2 rounded text-sm transition-colors ${selectedLabel === label ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-600'}` }, label),
                    label !== 'All' && (React.createElement("div", { className: "hidden group-hover:flex items-center gap-1" },
                        React.createElement("button", { onClick: () => {
                                const newName = prompt('Rename label:', label);
                                if (newName)
                                    handleRenameLabel(label, newName);
                            }, className: "p-1 text-gray-400 hover:text-blue-600", title: "Rename" },
                            React.createElement("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" }))),
                        React.createElement("button", { onClick: () => handleDeleteLabel(label), className: "p-1 text-gray-400 hover:text-red-600", title: "Delete" },
                            React.createElement("svg", { className: "w-3.5 h-3.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
                                React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" })))))))))),
            React.createElement("div", { className: "flex-1 flex flex-col min-w-0" },
                React.createElement("div", { className: "p-4 border-b bg-white" },
                    React.createElement("input", { type: "text", placeholder: "Search images...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full border rounded px-4 py-2 text-sm" })),
                React.createElement("div", { className: "flex-1 overflow-y-auto p-4" }, loading ? (React.createElement("div", { className: "flex items-center justify-center h-64" },
                    React.createElement("p", { className: "text-gray-500" }, "Loading media..."))) : error ? (React.createElement("div", { className: "p-4 bg-red-50 text-red-700 rounded-lg" }, error)) : displayedImages.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center h-64 text-gray-500" },
                    React.createElement("p", null, "No images found."),
                    React.createElement("p", { className: "text-sm" }, "Try uploading one or changing your filters."))) : (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" }, displayedImages.map((img) => {
                    const metadata = mediaData.images.find(i => i.filename === img.filename) || img;
                    return (React.createElement("div", { key: img.filename, className: "group relative border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow" },
                        React.createElement("div", { className: "aspect-square bg-gray-200 flex items-center justify-center overflow-hidden" },
                            React.createElement(ImagePreview, { url: getPublicUrl(img.filename) })),
                        React.createElement("div", { className: "p-2 bg-white border-t" },
                            React.createElement("div", { className: "truncate text-xs font-medium text-gray-700", title: metadata.title || img.filename }, metadata.title || img.filename),
                            React.createElement("div", { className: "mt-1 flex flex-wrap gap-1" }, (metadata.labels || []).map(l => (React.createElement("span", { key: l, className: "text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-wider" }, l))))),
                        React.createElement("div", { className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 pb-0" },
                            onSelect && (React.createElement("button", { onClick: () => onSelect(getPublicUrl(img.filename)), className: "w-full py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700" }, "Select")),
                            React.createElement("div", { className: "w-full grid grid-cols-2 gap-1 mb-2 mt-auto" },
                                React.createElement("button", { onClick: () => {
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
                                    }, className: "py-1.5 bg-white text-gray-800 rounded text-[10px] font-bold hover:bg-gray-100" }, "TITLE"),
                                React.createElement("button", { onClick: () => handleDelete(img.filename), className: "py-1.5 bg-red-600 text-white rounded text-[10px] font-bold hover:bg-red-700" }, "DEL")),
                            React.createElement("div", { className: "w-full h-1/3 overflow-y-auto bg-black/60 p-2 rounded-t-lg -mb-px" },
                                React.createElement("p", { className: "text-[10px] text-white/60 mb-1 uppercase font-bold tracking-tighter" }, "Toggle Labels"),
                                React.createElement("div", { className: "flex flex-wrap gap-1" }, (mediaData.labels || []).map(l => (React.createElement("button", { key: l, onClick: () => toggleImageLabel(img.filename, l), className: `text-[9px] px-1 rounded transition-colors ${metadata.labels?.includes(l) ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/80 hover:bg-white/40'}` }, l))))))));
                })))))),
        !isLibraryView && (React.createElement("div", { className: "p-4 border-t bg-gray-50 flex justify-end" },
            React.createElement("button", { onClick: onClose, className: "px-4 py-2 border rounded text-sm hover:bg-gray-100" }, "Close"))),
        !isLibraryView && (React.createElement("div", { className: "fixed inset-0 bg-black/50 -z-10", onClick: onClose }))));
}
function ImagePreview({ url }) {
    const [status, setStatus] = useState('loading');
    return (status === 'error') ? (React.createElement("div", { className: "flex flex-col items-center justify-center p-4" },
        React.createElement("svg", { className: "w-12 h-12 text-gray-300", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
            React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1, d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" })),
        React.createElement("span", { className: "text-[10px] text-gray-400 mt-2 uppercase font-medium" }, "No Preview"))) : (React.createElement("img", { src: url, alt: "", onLoad: () => setStatus('success'), onError: () => setStatus('error'), className: `object-contain w-full h-full transition-opacity duration-300 ${status === 'loading' ? 'opacity-0' : 'opacity-100'}` }));
}
