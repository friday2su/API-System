import React, { useState, useMemo } from 'react';
import { IconCopy, IconSearch, IconCode, IconDownload } from './Icons';

const ResponsePanel = ({ response, loading, lastRequest }) => {
    const [activeTab, setActiveTab] = useState('body');
    const [copied, setCopied] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showSnippet, setShowSnippet] = useState(false);
    const [snippetType, setSnippetType] = useState('js');

    const handleDownload = () => {
        if (!response?.data) return;
        const isHtml = response.headers?.['content-type']?.includes('html');
        const filename = `response-${Date.now()}.${isHtml ? 'html' : 'json'}`;
        const content = typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data;
        const blob = new Blob([content], { type: isHtml ? 'text/html' : 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const jsonToTsInterface = (obj, name = 'Response') => {
        if (typeof obj !== 'object' || obj === null) return `type ${name} = ${typeof obj};`;

        let res = `interface ${name} {\n`;
        Object.entries(obj).forEach(([key, val]) => {
            let type = typeof val;
            if (val === null) type = 'null';
            else if (Array.isArray(val)) {
                const subType = val.length > 0 ? typeof val[0] : 'any';
                type = `${subType}[]`;
            } else if (type === 'object') {
                type = '{ [key: string]: any }';
            }
            res += `  ${key}: ${type};\n`;
        });
        res += `}`;
        return res;
    };

    const copyToClipboard = (text) => {
        const content = text || (activeTab === 'body'
            ? (typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data)
            : JSON.stringify(response.headers, null, 2));

        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const generateSnippet = () => {
        const req = lastRequest || { url: 'https://api.example.com', method: 'GET', headers: {}, body: null };
        const { url, method, headers, body } = req;

        if (snippetType === 'curl') {
            let curl = `curl -X ${method} "${url}"`;
            Object.entries(headers || {}).forEach(([k, v]) => {
                if (k && v) curl += ` \\\n  -H "${k}: ${v}"`;
            });
            if (body) curl += ` \\\n  --data-raw '${JSON.stringify(body)}'`;
            return curl;
        }

        if (snippetType === 'ts') {
            return jsonToTsInterface(response.data);
        }

        return `// JavaScript (Axios)\nconst res = await axios ({\n  method: '${method}',\n  url: '${url}',\n  headers: ${JSON.stringify(headers || {}, null, 2).replace(/\n/g, '\n  ')}${body ? `,\n  data: ${JSON.stringify(body, null, 2).replace(/\n/g, '\n  ')}` : ''}\n});`;
    };

    const formatResponse = (data) => {
        if (!data) return '';
        let formatted = typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data);

        // Basic HTML formatting
        if (typeof data === 'string' && data.trim().startsWith('<')) {
            formatted = data.replace(/>/g, '>\n').replace(/</g, '\n<').split('\n').filter(l => l.trim()).join('\n');
        }

        if (searchTerm.trim()) {
            const lines = formatted.split('\n');
            const filtered = lines.filter(line => line.toLowerCase().includes(searchTerm.toLowerCase()));
            return filtered.length > 0 ? filtered.join('\n') : '// No matches found for: ' + searchTerm;
        }

        return formatted;
    };

    if (loading) {
        return (
            <div className="section-wrapper premium-box">
                <div className="section-header-bar"><div className="tab-link active">RESPONSE</div></div>
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Processing data...</p>
                </div>
            </div>
        );
    }

    if (!response) return null;

    return (
        <div className="section-wrapper premium-box">
            <div className="section-header-bar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div className="tab-link label">RESPONSE</div>
                    <div className="tab-group">
                        <span className={`tab-link ${activeTab === 'body' ? 'active' : ''}`} onClick={() => { setActiveTab('body'); setShowSnippet(false); }}>Preview</span>
                        <span className={`tab-link ${activeTab === 'headers' ? 'active' : ''}`} onClick={() => { setActiveTab('headers'); setShowSnippet(false); }}>Headers</span>
                        <span className={`tab-link ${activeTab === 'debug' ? 'active' : ''}`} onClick={() => { setActiveTab('debug'); setShowSnippet(false); }}>Trace</span>
                        <span className={`tab-link ${showSnippet ? 'active' : ''}`} onClick={() => setShowSnippet(!showSnippet)} style={{ color: '#3b82f6' }}>Snippet</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {showSearch && (
                        <input
                            className="kv-clean-input"
                            placeholder="Filter lines..."
                            style={{ width: '140px', height: '28px', fontSize: '0.65rem', padding: '0 10px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    )}
                    <button className="send-trigger" onClick={() => setShowSearch(!showSearch)} title="Filter Response"><IconSearch /></button>
                    <button className="send-trigger" onClick={handleDownload} title="Download Response"><IconDownload /></button>

                    <div style={{ display: 'flex', gap: '8px', fontSize: '0.7rem', fontWeight: 700, marginLeft: '4px' }}>
                        <span style={{ color: response.status >= 400 ? '#ef4444' : '#10b981' }}>{response.status}</span>
                        <span style={{ color: 'var(--text-dim)' }}>{response.time}ms</span>
                    </div>

                    <button
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}
                        onClick={() => copyToClipboard()}
                    >
                        {copied ? <span style={{ fontSize: '0.6rem', color: '#10b981' }}>COPIED</span> : <IconCopy />}
                    </button>
                </div>
            </div>

            <div className="box-body" style={{ position: 'relative' }}>
                {showSnippet && (
                    <div className="snippet-panel" style={{ marginBottom: '24px', border: '1.5px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                            <span className={`tab-link ${snippetType === 'js' ? 'active' : ''}`} onClick={() => setSnippetType('js')}>JavaScript</span>
                            <span className={`tab-link ${snippetType === 'curl' ? 'active' : ''}`} onClick={() => setSnippetType('curl')}>cURL</span>
                            <span className={`tab-link ${snippetType === 'ts' ? 'active' : ''}`} onClick={() => setSnippetType('ts')}>TypeScript</span>
                        </div>
                        <pre style={{ whiteSpace: 'pre-wrap', color: '#e2e2e7', fontSize: '0.75rem' }}>{generateSnippet()}</pre>
                        <div className="snippet-copy" onClick={() => copyToClipboard(generateSnippet())}><IconCopy /></div>
                    </div>
                )}

                <div className="response-scroll-area">
                    {activeTab === 'body' && (
                        <div style={{ whiteSpace: 'pre', overflowX: 'auto', color: '#e2e2e7', fontSize: '0.8rem', lineHeight: '1.6' }}>
                            {formatResponse(response.data)}
                        </div>
                    )}

                    {activeTab === 'headers' && (
                        <div style={{ opacity: 0.9, whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono', fontSize: '0.8rem' }}>
                            {JSON.stringify(response.headers, null, 2)}
                        </div>
                    )}

                    {activeTab === 'debug' && (
                        <div style={{ opacity: 0.8 }}>
                            <div style={{ marginBottom: '12px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>INTERNAL TRACE</div>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                                {JSON.stringify({
                                    status: response.status,
                                    timing: `${response.time}ms`,
                                    timestamp: new Date().toLocaleTimeString(),
                                    payload_size: `${new Blob([JSON.stringify(response.data)]).size} bytes`,
                                    content_type: response.headers?.['content-type'] || 'unknown'
                                }, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResponsePanel;
