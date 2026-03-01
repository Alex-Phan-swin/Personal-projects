"use client"
import GetSpamChance from "@/app/components/GetSpamChance";
import {useEffect, useState} from "react";
import ViewResult from "@/app/components/ViewResult";
import ResultsPages from "@/app/components/ResultsPages";

// state 0 = home page
// state 1 = data input page
// state 2 = data view page
// state 3 = data list page
// state 4 = view saved result
export default function Home() {
    const [data, setData] = useState<any>(null);
    const [state, setState] = useState<number>(0);
    const [healthy, setHealthy] = useState<boolean | null>(null);
    const [healthData, setHealthData] = useState<any>(null);

    const getHealthy = async () => {
        try {
            const res = await fetch("http://localhost:8000/health");
            if (!res.ok) throw new Error("Response not ok");

            const json = await res.json();
            // Consider it healthy if model, scaler, and cluster_info are working
            // Database can be optional for basic email analysis
            const coreHealthy = json.model && json.scaler && json.cluster_info;
            setHealthy(coreHealthy);
            setHealthData(json);
        } catch (error) {
            setHealthy(false);
            setTimeout(getHealthy, 2000);
        }
    };

    useEffect(() => {
        getHealthy();
    }, []);

    return (
        <div className="container">
            {healthy === false && (
                <div className="alert alert-error fade-in" style={{marginBottom: '2rem'}}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{minWidth: '20px', minHeight: '20px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <strong>Backend Connection Error</strong>
                        {healthData ? (
                            <div style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
                                Model: {healthData["model"] ? "✓" : "✗"} | 
                                Scaler: {healthData["scaler"] ? "✓" : "✗"} | 
                                Cluster Info: {healthData["cluster_info"] ? "✓" : "✗"} | 
                                Database: {healthData["db"] ? "✓" : "✗"}
                            </div>
                        ) : (
                            <div style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
                                Cannot connect to backend — retrying...
                            </div>
                        )}
                    </div>
                </div>
            )}
            {healthy && state === 0 && (
                <div className="alert alert-success fade-in" style={{marginBottom: '2rem'}}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{minWidth: '20px', minHeight: '20px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Backend connected • All systems operational</span>
                </div>
            )}

            {state === 0 && (
                <header style={{justifyContent: 'center', textAlign: 'center'}}>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%'}}>
                        <img src="/icon.png" alt="Logo" style={{width: '150px', height: '150px'}} />
                        <div>
                            <h1>Spam Detection ML System</h1>
                            <p className="lead">
                                Advanced machine learning powered email spam detection
                            </p>
                            <p className="lead" style={{fontSize: '0.9rem', marginTop: '0.25rem'}}>
                                By Samson Kemp, Sharjeel Wasim, and Alex Phan
                            </p>
                        </div>
                    </div>
                </header>
            )}

            {state === 0 && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: '1000px', margin: '0 auto'}}>
                    {/* Main Actions Card */}
                    <div className="card" style={{padding: '3rem 2rem'}}>
                        <h2 style={{
                            fontSize: '1.5rem', 
                            fontWeight: '700', 
                            textAlign: 'center', 
                            marginBottom: '1rem',
                            color: 'var(--text-primary)'
                        }}>
                            What would you like to do?
                        </h2>
                        <p style={{
                            fontSize: '1rem', 
                            color: 'var(--text-secondary)', 
                            textAlign: 'center', 
                            marginBottom: '2.5rem',
                            lineHeight: '1.6'
                        }}>
                            Choose an option below to get started with spam detection
                        </p>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                            <button 
                                onClick={() => setState(1)}
                                disabled={!healthy}
                                style={{
                                    padding: '2rem',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    minHeight: '180px'
                                }}
                            >
                                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <div style={{textAlign: 'center'}}>
                                    <div style={{fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem'}}>Analyze New Email</div>
                                    <div style={{fontSize: '0.875rem', opacity: 0.85, color: 'var(--text-secondary)'}}>
                                        Check if an email is spam using ML analysis
                                    </div>
                                </div>
                            </button>
                            
                            <button 
                                onClick={() => setState(3)}
                                disabled={!healthy || !healthData?.db}
                                className="secondary"
                                style={{
                                    padding: '2rem',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    minHeight: '180px'
                                }}
                            >
                                <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div style={{textAlign: 'center'}}>
                                    <div style={{fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem'}}>View History</div>
                                    <div style={{fontSize: '0.875rem', opacity: 0.85}}>
                                        Browse previous spam detection results
                                    </div>
                                </div>
                            </button>
                        </div>

                        {!healthy && (
                            <div style={{
                                marginTop: '2rem',
                                padding: '1.5rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{color: 'var(--accent-danger)', fontWeight: '600', marginBottom: '0.5rem'}}>
                                    ⚠️ Backend Connection Required
                                </div>
                                <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                                    Please ensure the backend server is running at localhost:8000
                                </div>
                            </div>
                        )}
                        
                        {healthy && !healthData?.db && (
                            <div style={{
                                marginTop: '2rem',
                                padding: '1.5rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: 'var(--radius-md)',
                                textAlign: 'center'
                            }}>
                                <div style={{color: 'var(--accent-warning)', fontWeight: '600', marginBottom: '0.5rem'}}>
                                    ⚠️ Database Not Connected
                                </div>
                                <div style={{fontSize: '0.875rem', color: 'var(--text-secondary)'}}>
                                    Email analysis is available, but history features are disabled
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem'}}>
                        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🎯</div>
                            <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)'}}>
                                High Accuracy
                            </h3>
                            <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0}}>
                                Advanced ML model trained on extensive email datasets for reliable spam detection
                            </p>
                        </div>

                        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>📊</div>
                            <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)'}}>
                                Detailed Insights
                            </h3>
                            <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0}}>
                                Comprehensive feature analysis with visual cluster representations
                            </p>
                        </div>

                        <div className="card" style={{textAlign: 'center', padding: '2rem'}}>
                            <div style={{fontSize: '3rem', marginBottom: '1rem'}}>⚡</div>
                            <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)'}}>
                                Instant Results
                            </h3>
                            <p style={{fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0}}>
                                Real-time processing with immediate spam probability scores
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {state === 1 && <GetSpamChance setData={setData} setState={setState} />}

            {(state === 2 || state === 4) && <ViewResult data={data} setState={setState} state={state} />}

            {state === 3 && <ResultsPages setState={setState} setData={setData} />}

            {(state > 4 || state < 0) && (
                <div className="alert alert-error">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>A state error has occurred. Please refresh the page.</span>
                </div>
            )}
        </div>
    );
}