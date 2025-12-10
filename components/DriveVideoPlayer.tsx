'use client'

interface DriveVideoPlayerProps {
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

export default function DriveVideoPlayer({ url, title }: DriveVideoPlayerProps) {
  const fileId = extractFileId(url)

  if (!fileId) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground" style={{ fontFamily: 'var(--font-body)' }}>
            Invalid video URL
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
      <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="autoplay; fullscreen"
          allowFullScreen
          title={title || 'Module Video'}
        />
      </div>
      {title && (
        <p className="mt-4 text-muted-foreground text-sm" style={{ fontFamily: 'var(--font-body)' }}>
          {title}
        </p>
      )}
    </div>
  )
}
