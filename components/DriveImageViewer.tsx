'use client'

interface DriveImageViewerProps {
  url: string
  alt?: string
  className?: string
}

/**
 * Extract file ID from Google Drive URL
 */
function extractFileId(driveUrl: string): string | null {
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /file\/d\/([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = driveUrl.match(pattern)
    if (match) return match[1]
  }

  return null
}

export default function DriveImageViewer({ url, alt = 'Cover image', className = '' }: DriveImageViewerProps) {
  const fileId = extractFileId(url)

  if (!fileId) {
    return (
      <div className={`w-full aspect-video bg-muted rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <p className="text-muted-foreground">Invalid image URL</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Please provide a valid Google Drive link
          </p>
        </div>
      </div>
    )
  }

  // Google Drive thumbnail API - works for all image types including PNG
  const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={alt}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}
