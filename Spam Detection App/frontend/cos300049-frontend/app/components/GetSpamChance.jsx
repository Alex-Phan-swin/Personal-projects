"use client"
import {useEffect, useState} from "react";
import Ajv from "ajv";

const ajv = new Ajv({ allErrors: true, strict: false });

const schema = {
    type: "object",
    required: ["label", "spamChance", "visualisations"],
    properties: {
        label: { type: "number" },
        spamChance: { type: "number" },
        visualisations: {
            type: "object",
            required: ["features", "mini_clusters"],
            properties: {
                features: {
                    type: "object",
                    properties: {
                        urls: { type: "number" },
                        non_alphanumeric_punctuation_coefficient: { type: "number" },
                        email_in_name: { type: "number" },
                        contains_sexual_word: { type: "number" },
                        capital_coefficient: { type: "number" },
                        email_length: { type: "number" },
                        domain_matches: { type: "number" },
                        whitespace_coefficient: { type: "number" },
                        contains_currency: { type: "number" },
                        contains_obfuscated_word: { type: "number" }
                    },
                    additionalProperties: false
                },
                mini_clusters: {
                    type: "object",
                    properties: {
                        clusters: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["clusterId", "avgSpam", "points", "avgUrls", "avgNAPC", "avgEmailInName", "avgContainsSexualWord", "avgCapital", "avgEmailLength", "avgWhitespace", "avgContainsCurrency"],
                                properties: {
                                    clusterId: { type: "number" },
                                    avgSpam: { type: "number" },
                                    avgUrls: { type: "number" },
                                    avgNAPC: { type: "number" },
                                    avgEmailInName: { type: "number" },
                                    avgContainsSexualWord: { type: "number" },
                                    avgCapital: { type: "number" },
                                    avgEmailLength: { type: "number" },
                                    avgWhitespace: {type: "number" },
                                    avgContainsCurrency: { type: "number" },
                                    points: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            required: ["x", "y", "spamChance"],
                                            properties: {
                                                x: { type: "number" },
                                                y: { type: "number" },
                                                spamChance: { type: "number" }
                                            },
                                            additionalProperties: false
                                        }
                                    }
                                },
                                additionalProperties: false
                            }
                        },
                    },
                    additionalProperties: false
                }
            },
            additionalProperties: false
        }
    },
    additionalProperties: false
};

const validate = ajv.compile(schema);
const emailPattern = /\b[A-Z0-9._%+\-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

export default function GetSpamChance(props) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");

    const [emailError, setEmailError] = useState(false);
    const [requestError, setRequestError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const allFieldsFilled = email.trim() && name.trim() && subject.trim() && body.trim();
    const hasEmptyFields = !allFieldsFilled;

    const submitEmail = async () => {
        if (!emailPattern.test(email)) {
            setEmailError(true);
            return;
        } else {
            setEmailError(false);
        }

        setIsSubmitting(true);
        setRequestError(null);

        const myEmail = `${name} <${email}>`;
        const searchParams = new URLSearchParams({
            email: myEmail,
            body,
            subject,
            advanced: "1"
        });

        try {
            const response = await fetch(`http://localhost:8000/api/prediction?${searchParams.toString()}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("application/json")) {
                throw new Error("Invalid response format. Please check if the backend is running correctly.");
            }

            const data = await response.json();

            if (!validate(data)) {
                console.error("Validation errors:", validate.errors);
                throw new Error("Response data validation failed");
            }

            props.setData(data);
            props.setState(2);
        } catch (err) {
            setRequestError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card" style={{maxWidth: '900px', margin: '0 auto'}}>
            <div style={{marginBottom: '2rem'}}>
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

                <h2 style={{fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-primary)'}}>
                    Analyze Email for Spam
                </h2>
                <p style={{color: 'var(--text-secondary)'}}>
                    Enter the email details below to analyze it for spam indicators using our ML model.
                </p>
            </div>

            {requestError && (
                <div className="alert alert-error fade-in" style={{marginBottom: '1.5rem'}}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{minWidth: '20px', minHeight: '20px'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <strong>Request Failed</strong>
                        <div style={{fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9}}>
                            {requestError}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={(e) => {e.preventDefault(); submitEmail();}} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                {/* Email Input */}
                <div>
                    <label htmlFor="email">
                        Sender Email Address
                        <span style={{color: 'var(--accent-danger)', marginLeft: '0.25rem'}}>*</span>
                    </label>
                    <input 
                        id="email"
                        type="email"
                        onChange={(e) => setEmail(e.target.value)} 
                        value={email} 
                        placeholder="sender@example.com"
                        disabled={isSubmitting}
                    />
                    {emailError && (
                        <div style={{marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            Invalid email format. Please use format: user@domain.com
                        </div>
                    )}
                </div>

                <div>
                    <label htmlFor="name">
                        Sender Name
                        <span style={{color: 'var(--accent-danger)', marginLeft: '0.25rem'}}>*</span>
                    </label>
                    <input 
                        id="name"
                        type="text"
                        onChange={(e) => setName(e.target.value)} 
                        value={name} 
                        placeholder="John Doe"
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label htmlFor="subject">
                        Email Subject
                        <span style={{color: 'var(--accent-danger)', marginLeft: '0.25rem'}}>*</span>
                    </label>
                    <input 
                        id="subject"
                        type="text"
                        onChange={(e) => setSubject(e.target.value)} 
                        value={subject} 
                        placeholder="RE: Important message"
                        disabled={isSubmitting}
                    />
                </div>

                <div>
                    <label htmlFor="body">
                        Email Body
                        <span style={{color: 'var(--accent-danger)', marginLeft: '0.25rem'}}>*</span>
                    </label>
                    <textarea 
                        id="body"
                        onChange={(e) => setBody(e.target.value)} 
                        value={body} 
                        placeholder="Enter the full email content here..."
                        disabled={isSubmitting}
                    />
                    <div style={{marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)'}}>
                        {body.length} characters
                    </div>
                </div>

                {hasEmptyFields && !isSubmitting && (
                    <div className="alert alert-warning">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{minWidth: '20px', minHeight: '20px'}}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Please fill in all required fields to continue</span>
                    </div>
                )}

                <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || !allFieldsFilled}
                        style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="spinner"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Analyze Email
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div style={{marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.1)'}}>
                <h3 style={{fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem'}}>
                    💡 Analysis Information
                </h3>
                <p style={{fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0}}>
                    Our ML model analyzes multiple factors including URL patterns, content characteristics, 
                    sender information, and linguistic patterns to determine spam probability. 
                    Results include detailed visualizations and cluster analysis.
                </p>
            </div>
        </div>
    );
}