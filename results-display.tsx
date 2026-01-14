"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Zap, Download, BarChart3 } from "lucide-react"
import { useState } from "react"

interface Match {
  candidateName: string
  matchScore: number
  keyStrengths: string[]
  gapsIdentified: string[]
  recommendation: string
}

interface ResultsDisplayProps {
  results: {
    matches: Match[]
    summary: string
    comparisonAnalysis: string
  }
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [showComparison, setShowComparison] = useState(false)
  const sortedMatches = [...results.matches].sort((a, b) => b.matchScore - a.matchScore)

  const exportToCSV = () => {
    const headers = ["Rank", "Candidate Name", "Match Score", "Key Strengths", "Gaps Identified", "Recommendation"]
    const rows = sortedMatches.map((match, index) => [
      index + 1,
      match.candidateName,
      `${match.matchScore}%`,
      match.keyStrengths.join("; "),
      match.gapsIdentified.join("; "),
      match.recommendation,
    ])

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `resume-screening-results-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <Card className="p-6 bg-card border border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 flex items-start gap-3">
            <Zap className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-foreground mb-2">AI Analysis Summary</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{results.summary}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Candidate Rankings</h2>
          <div className="flex gap-2">
            <Button
              variant={showComparison ? "default" : "outline"}
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              {showComparison ? "Hide Comparison" : "Show Comparison"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {showComparison && (
          <Card className="p-6 bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Candidate Comparison Analysis</h3>
                <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                  {results.comparisonAnalysis}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Candidate Matches */}
      <div className="space-y-4">
        {sortedMatches.map((match, index) => (
          <Card key={index} className="p-6 border border-border hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground">{match.candidateName}</h3>
                  <Badge variant="secondary">#{index + 1}</Badge>
                  {match.matchScore >= 80 && <Badge className="bg-green-600 text-green-50">Top Match</Badge>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">{match.matchScore}%</div>
                <p className="text-xs text-muted-foreground">Match Score</p>
              </div>
            </div>

            {/* Match Score Bar */}
            <div className="mb-4 bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${match.matchScore}%` }}
              />
            </div>

            {/* Key Strengths */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-medium text-foreground text-sm">Key Strengths</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {match.keyStrengths.map((strength, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300"
                  >
                    {strength}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Gaps Identified */}
            {match.gapsIdentified.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span className="font-medium text-foreground text-sm">Gaps to Address</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.gapsIdentified.map((gap, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300"
                    >
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Recommendation: </span>
                {match.recommendation}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
