import React, { useState } from 'react';

const ResponsePanel = ({ response, loading }) => {
    const [activeTab, setActiveTab] = useState('body');
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        if (!response?.data) return;
        const content = activeTab === 'body'
            ? (typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data)
            : JSON.stringify(response.headers, null, 2);

        navigator.clipboard.writeText(content).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const IconCopy = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M18.327 7.286h-8.044a1.93 1.93 0 0 0-1.925 1.938v10.088c0 1.07.862 1.938 1.925 1.938h8.044a1.93 1.93 0 0 0 1.925-1.938V9.224c0-1.07-.862-1.938-1.925-1.938" /><path d="M15.642 7.286V4.688c0-.514-.203-1.007-.564-1.37a1.92 1.92 0 0 0-1.361-.568H5.673c-.51 0-1 .204-1.36.568a1.95 1.95 0 0 0-.565 1.37v10.088c0 .514.203 1.007.564 1.37s.85.568 1.361.568h2.685" /></g></svg>
    );

    const formatResponse = (data) => {
        if (typeof data === 'object') return JSON.stringify(data, null, 2);

        // Simple HTML Prettifier attempt if it looks like HTML
        if (typeof data === 'string' && data.trim().startsWith('<')) {
            let indent = 0;
            return data
                .replace(/(>)(<)(\/*)/g, '$1\r\n$2$3')
                .split('\r\n')
                .map(line => {
                    let spaces = 0;
                    if (line.match(/<\/.+>/)) indent--;
                    spaces = indent;
                    if (line.match(/<[^!/].+>/) && !line.match(/<.+\/>/)) indent++;
                    return '  '.repeat(Math.max(0, spaces)) + line;
                })
                .join('\n');
        }
        return data;
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div className="tab-link label">RESPONSE</div>
                    <div className="tab-group">
                        <span className={`tab-link ${activeTab === 'body' ? 'active' : ''}`} onClick={() => setActiveTab('body')}>Preview</span>
                        <span className={`tab-link ${activeTab === 'headers' ? 'active' : ''}`} onClick={() => setActiveTab('headers')}>Headers</span>
                        <span className={`tab-link ${activeTab === 'debug' ? 'active' : ''}`} onClick={() => setActiveTab('debug')}>Trace</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', fontWeight: 700 }}>
                        <span style={{ color: response.status >= 400 ? '#ef4444' : '#10b981' }}>{response.status}</span>
                        <span style={{ color: 'var(--text-dim)' }}>{response.time}ms</span>
                    </div>
                    <button
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex' }}
                        onClick={copyToClipboard}
                    >
                        {copied ? <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>COPIED</span> : <IconCopy />}
                    </button>
                </div>
            </div>

            <div className="box-body">
                <div className="response-scroll-area">
                    {activeTab === 'body' && (
                        <div style={{ whiteSpace: 'pre', overflowX: 'auto', color: '#e2e2e7', fontSize: '0.8rem', lineHeight: '1.5' }}>
                            {formatResponse(response.data)}
                        </div>
                    )}

                    {activeTab === 'headers' && (
                        <div style={{ opacity: 0.9, whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(response.headers, null, 2)}
                        </div>
                    )}

                    {activeTab === 'debug' && (
                        <div style={{ opacity: 0.8 }}>
                            <div style={{ marginBottom: '12px', fontSize: '0.7rem', color: 'var(--text-dim)' }}>DEBUGGING RUNTIME INFO</div>
                            <pre style={{ whiteSpace: 'pre-wrap' }}>
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
