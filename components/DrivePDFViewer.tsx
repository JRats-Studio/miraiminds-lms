'use client'

interface DrivePDFViewerProps {
  url: string
  title?: string
}

/**
 * Extract file ID from Google Drive URL
 * Supports various Google Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view
 * - https://drive.google.com/file/d/FILE_ID/preview
 * - https://drive.google.com/open?id=FILE_ID
 */
function extractFileId(driveUrl: string): string | null {
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,           // /d/FILE_ID
    /id=([a-zA-Z0-9_-]+)/,             // id=FILE_ID
    /file\/d\/([a-zA-Z0-9_-]+)/,       // file/d/FILE_ID
  ]

  for (const pattern of patterns) {
    const match = driveUrl.match(pattern)
    if (match) return match[1]
  }

  return null
}

export default function DrivePDFViewer({ url, title }: DrivePDFViewerProps) {
  const fileId = extractFileId(url)

  if (!fileId) {
    return (
      <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
            Invalid PDF URL
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Please provide a valid Google Drive link
          </p>
        </div>
      </div>
    )
  }

  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`

  return (
    <div className="w-full">
      {title && (
        <h3
          className="text-xl font-semibold text-primary mb-4"
          style={{ fontFamily: 'var(--font-header)' }}
        >
          {title}
        </h3>
      )}
      <div className="w-full h-[800px] bg-white rounded-lg shadow-lg overflow-hidden border-2 border-accent">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={title || 'Lesson PDF'}
        />
      </div>
    </div>
  )
}
