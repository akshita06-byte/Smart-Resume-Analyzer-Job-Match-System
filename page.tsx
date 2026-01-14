"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Zap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import UploadSection from "@/components/upload-section"
import ResultsDisplay from "@/components/results-display"

export default function MatcherPage() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumes, setResumes] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleResumeUpload = (files: File[]) => {
    setResumes(files)
    setError(null)
  }

  const handleScreening = async () => {
    if (!jobDescription.trim() || resumes.length === 0) {
      setError("Please provide a job description and upload at least one resume")
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)
    setSuccessMessage(null)

    try {
      const formData = new FormData()
      formData.append("jobDescription", jobDescription)
      resumes.forEach((file, index) => {
        formData.append(`resume_${index}`, file)
      })

      const response = await fetch("/api/screen-resumes", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to screen resumes")
      }

      const data = await response.json()
      setResults(data)
      setSuccessMessage(`Successfully analyzed ${resumes.length} resume(s). Top candidates are ranked below.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Resume Matcher</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {results ? (
          <>
            {successMessage && (
              <Card className="p-4 mb-6 bg-green-50 border border-green-200 dark:bg-green-950 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">{successMessage}</p>
              </Card>
            )}
            <ResultsDisplay results={results} />
            <div className="text-center mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  setResults(null)
                  setJobDescription("")
                  setResumes([])
                  setSuccessMessage(null)
                }}
              >
                Screen More Resumes
              </Button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Job Description Section */}
            <Card className="p-8 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Job Description</h2>
              <Textarea
                placeholder="Paste the job description here. Include requirements, responsibilities, and preferred qualifications..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-64 resize-none"
              />
            </Card>

            {/* Resume Upload Section */}
            <Card className="p-8 border border-border">
              <h2 className="text-xl font-semibold text-foreground mb-4">Upload Resumes</h2>
              <UploadSection onUpload={handleResumeUpload} />

              {resumes.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-2">
                    {resumes.length} file{resumes.length !== 1 ? "s" : ""} selected
                  </h3>
                  <div className="space-y-2">
                    {resumes.map((file, index) => (
                      <div
                        key={index}
                        className="text-sm text-muted-foreground bg-muted p-2 rounded flex justify-between items-center"
                      >
                        <span>{file.name}</span>
                        <button
                          onClick={() => setResumes(resumes.filter((_, i) => i !== index))}
                          className="text-xs text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <Card className="p-4 mt-6 bg-destructive/10 border border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {/* Action Button */}
        {!results && (
          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              onClick={handleScreening}
              disabled={isLoading || !jobDescription.trim() || resumes.length === 0}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 animate-spin" />
                  Analyzing with Grok AI...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Screen Resumes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
