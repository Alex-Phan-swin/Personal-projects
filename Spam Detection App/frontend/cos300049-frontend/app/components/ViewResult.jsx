import DBScanGraph from "@/app/components/DBScanGraph";
import SpamPercentagePie from "@/app/components/SpamPercentagePie";
import DBScanHeader from "@/app/components/DBScanHeader";
import {useState} from "react";

export default function ViewResult(props) {
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);

    const spamChance = props.data["spamChance"] * 100;
    const isSpam = props.data["label"] === 1;

    const saveResults = async() => {
        setIsSaving(true);
        setSaveError(null);

        try {
            const res = await fetch("http://localhost:8000/api/saveresult", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(props.data)
            });

            if (res.status === 200) {
                props.setState(3);
            } else {
                throw new Error("Failed to save result");
            }
        } catch (error) {
            setSaveError(error.message);
        } finally {
            setIsSaving(false);
        }
    }

    const features = props.data.visualisations.features;

    const featuresList = [
        {
            icon: "🔗",
            label: "URLs Detected",
            value: features.urls,
            description: "Number of links found in the email",
            format: (v) => v.toString()
        },
        {
            icon: "🔤",
            label: "Alphanumeric Content",
            value: features.non_alphanumeric_punctuation_coefficient,
            description: "Percentage of characters that are alphanumeric or punctuation",
            format: (v) => `${Math.round(v * 100)}%`
        },
        {
            icon: "📧",
            label: "Email in Name Match",
            value: features.email_in_name,
            description: "How many characters from the email address match the sender name",
            format: (v) => `${Math.round(v * 100)}%`
        },
        {
            icon: "🔞",
            label: "Sexual Content",
            value: features.contains_sexual_word,
            description: "Whether the email contains potentially inappropriate words",
            format: (v) => v ? "Detected" : "Not Detected",
            isBoolean: true
        },
        {
            icon: "🔠",
            label: "Capital Letters",
            value: features.capital_coefficient,
            description: "Percentage of letters that are capitalized",
            format: (v) => `${Math.round(v * 100)}%`
        },
        {
            icon: "📏",
            label: "Email Length",
            value: features.email_length,
            description: "Total number of characters in the email body",
            format: (v) => `${v} chars`
        },
        {
            icon: "🌐",
            label: "Domain Matching",
            value: features.domain_matches,
            description: "Whether links match the sender's domain",
            format: (v) => v ? "Matched" : "Not Matched",
            isBoolean: true,
            show: features.urls > 0
        },
        {
            icon: "⬜",
            label: "Whitespace Density",
            value: features.whitespace_coefficient,
            description: "Percentage of characters that are not whitespace",
            format: (v) => `${Math.round(v * 100)}%`
        },
        {
            icon: "💰",
            label: "Currency References",
            value: features.contains_currency,
            description: "Whether the email contains currency words or symbols",
            format: (v) => v ? "Detected" : "Not Detected",
            isBoolean: true
        },
        {
            icon: "🔀",
            label: "Obfuscated Words",
            value: features.contains_obfuscated_word,
            description: "Whether the email contains disguised words (e.g., m0ney, s3x)",
            format: (v) => v ? "Detected" : "Not Detected",
            isBoolean: true
        }
    ];

    return (
        <div style={{maxWidth: '1200px', margin: '0 auto'}}>
            <button 
                onClick={() => props.setState(0)} 
                className="secondary"
                style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem'}}
            >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Home
            </button>

            <div className="card" style={{marginBottom: '2rem', textAlign: 'center'}}>
                <div style={{fontSize: '4rem', marginBottom: '1rem'}}>
                    {isSpam ? '⚠️' : '✅'}
                </div>
                
                <h2 style={{
                    fontSize: '2rem', 
                    fontWeight: '700', 
                    marginBottom: '0.5rem',
                    color: isSpam ? 'var(--accent-danger)' : 'var(--accent-success)'
                }}>
                    {isSpam ? "Likely Spam" : "Likely Legitimate"}
                </h2>
                
                <p style={{fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem'}}>
                    {isSpam 
                        ? "This email exhibits several spam characteristics" 
                        : "This email appears to be legitimate"}
                </p>

                <div style={{
                    display: 'inline-block',
                    padding: '1.5rem 3rem',
                    background: isSpam ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    border: `2px solid ${isSpam ? 'var(--accent-danger)' : 'var(--accent-success)'}`,
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: '1rem'
                }}>
                    <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                        Spam Probability
                    </div>
                    <div style={{fontSize: '3rem', fontWeight: '700', color: isSpam ? 'var(--accent-danger)' : 'var(--accent-success)'}}>
                        {spamChance.toFixed(1)}%
                    </div>
                </div>

                <div className="progress-bar" style={{maxWidth: '400px', margin: '1.5rem auto 0'}}>
                    <div 
                        className={`progress-fill ${isSpam ? 'danger' : 'success'}`}
                        style={{width: `${spamChance}%`}}
                    ></div>
                </div>
            </div>

            {saveError && (
                <div className="alert alert-error fade-in" style={{marginBottom: '1.5rem'}}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{minWidth: '20px', minHeight: '20px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Failed to save results: {saveError}</span>
                </div>
            )}

            <div className="card" style={{marginBottom: '2rem'}}>
                <h3 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)'}}>
                    📊 Feature Analysis
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem'}}>
                    {featuresList.filter(f => f.show !== false).map((feature, index) => (
                        <div 
                            key={index}
                            className="stat-card"
                            title={feature.description}
                        >
                            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem'}}>
                                <div style={{fontSize: '1.5rem'}}>{feature.icon}</div>
                                <div className="stat-label" style={{margin: 0}}>{feature.label}</div>
                            </div>
                            <div className="stat-value" style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
                                {feature.format(feature.value)}
                            </div>
                            <div style={{fontSize: '0.875rem', color: 'var(--text-muted)'}}>
                                {feature.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card" style={{marginBottom: '2rem', overflowX: 'auto'}}>
                <h3 style={{fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)'}}>
                    🧬 Cluster Analysis
                </h3>
                <DBScanHeader clusterData={props.data.visualisations.mini_clusters.clusters}/>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>

                <div className="card">
                    <h3 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)'}}>
                        DBSCAN Cluster Visualization
                    </h3>
                    <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>
                        This graph shows how the analyzed email compares to known spam patterns using density-based clustering.
                    </p>
                    <div style={{width: '100%', aspectRatio: '1', minHeight: '400px'}}>
                        <DBScanGraph data={props.data["visualisations"]["mini_clusters"]} />
                    </div>
                </div>

                <div className="card">
                    <h3 style={{fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)'}}>
                        Spam Probability Distribution
                    </h3>
                    <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>
                        Visual representation of the spam vs. legitimate classification probability.
                    </p>
                    <div style={{width: '100%', aspectRatio: '1', minHeight: '400px'}}>
                        <SpamPercentagePie spamChance={props.data["spamChance"]} />
                    </div>
                </div>
            </div>

            <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
                {props.state === 2 && (
                    <button 
                        onClick={saveResults}
                        disabled={isSaving}
                        className="success"
                        style={{flex: '1', minWidth: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                    >
                        {isSaving ? (
                            <>
                                <div className="spinner"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                </svg>
                                Save to History
                            </>
                        )}
                    </button>
                )}
                <button 
                    onClick={() => props.setState(0)}
                    className="secondary"
                    style={{flex: '1', minWidth: '200px'}}
                >
                    Analyze Another Email
                </button>
            </div>
        </div>
    );
}